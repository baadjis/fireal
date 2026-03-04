'use server'

import prisma from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"
import bcrypt from "bcrypt"

const resend = new Resend(process.env.RESEND_API_KEY)

// 1. Demander la réinitialisation
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  
  // Sécurité : On ne dit pas si l'email existe ou pas pour éviter le "user enumeration"
  if (!user || !user.password) return { success: true } 

  // Générer un token
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 3600 * 1000) // 1 heure

  // Sauvegarder le token
  await prisma.passwordResetToken.create({
    data: { email, token, expires }
  })

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  // Envoyer l'email
  await resend.emails.send({
    from: 'LocAm Security <notifications@getlocam.com>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe - LocAm',
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur LocAm.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.</p>
        <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; display: inline-block;">Réinitialiser mon mot de passe</a>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      </div>
    `
  })

  return { success: true }
}

// 2. Changer le mot de passe avec le token
export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: "Le lien est invalide ou a expiré." }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword }
  })

  // Supprimer le token utilisé
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

  return { success: true }
}