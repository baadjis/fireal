/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import Stripe from 'stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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



export async function createSubscription(plan: "PRO" | "EXPERT") {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // SI TU ES EN MODE TEST SANS STRIPE CONFIGURÉ :
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('insert')) {
      // Simule un succès immédiat pour le test
      await prisma.user.update({
          where: { id: userId },
          data: { plan: plan }
      });
      revalidatePath('/compte/billing');
      return; 
  }

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