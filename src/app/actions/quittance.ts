'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalizeFirstLetter, formatAdminName } from '@/lib/format';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { QuittanceLoyer } from "@/components/templates/QuittanceLoyer";
import { revalidatePath } from "next/cache";
import { createNotification } from '@/lib/notifications';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function confirmerPaiementEtEnvoyerQuittance(locataireId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non authentifié");
  const userId = (session.user as any).id;

  try {
    // 1. Récupérer les données du contrat (Locataire)
    const loc = await prisma.locataire.findUnique({
      where: { id: locataireId },
      include: { 
        bien: { include: { proprietaire: true } } 
      }
    });

    if (!loc) throw new Error("Contrat introuvable");

    // SÉCURITÉ : Vérifier que le bailleur est bien le propriétaire du bien concerné
    if (loc.bien.proprietaireId !== userId) {
      throw new Error("Action non autorisée sur ce contrat");
    }

    const today = new Date();
    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisIndex = today.getMonth(); // 0-11
    const moisNom = moisFr[moisIndex];
    const moisNum = moisIndex + 1;
    const annee = today.getFullYear();

    // 2. ENREGISTRER LE PAIEMENT EN BASE (Sécurité doublon via upsert)
    // On utilise la clé composite unique [locataireId, mois, annee]
    await prisma.paiement.upsert({
      where: {
        locataireId_mois_annee: {
          locataireId: loc.id,
          mois: moisNum,
          annee: annee,
        }
      },
      update: { datePaiement: new Date() }, // Si déjà payé, on met juste à jour la date
      create: {
        locataireId: loc.id,
        mois: moisNum,
        annee: annee,
        datePaiement: new Date(),
      }
    });

    // 3. GÉNÉRER LE PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuittanceLoyer, {
        locataire: loc,
        proprietaire: loc.bien.proprietaire,
        mois: moisNom,
        annee: annee
      })
    );

    const bailleurName = formatAdminName(
      loc.bien.proprietaire.firstName||'', 
      loc.bien.proprietaire.lastName ||'', 
      loc.bien.proprietaire.name
    );

    // 4. ENVOYER L'EMAIL AVEC FOOTER PRO
    await resend.emails.send({
      from: 'LocAm Gestion <gestion@getlocam.com>',
      to: loc.email,
      subject: `Quittance de loyer - ${moisNom} ${annee}`,
      attachments: [{
        filename: `Quittance_${loc.nom.toUpperCase()}_${moisNom}.pdf`,
        content: Buffer.from(pdfBuffer),
      }],
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Paiement Reçu</h1>
          </div>
          <div style="padding: 30px;">
            <p>Bonjour <strong>${capitalizeFirstLetter(loc.prenom)}</strong>,</p>
            <p>Votre propriétaire, <strong>${bailleurName}</strong>, confirme avoir reçu votre règlement concernant le loyer du mois de <strong>${moisNom} ${annee}</strong>.</p>
            <p>Votre quittance de loyer officielle est disponible en pièce jointe de cet e-mail.</p>
            
            <div style="margin-top: 30px; text-align: center;">
               <a href="${process.env.NEXTAUTH_URL}/tenant/dashboard" style="background-color: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Accéder à mon espace locataire</a>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: bold;">LocAm — Gestion Locative Simplifiée</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #cbd5e1;">Ceci est un message automatique. Pour toute question, contactez directement votre bailleur.</p>
            <div style="margin-top: 10px;">
              <a href="${process.env.NEXTAUTH_URL}" style="font-size: 10px; color: #2563eb; text-decoration: none;">www.getlocam.com</a>
            </div>
          </div>
        </div>
      `
    });

    // 5. NOTIFICATION INTERNE POUR LE LOCATAIRE (Si compte lié)
    if (loc.userId) {
        await createNotification(loc.userId, {
            title: "📄 Nouvelle quittance disponible",
            message: `Votre quittance pour le mois de ${moisNom} est prête dans votre espace documents.`,
            type: "PAIEMENT",
            link: "/tenant/documents"
        });
    }

    revalidatePath(`/locataires/${locataireId}`);
    revalidatePath('/locataires');
    
    return { success: true };

  } catch (error: any) {
    console.error("Erreur confirmation paiement:", error);
    return { error: error.message || "Une erreur est survenue lors de la validation." };
  }
}