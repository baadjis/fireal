/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { QuittanceLoyer } from "@/components/templates/QuittanceLoyer";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function confirmerPaiementEtEnvoyerQuittance(locataireId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non authentifié");

  try {
    // 1. Récupérer les données
    const loc = await prisma.locataire.findUnique({
      where: { id: locataireId },
      include: { bien: { include: { proprietaire: true } } }
    });

    if (!loc) throw new Error("Locataire non trouvé");

    // Sécurité : vérifier que c'est bien le propriétaire qui clique
    if (loc.bien.proprietaireId !== (session.user as any).id) {
      throw new Error("Action non autorisée");
    }

    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisNom = moisFr[new Date().getMonth()];

    // 2. Générer la Quittance (Template QuittanceLoyer)
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuittanceLoyer, {
        locataire: loc,
        proprietaire: loc.bien.proprietaire,
        mois: moisNom,
        annee: new Date().getFullYear()
      })
    );

    // 3. Envoyer l'email de confirmation
    await resend.emails.send({
      from: 'LocaManager <gestion@votre-domaine.com>',
      to: loc.email,
      subject: `Quittance de loyer - ${moisNom}`,
      attachments: [{
        filename: `Quittance_${moisNom}.pdf`,
        content: Buffer.from(pdfBuffer),
      }],
      html: `
        <h3>Paiement bien reçu !</h3>
        <p>Bonjour ${loc.prenom}, nous vous confirmons la réception de votre loyer pour ${moisNom}. 
        Votre quittance est jointe à ce mail.</p>
      `
    });

    // 4. (Optionnel) Ici on pourrait enregistrer en base que le mois est payé
    
    revalidatePath('/locataires');
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}