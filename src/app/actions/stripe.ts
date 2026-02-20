'use server'

import Stripe from 'stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27' });

// 1. Créer le compte Stripe Connect (pour que le proprio reçoive les loyers)
export async function createConnectAccount() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  let stripeAccountId = user?.stripeConnectedId;

  // Si le compte n'existe pas encore
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user?.email!,
      capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
    });
    stripeAccountId = account.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeConnectedId: stripeAccountId } });
  }

  // Créer le lien vers l'onboarding Stripe
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXTAUTH_URL}/compte/billing`,
    return_url: `${process.env.NEXTAUTH_URL}/compte/billing`,
    type: 'account_onboarding',
  });

  redirect(accountLink.url);
}

// 2. Créer une session d'abonnement (pour que le proprio vous paie vous)
export async function createSubscription(plan: "PRO" | "EXPERT") {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;
  
  // Ici vous devez avoir créé des "Produits" dans votre Dashboard Stripe
  const priceId = plan === "PRO" ? "price_ID_PRO" : "price_ID_EXPERT";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/compte/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/compte/billing`,
    client_reference_id: userId,
  });

  redirect(checkoutSession.url!);
}