'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const telephone = formData.get('telephone') as string
  const adresse = formData.get('adresse') as string
  const ville = formData.get('ville') as string
  const codePostal = formData.get('codePostal') as string

  if (!email || !password || !firstName || !lastName) {
    return { error: "Veuillez remplir tous les champs obligatoires." }
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) return { error: "Cet email est déjà utilisé." }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        telephone,
        adresse,
        ville,
        codePostal,
        plan: "BASIC",
        // ON ENREGISTRE LE CONSENTEMENT ICI
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      }
    })

  } catch (error) {
    console.error("Erreur Inscription:", error)
    return { error: "Une erreur est survenue lors de l'inscription." }
  }

  redirect('/login?success=compte-cree')
}