/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// 1. Mise à jour du nom et de l'email
export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    name :formData.get("name") as string,
    telephone: formData.get('telephone') as string,
    adresse: formData.get('adresse') as string,
    ville: formData.get('ville') as string,
    codePostal: formData.get('codePostal') as string,
    // Le logo peut être passé en base64 via un champ caché ou traité à part
    logoUrl: formData.get('logoUrl') as string || undefined, 
  };

  await prisma.user.update({
    where: { id: userId },
    data: data
  });

  revalidatePath('/compte');
  revalidatePath('/dashboard');
  return { success: true };
}
// 2. Mise à jour du mot de passe
export async function updatePassword(formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any).id

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.password) return { error: "Utilisateur non trouvé" }

  // Vérifier l'ancien mot de passe
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) return { error: "L'ancien mot de passe est incorrect" }

  // Hasher le nouveau
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })



  return { success: "Mot de passe modifié avec succès" }
}

export async function updateSignature(base64Data: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé" };

  try {
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { signatureData: base64Data }
    });
    revalidatePath('/compte');
    return { success: true };
  } catch (e) {
    return { error: "Erreur lors de la sauvegarde" };
  }
}


export async function acceptTermsAction() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  await prisma.user.update({
    where: { id: userId },
    data: { 
      termsAccepted: true,
      termsAcceptedAt: new Date() 
    }
  });

  revalidatePath('/');
  redirect('/dashboard');
}