/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { confirmerPaiementEtEnvoyerQuittance } from '@/app/actions/quittance';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27',
});

// Ce secret se trouve dans votre tableau de bord Stripe (Webhook > add endpoint)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // 1. Vérification que l'événement vient bien de Stripe
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Erreur de signature Webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Traitement de l'événement "Paiement réussi"
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === 'subscription') {
    const userId = session?.client_reference_id as string;
    // On récupère quel plan il a acheté (à adapter selon vos IDs)
    await prisma.user.update({
      where: { id: userId },
      data: { plan: "PRO" } // Vous pouvez rendre cela dynamique
    });
  }
    if (session.mode === 'payment') {
    // Récupération des infos cachées dans les metadatas (qu'on a mis dans le Cron)
    const locataireId = session.metadata?.locataireId;
    const mois = session.metadata?.mois;
    const annee = session.metadata?.annee;
    const stripeCustomerId = session.customer as string;
   
    if (locataireId && mois && annee) {
      try {
        // A. Enregistrer le paiement en base de données pour l'historique
        await prisma.paiement.upsert({
          where: {
            locataireId_mois_annee: {
              locataireId,
              mois: parseInt(mois),
              annee: parseInt(annee),
            },
          },
          update: {}, // Si déjà présent, on ne fait rien (sécurité doublon)
          create: {
            locataireId,
            mois: parseInt(mois),
            annee: parseInt(annee),
            datePaiement: new Date(),
          },
        });

        // B. Sauvegarder l'ID client Stripe du locataire pour ses futurs paiements
        if (stripeCustomerId) {
          await prisma.locataire.update({
            where: { id: locataireId },
            data: { stripeCustomerId }
          });
        }

        // C. DÉCLENCHER L'ENVOI AUTOMATIQUE DE LA QUITTANCE
        // On réutilise l'action qu'on a codée pour le mode manuel
        await confirmerPaiementEtEnvoyerQuittance(locataireId);

        console.log(`✅ Paiement validé et quittance envoyée pour locataire: ${locataireId}`);
      } catch (dbError) {
        console.error("❌ Erreur lors de la mise à jour DB suite au paiement:", dbError);
        return new NextResponse("Erreur DB", { status: 500 });
      }
    }
  }
}
  return new NextResponse('Événement reçu', { status: 200 });
}