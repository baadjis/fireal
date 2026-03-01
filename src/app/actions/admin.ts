/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const resend = new Resend(process.env.RESEND_API_KEY);



export async function replyToSupport(ticketId: string, replyMessage: string) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { error: "Ticket introuvable" };

  // 1. Envoyer l'email au client via Resend
  await resend.emails.send({
    from: 'LocAm Support <contact@getlocam.com>',
    to: ticket.email,
    subject: `Re: ${ticket.subject}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <p>Bonjour ${ticket.name},</p>
        <p>${replyMessage.replace(/\n/g, '<br>')}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">Votre message initial :<br/>"${ticket.message}"</p>
      </div>
    `
  });

  // 2. Mettre à jour le ticket en base
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { reply: replyMessage, status: "CLOSED" }
  });

  revalidatePath('/admin/support');
  return { success: true };
}


// Vérification de sécurité pour toutes les actions admin
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Accès refusé")
}

// app/actions/admin.ts
export async function changeUserPlan(userId: string, newPlan: string) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") throw new Error("Accès refusé");

    console.log(`LOG: Tentative de changement de plan pour ${userId} vers ${newPlan}`);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: newPlan }
    });

    console.log(`LOG: Succès ! Nouveau plan en DB : ${updatedUser.plan}`);

    revalidatePath('/admin/users'); // Force le rafraîchissement de la liste admin
    revalidatePath('/dashboard');   // Force le rafraîchissement du dashboard user
    revalidatePath('/compte/billing');
    
    return { success: true };
  } catch (error) {
    console.error("Erreur changeUserPlan:", error);
    return { error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteUser(userId: string) {
  await checkAdmin()
  // Note: Cela supprimera aussi ses biens et locataires à cause du "onDelete: Cascade" dans Prisma
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin/users')
}


export async function sendBulkEmailAction(userIds: string[], subject: string, message: string) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Accès refusé")

  try {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true, id: true, name: true }
    })

    // Envoi des emails et création des notifications en parallèle
    const emailPromises = users.map(async (user) => {
      // 1. Mail via Resend
      await resend.emails.send({
        from: 'LocAm Info <notifications@getlocam.com>',
        to: user.email!,
        subject: subject,
        html: `<div style="font-family:sans-serif;">
                <h2>Bonjour ${user.name},</h2>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>`
      })

      // 2. Notification interne (dans la cloche du dashboard)
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: subject,
          message: message.substring(0, 100),
          type: "ALERTE"
        }
      })
    })

    await Promise.all(emailPromises)
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de l'envoi groupé" }
  }
}