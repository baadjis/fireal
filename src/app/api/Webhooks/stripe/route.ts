/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { confirmerPaiementEtEnvoyerQuittance } from '@/app/actions/quittance';
import { createNotification } from '@/lib/notifications'; // Import de votre utilitaire

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Erreur de signature Webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Traitement de l'événement de succès
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // --- CAS 1 : MISE À JOUR DE L'ABONNEMENT (PROPRIÉTAIRE) ---
    if (session.mode === 'subscription') {
      const userId = session?.client_reference_id as string;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "PRO" }
        });

        // NOTIFICATION GLOBALE
        await createNotification(userId, {
          title: "🚀 Plan PRO activé",
          message: "Félicitations ! Votre abonnement est actif, l'automatisation est maintenant disponible.",
          type: "ALERTE",
          link: "/compte/billing"
        });
      }
    }

    if (session.mode === 'subscription') {
    const userId = session.client_reference_id!;
    
    // 1. Créer la facture en base de données
    const invoiceCount = await prisma.invoice.count();
    await prisma.invoice.create({
      data: {
        userId: userId,
        number: `INV-${new Date().getFullYear()}-${(invoiceCount + 1).toString().padStart(3, '0')}`,
        amount: session.amount_total! / 100, // Convertir centimes en euros
        type: "SUBSCRIPTION_PRO",
        status: "PAID",
        stripeInvoiceId: session.invoice as string
      }
    });

    // 2. Mettre à jour le plan
    await prisma.user.update({ where: { id: userId }, data: { plan: "PRO" } });
  }

    // --- CAS 2 : PAIEMENT DE LOYER (LOCATAIRE) ---
    if (session.mode === 'payment') {
      const locataireId = session.metadata?.locataireId;
      const mois = session.metadata?.mois;
      const annee = session.metadata?.annee;
      const stripeCustomerId = session.customer as string;

      if (locataireId && mois && annee) {
        try {
          // A. Enregistrer le paiement
          await prisma.paiement.upsert({
            where: {
              locataireId_mois_annee: {
                locataireId,
                mois: parseInt(mois),
                annee: parseInt(annee),
              },
            },
            update: {}, 
            create: {
              locataireId,
              mois: parseInt(mois),
              annee: parseInt(annee),
              datePaiement: new Date(),
            },
          });

          // B. Mise à jour infos locataire
          const updatedLocataire = await prisma.locataire.update({
            where: { id: locataireId },
            data: { stripeCustomerId },
            include: { bien: true } // On récupère le bien pour connaître le proprio
          });

          // C. NOTIFICATION GLOBALE POUR LE PROPRIÉTAIRE
          await createNotification(updatedLocataire.bien.proprietaireId, {
            title: "💰 Loyer reçu",
            message: `${updatedLocataire.prenom} ${updatedLocataire.nom} a payé son loyer de ${mois}/${annee} par carte.`,
            type: "PAIEMENT",
            link: `/locataires/${locataireId}`
          });

          // D. ENVOI AUTOMATIQUE DE LA QUITTANCE PAR EMAIL
          await confirmerPaiementEtEnvoyerQuittance(locataireId);

          console.log(`✅ Paiement auto validé, quittance et notification envoyées.`);
        } catch (dbError) {
          console.error("❌ Erreur Webhook Payment Logic:", dbError);
          return new NextResponse("Erreur interne", { status: 500 });
        }
      }
    }
  }

  return new NextResponse('Événement reçu', { status: 200 });
}