/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { AvisEcheance } from '@/components/templates/AvisEcheance';
import { QuittanceLoyer } from '@/components/templates/QuittanceLoyer';
import Stripe from 'stripe';
import { capitalizeFirstLetter, formatAdminName } from '@/lib/format';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialisation sécurisée de Stripe
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = stripeSecret && !stripeSecret.includes('insert_your');
const stripe = isStripeConfigured ? new Stripe(stripeSecret, { apiVersion: "2025-01-27" }) : null;

export async function GET(request: Request) {
  // 1. SÉCURITÉ CRON
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const today = new Date();
    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisIndex = today.getMonth(); 
    const moisCourant = moisIndex + 1;  
    const moisNom = moisFr[moisIndex];
    const annee = today.getFullYear();

    // 2. RÉCUPÉRATION DES CONTRATS ACTIFS
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
        const proprietaireDisplay = formatAdminName(prop.firstName || '', prop.lastName || '', prop.name);
        const totalLoyer = (loc.loyerHC || 0) + (loc.charges || 0);
        
        const isPaid = loc.paiements.length > 0;
        let pdfBuffer;
        let emailSubject = "";
        let emailContent = "";
        let filename = "";

        // --- CAS 1 : DÉJÀ PAYÉ -> ENVOI QUITTANCE ---
        if (isPaid) {
          pdfBuffer = await renderToBuffer(
            React.createElement(QuittanceLoyer, {
              locataire: loc,
              proprietaire: prop,
              mois: moisNom,
              annee: annee
            })
          );
          emailSubject = `Quittance de loyer - ${moisNom} ${annee}`;
          filename = `Quittance_${loc.nom.toUpperCase()}_${moisNom}.pdf`;
          emailContent = `
            <p>Bonjour <strong>${capitalizeFirstLetter(loc.prenom)}</strong>,</p>
            <p>Nous vous confirmons la réception de votre règlement concernant le loyer du mois de <strong>${moisNom} ${annee}</strong>.</p>
            <p>Vous trouverez votre quittance de loyer officielle en pièce jointe de ce message.</p>
            <p>Merci pour votre ponctualité.</p>
          `;
        } 
        // --- CAS 2 : NON PAYÉ -> ENVOI AVIS D'ÉCHÉANCE ---
        else {
          pdfBuffer = await renderToBuffer(
            React.createElement(AvisEcheance, {
              locataire: loc,
              proprietaire: prop,
              mois: moisNom,
              annee: annee
            })
          );
          emailSubject = `Avis d'échéance Loyer - ${moisNom} ${annee}`;
          filename = `Avis_Echeance_${loc.nom.toUpperCase()}_${moisNom}.pdf`;

          // Logique de lien de paiement Stripe (PRO/EXPERT)
          let lienPaiement = null;
          if (stripe && (prop.plan === "PRO" || prop.plan === "EXPERT") && prop.stripeConnectedId) {
            try {
              const session = await stripe.checkout.sessions.create({
                customer: loc.stripeCustomerId || undefined,
                customer_email: loc.stripeCustomerId ? undefined : loc.email,
                line_items: [{
                  price_data: {
                    currency: 'eur',
                    product_data: { name: `Loyer ${moisNom} ${annee} - ${loc.bien.nom}` },
                    unit_amount: Math.round(totalLoyer * 100),
                  },
                  quantity: 1,
                }],
                mode: 'payment',
                payment_intent_data: {
                  application_fee_amount: 200, // Votre commission de 2€ (en centimes)
                  transfer_data: { destination: prop.stripeConnectedId },
                },
                metadata: { locataireId: loc.id, mois: moisCourant, annee: annee },
                success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
                cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
              });
              lienPaiement = session.url;
            } catch (stripeErr) {
              console.error("Erreur Stripe Session:", stripeErr);
            }
          }

          emailContent = `
            <p>Bonjour <strong>${capitalizeFirstLetter(loc.prenom)}</strong>,</p>
            <p>Votre avis d'échéance pour le loyer de <strong>${moisNom} ${annee}</strong> est désormais disponible en pièce jointe.</p>
            <p>Montant total à régler : <strong>${totalLoyer.toFixed(2)} €</strong></p>
            
            ${lienPaiement ? `
              <div style="margin: 30px 0; padding: 25px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
                <p style="margin-bottom: 15px; font-weight: bold; color: #1e293b;">Règlement sécurisé par carte bancaire :</p>
                <a href="${lienPaiement}" style="background-color: #2563eb; color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Payer mon loyer en ligne</a>
              </div>
            ` : `
              <p style="margin-top: 20px; color: #475569;">Merci d'effectuer votre règlement par virement bancaire sur le compte de <strong>${proprietaireDisplay}</strong> avant le ${loc.jourPaiement} du mois.</p>
            `}
          `;
        }

        // --- ENVOI DE L'EMAIL (TEMPLATE PROFESSIONNEL) ---
        await resend.emails.send({
          from: 'LocAm Gestion <gestion@getlocam.com>',
          to: loc.email,
          subject: emailSubject,
          attachments: [{ filename: filename, content: Buffer.from(pdfBuffer) }],
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="background-color: #2563eb; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; tracking-tighter: -0.5px;">LocAm.</h1>
              </div>
              
              <div style="padding: 40px; background-color: #ffffff;">
                ${emailContent}
                <p style="margin-top: 40px;">Cordialement,<br><strong>${proprietaireDisplay}</strong></p>
              </div>

              <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Document édité par LocAm</p>
                <p style="margin: 8px 0 0 0; font-size: 10px; color: #cbd5e1;">Ceci est un envoi automatisé. Pour toute question, connectez-vous à votre espace locataire.</p>
                <div style="margin-top: 15px;">
                  <a href="${process.env.NEXTAUTH_URL}" style="font-size: 10px; color: #2563eb; text-decoration: none; font-weight: bold;">www.getlocam.com</a>
                </div>
              </div>
            </div>
          `
        });

        report.push({ email: loc.email, type: isPaid ? 'QUITTANCE' : 'AVIS', status: 'success' });

      } catch (err) {
        console.error(`Erreur pour ${loc.email}:`, err);
        report.push({ email: loc.email, status: 'error' });
      }
    }

    return NextResponse.json({ success: true, processed: report });

  } catch (error) {
    console.error("Erreur générale Cron:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}