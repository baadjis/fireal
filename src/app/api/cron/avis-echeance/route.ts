/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { AvisEcheance } from '@/components/templates/AvisEcheance';
import { QuittanceLoyer } from '@/components/templates/QuittanceLoyer'; // Import du 2ème template
import Stripe from 'stripe';

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27",
});

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const today = new Date();
    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisIndex = today.getMonth(); // 0-11
    const moisCourant = moisIndex + 1;  // 1-12 pour la DB
    const moisNom = moisFr[moisIndex];
    const annee = today.getFullYear();

    // 1. Récupération des locataires + leurs paiements du mois en cours
    const locataires = await prisma.locataire.findMany({
      where: { active: true, archived: false },
      include: { 
        bien: { include: { proprietaire: true } },
        paiements: {
          where: { mois: moisCourant, annee: annee }
        }
      }
    });

    const report = [];

    for (const loc of locataires) {
      try {
        const prop = loc.bien.proprietaire;
        const dejaPaye = loc.paiements.length > 0;
        let pdfBuffer;
        let emailSubject = "";
        let emailHtml = "";
        let filename = "";

        if (dejaPaye) {
          // --- CAS : DÉJÀ PAYÉ -> ENVOI QUITTANCE ---
          pdfBuffer = await renderToBuffer(
            React.createElement(QuittanceLoyer, {
              locataire: loc,
              proprietaire: prop,
              mois: moisNom,
              annee: annee
            })
          );
          emailSubject = `Quittance de loyer - ${moisNom} ${annee}`;
          filename = `Quittance_${loc.nom}_${moisNom}.pdf`;
          emailHtml = `
            <div style="font-family: sans-serif;">
              <p>Bonjour ${loc.prenom},</p>
              <p>Votre loyer pour <strong>${moisNom} ${annee}</strong> a bien été reçu. Vous trouverez votre quittance en pièce jointe.</p>
              <p>Merci et bonne journée,<br>${prop.name}</p>
            </div>
          `;
        } else {
          // --- CAS : NON PAYÉ -> ENVOI AVIS D'ÉCHÉANCE ---
          pdfBuffer = await renderToBuffer(
            React.createElement(AvisEcheance, {
              locataire: loc,
              proprietaire: prop,
              mois: moisNom,
              annee: annee
            })
          );
          emailSubject = `Avis d'échéance Loyer - ${moisNom} ${annee}`;
          filename = `Avis_Echeance_${moisNom}.pdf`;

          // Gestion du lien de paiement Stripe
          let lienPaiement = null;
          if ((prop.plan === "PRO" || prop.plan === "EXPERT") && prop.stripeConnectedId) {
            const session = await stripe.checkout.sessions.create({
              customer: loc.stripeCustomerId || undefined,
              customer_email: loc.stripeCustomerId ? undefined : loc.email,
              line_items: [{
                price_data: {
                  currency: 'eur',
                  product_data: { name: `Loyer ${moisNom} ${annee}` },
                  unit_amount: Math.round((loc.loyerHC + loc.charges) * 100),
                },
                quantity: 1,
              }],
              mode: 'payment',
              payment_intent_data: {
                application_fee_amount: 200, 
                transfer_data: { destination: prop.stripeConnectedId },
              },
              metadata: { locataireId: loc.id, mois: moisCourant, annee: annee },
              success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
              cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
            });
            lienPaiement = session.url;
          }

          emailHtml = `
            <div style="font-family: sans-serif;">
              <p>Bonjour ${loc.prenom},</p>
              <p>Votre avis d'échéance pour <strong>${moisNom} ${annee}</strong> est disponible.</p>
              ${lienPaiement ? `
                <p>Pour régler par carte bancaire :</p>
                <a href="${lienPaiement}" style="background:#2563eb; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; display:inline-block;">Payer mon loyer</a>
              ` : `<p>Merci d'effectuer votre virement sur le compte de ${prop.name}.</p>`}
            </div>
          `;
        }

        // ENVOI FINAL
        await resend.emails.send({
          from: 'LocaManager <gestion@getlocam.com>',
          to: loc.email,
          subject: emailSubject,
          attachments: [{ filename, content: Buffer.from(pdfBuffer) }],
          html: emailHtml
        });

        report.push({ email: loc.email, type: dejaPaye ? 'QUITTANCE' : 'AVIS' });

      } catch (err) {
        console.error(`Erreur pour ${loc.email}:`, err);
      }
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}