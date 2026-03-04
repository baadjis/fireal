'use server'

import prisma from "@/lib/prisma";
import { Resend } from 'resend';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { formatAdminName } from "@/lib/format";
import { createNotification } from "@/lib/notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function signContractAction(token: string, signatureData: string, mention: string) {
  // 1. Récupération des preuves (IP)
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";

  try {
    // 2. On cherche le locataire via le TOKEN (car c'est votre système interne)
    const locataire = await prisma.locataire.findUnique({
      where: { tokenSignature: token },
      include: { 
        bien: { 
          include: { proprietaire: true } 
        } 
      }
    });

    if (!locataire) return { error: "Lien de signature invalide ou expiré." };

    // 3. Mise à jour du locataire (Status, Activation et Notification Sidebar)
    await prisma.locataire.update({
      where: { id: locataire.id },
      data: {
        signatureDataLocataire: signatureData,
        mentionLuApprouve: mention,
        dateSignature: new Date(),
        ipSignature: ip,
        statut: "ACTIF",
        active: true,
        vuParBailleur: false // <-- C'est ça qui déclenche la pastille rouge sur "Mes Locataires"
      }
    });

    // 4. CRÉATION DE LA NOTIFICATION GLOBALE (Pour la cloche)
    const proprietaire = locataire.bien.proprietaire;
    const tenantName = formatAdminName(locataire.prenom, locataire.nom);

    await createNotification(proprietaire.id, {
      title: "🖋️ Contrat de bail signé",
      message: `${tenantName} a signé son contrat de bail électroniquement.`,
      type: "SIGNATURE",
      link: `/locataires/${locataire.id}`
    });

    // 5. ENVOI DE L'EMAIL DE NOTIFICATION AU PROPRIÉTAIRE
    if (proprietaire.email) {
      await resend.emails.send({
        from: 'LocAm Notifications <notifications@getlocam.com>',
        to: proprietaire.email,
        subject: `✅ Contrat signé : ${tenantName}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Excellente nouvelle !</h2>
            <p>Votre locataire <strong>${tenantName}</strong> a signé son contrat de bail.</p>
            <p>Le dossier est désormais complet et le locataire est activé dans votre gestion.</p>
            <a href="${process.env.NEXTAUTH_URL}/locataires/${locataire.id}" style="background:#2563eb; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; display:inline-block; font-weight:bold;">Voir le dossier</a>
          </div>
        `
      });
    }

    revalidatePath(`/locataires/${locataire.id}`);
    revalidatePath('/locataires'); // Pour mettre à jour la liste avec le point rouge
    return { success: true };

  } catch (error) {
    console.error("Erreur signature interne:", error);
    return { error: "Une erreur est survenue lors de la validation." };
  }
}