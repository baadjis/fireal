/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"

// 1. Mise à jour du nom et de l'email
export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any).id

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    })
    revalidatePath('/compte')
    return { success: "Profil mis à jour" }
  } catch (error) {
    return { error: "Erreur lors de la mise à jour" }
  }
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