'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: "Champs manquants" }

  // 1. Vérifier si l'utilisateur existe
  const userExists = await prisma.user.findUnique({ where: { email } })
  if (userExists) return { error: "Cet email est déjà utilisé" }

  // 2. Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Créer l'utilisateur
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  })

  // 4. Rediriger vers la page de login
  redirect('/login?success=compte-cree')
}