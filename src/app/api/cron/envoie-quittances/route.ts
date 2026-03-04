/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { QuittanceLoyer } from '@/components/templates/QuittanceLoyer';
import { AvisEcheance } from '@/components/templates/AvisEcheance';
import { formatAdminName, capitalizeFirstLetter } from '@/lib/format';
import Stripe from 'stripe';

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY!) : null;

export async function GET(request: Request) {
  // 1. SÉCURITÉ CRON
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const today = new Date();
    const jourActuel = today.getDate();
    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisIndex = today.getMonth(); // 0-11
    const moisCourant = moisIndex + 1;
    const moisNom = moisFr[moisIndex];
    const annee = today.getFullYear();

    // 2. RÉCUPÉRATION DES BAUX (Locataires) dont c'est l'échéance aujourd'hui
    const baux = await prisma.locataire.findMany({
      where: { 
        active: true,
        archived: false,
        jourPaiement: jourActuel 
      },
      include: { 
        bien: { include: { proprietaire: true } },
        // On vérifie si un paiement existe déjà pour ce mois
        paiements: {
          where: { mois: moisCourant, annee: annee }
        }
      }
    });

    const report = [];

    for (const bail of baux) {
      try {
        const prop = bail.bien.proprietaire;
        const isPaid = bail.paiements.length > 0;
        const proprietaireDisplay = formatAdminName(prop.firstName ||'', prop.lastName||'', prop.name);
        
        let pdfBuffer;
        let emailSubject = "";
        let emailBody = "";
        let filename = "";
        let stripeUrl = null;

        // --- CAS 1 : LOYER DÉJÀ PAYÉ -> ENVOI QUITTANCE ---
        if (isPaid) {
          pdfBuffer = await renderToBuffer(
            React.createElement(QuittanceLoyer, {
              locataire: bail,
              proprietaire: prop,
              mois: moisNom,
              annee: annee
            })
          );
          emailSubject = `Quittance de loyer - ${moisNom} ${annee}`;
          filename = `Quittance_${bail.nom.toUpperCase()}_${moisNom}.pdf`;
          emailBody = `
            <p>Bonjour ${capitalizeFirstLetter(bail.prenom)},</p>
            <p>Votre loyer pour la période de <strong>${moisNom} ${annee}</strong> a bien été reçu. Vous trouverez votre quittance officielle en pièce jointe.</p>
            <p>Merci pour votre ponctualité.</p>
          `;
        } 
        // --- CAS 2 : LOYER NON PAYÉ -> ENVOI AVIS D'ÉCHÉANCE ---
        else {
          pdfBuffer = await renderToBuffer(
            React.createElement(AvisEcheance, {
              locataire: bail,
              proprietaire: prop,
              mois: moisNom,
              annee: annee
            })
          );
          emailSubject = `Avis d'échéance Loyer - ${moisNom} ${annee}`;
          filename = `Avis_Echeance_${moisNom}.pdf`;

          // Logique Stripe PRO (Lien de paiement)
          if (stripe && (prop.plan === "PRO" || prop.plan === "EXPERT") && prop.stripeConnectedId) {
            const session = await stripe.checkout.sessions.create({
              customer: bail.stripeCustomerId || undefined,
              customer_email: bail.stripeCustomerId ? undefined : bail.email,
              line_items: [{
                price_data: {
                  currency: 'eur',
                  product_data: { name: `Loyer ${moisNom} ${annee} - ${bail.bien.nom}` },
                  unit_amount: Math.round((bail.loyerHC + bail.charges) * 100),
                },
                quantity: 1,
              }],
              mode: 'payment',
              payment_intent_data: {
                application_fee_amount: 200, // Votre commission 2€
                transfer_data: { destination: prop.stripeConnectedId },
              },
              metadata: { locataireId: bail.id, mois: moisCourant, annee: annee },
              success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
              cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
            });
            stripeUrl = session.url;
          }

          emailBody = `
            <p>Bonjour ${capitalizeFirstLetter(bail.prenom)},</p>
            <p>Votre avis d'échéance pour le mois de <strong>${moisNom} ${annee}</strong> est prêt.</p>
            <p>Montant total à régler : <strong>${(bail.loyerHC + bail.charges).toFixed(2)} €</strong></p>
            ${stripeUrl ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${stripeUrl}" style="background-color: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Payer mon loyer par CB</a>
              </div>
            ` : `<p>Veuillez effectuer votre virement sur le compte de <strong>${proprietaireDisplay}</strong>.</p>`}
          `;
        }

        // --- ENVOI DE L'EMAIL AVEC DESIGN PRO ---
        await resend.emails.send({
          from: 'LocAm Gestion <gestion@getlocam.com>',
          to: bail.email,
          subject: emailSubject,
          attachments: [{ filename, content: Buffer.from(pdfBuffer) }],
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden;">
              <div style="background-color: #2563eb; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.5px;">LocAm.</h1>
              </div>
              <div style="padding: 40px; background-color: white;">
                ${emailBody}
                <p style="margin-top: 40px;">Cordialement,<br><strong>${proprietaireDisplay}</strong></p>
              </div>
              <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Document édité par LocAm</p>
                <p style="margin: 8px 0 0 0; font-size: 10px; color: #cbd5e1;">Ceci est un envoi automatisé. Pour toute question sur votre bail, contactez directement votre propriétaire.</p>
                <div style="margin-top: 15px;">
                  <a href="${process.env.NEXTAUTH_URL}" style="font-size: 10px; color: #2563eb; text-decoration: none; font-weight: bold;">www.getlocam.com</a>
                </div>
              </div>
            </div>
          `
        });

        report.push({ email: bail.email, type: isPaid ? 'QUITTANCE' : 'AVIS', status: 'success' });

      } catch (err) {
        console.error(`Erreur pour ${bail.email}:`, err);
        report.push({ email: bail.email, status: 'error' });
      }
    }

    return NextResponse.json({ success: true, count: baux.length, report });

  } catch (error) {
    console.error('Erreur générale Cron:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}