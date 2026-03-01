/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatAdminName } from '@/lib/format';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { createNotification } from '@/lib/notifications';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // 1. SÉCURITÉ CRON
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const today = new Date();
    
    // On cherche les baux qui finissent dans environ 7 mois (préavis légal de 6 mois + 1 mois de marge)
    const dateAlerte = new Date();
    dateAlerte.setMonth(today.getMonth() + 7);

    const finsDeBail = await prisma.locataire.findMany({
      where: {
        active: true,
        archived: false,
        dateFinBail: {
          lte: dateAlerte,
          gte: today
        }
      },
      include: { 
        bien: { 
          include: { proprietaire: true } 
        } 
      }
    });

    const report = [];

    for (const loc of finsDeBail) {
      const prop = loc.bien.proprietaire;
      const tenantDisplayName = formatAdminName(loc.prenom, loc.nom);
      const ownerDisplayName = formatAdminName(prop.firstName ||'', prop.lastName||'', prop.name);

      // 2. CRÉATION DE LA NOTIFICATION INTERNE (La cloche)
      await createNotification(prop.id, {
        title: "⚠️ Fin de bail approche",
        message: `Le contrat de ${tenantDisplayName} (${loc.bien.nom}) arrive à échéance prochainement.`,
        type: "ALERTE",
        link: `/locataires/${loc.id}`
      });

      // 3. ENVOI DE L'EMAIL AU PROPRIÉTAIRE (Design Pro)
      await resend.emails.send({
        from: 'LocAm Security <notifications@getlocam.com>',
        to: prop.email as string,
        subject: `🔔 Alerte : Fin de bail imminente - ${tenantDisplayName}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden;">
            <div style="background-color: #ef4444; padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 800;">Alerte Échéance de Bail</h1>
            </div>
            
            <div style="padding: 35px; background-color: #ffffff;">
              <p>Bonjour <strong>${ownerDisplayName}</strong>,</p>
              
              <p>Ceci est un rappel automatique concernant le contrat de location de votre locataire <strong>${tenantDisplayName}</strong> pour le logement :</p>
              
              <div style="background-color: #fff1f2; padding: 15px; border-radius: 12px; border: 1px solid #ffe4e6; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #e11d48;">${loc.bien.nom}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #9f1239;">Échéance prévue le : ${loc.dateFinBail?.toLocaleDateString('fr-FR')}</p>
              </div>

              <p style="font-size: 14px;"><strong>Rappel juridique :</strong> Pour les baux d'habitation (Loi ALUR), vous devez signifier un congé au locataire au moins <strong>6 mois avant cette date</strong> si vous souhaitez reprendre le logement ou le vendre.</p>
              
              <p style="font-size: 14px; margin-top: 10px;">Si vous ne réalisez aucune action, le bail sera <strong>reconduit tacitement</strong> pour la même durée.</p>

              <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.NEXTAUTH_URL}/locataires/${loc.id}" 
                   style="background-color: #1e293b; color: white; padding: 14px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                   Gérer le dossier locataire
                </a>
              </div>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Assistant LocAm Security</p>
              <div style="margin-top: 10px;">
                <a href="${process.env.NEXTAUTH_URL}" style="font-size: 10px; color: #2563eb; text-decoration: none; font-weight: bold;">www.getlocam.com</a>
              </div>
            </div>
          </div>
        `
      });

      report.push({ email: prop.email, tenant: tenantDisplayName, status: 'notified' });
    }

    return NextResponse.json({ success: true, processed: finsDeBail.length, report });

  } catch (error) {
    console.error("Erreur Cron Alerte Bail:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}