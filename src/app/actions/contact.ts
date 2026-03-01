
'use server'

import prisma from "@/lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  try {
    // 1. CRÉATION DU TICKET EN BASE DE DONNÉES (Pour l'admin)
    await prisma.supportTicket.create({
      data: { name, email, subject, message, status: "OPEN" }
    });
  
    // 2. ENVOI DES MAILS (Notification Admin + Accusé Client)
    // ... gardez votre code Resend précédent ici ...
    await Promise.all([
      // 1. Notification pour TOI
      resend.emails.send({
        from: 'LocAm System <notifications@getlocam.com>',
        to: 'ton-email-perso@gmail.com', // Ton email
        replyTo: email,
        subject: `[SUPPORT] ${subject} - ${name}`,
        html: `
          <h3>Nouveau message de contact</h3>
          <p><strong>De :</strong> ${name} (${email})</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <p><strong>Message :</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      }),

      // 2. Accusé de réception pour l'UTILISATEUR
      resend.emails.send({
        from: 'LocAm Support <contact@getlocam.com>',
        to: email, // L'email de la personne qui a rempli le formulaire
        subject: `Nous avons bien reçu votre message - LocAm`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2563eb;">Bonjour ${name},</h2>
            <p>Merci de nous avoir contactés ! Nous avons bien reçu votre demande concernant : <strong>${subject}</strong>.</p>
            <p>Notre équipe support examine votre message et reviendra vers vous dans les plus brefs délais (généralement sous 24h ouvrées).</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">Rappel de votre message :</p>
              <p style="font-style: italic;">"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</p>
            </div>

            <p>En attendant, vous pouvez consulter notre centre d'aide ou gérer vos biens depuis votre tableau de bord.</p>
            <br />
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Accéder à mon espace</a>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 11px; color: #94a3b8;">L'équipe LocAm — La gestion locative simplifiée</p>
          </div>
        `
      })
    ]);
    return { success: true };
  } catch (error) {
    return { error: "Erreur technique" };
  }
}