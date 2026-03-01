import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { Resend } from "resend";
import { formatAdminName } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function finaliserActivationLocataire(locataireId: string) {
  // 1. Récupérer les infos
  const loc = await prisma.locataire.findUnique({
    where: { id: locataireId },
    include: { bien: { include: { proprietaire: true } } }
  });

  if (!loc) return;

  // 2. Mettre à jour le statut
  await prisma.locataire.update({
    where: { id: locataireId },
    data: { 
      statut: "ACTIF", 
      active: true, 
      vuParBailleur: false 
    }
  });

  // 3. Créer la notification (Point rouge + Cloche)
  const tenantName = formatAdminName(loc.prenom, loc.nom);
  await createNotification(loc.bien.proprietaireId, {
    title: "🖋️ Bail validé",
    message: `Le contrat de ${tenantName} est officiellement signé.`,
    type: "SIGNATURE",
    link: `/locataires/${loc.id}`
  });

  // 4. Envoyer l'email au bailleur
  await resend.emails.send({
    from: 'LocAm <notifications@getlocam.com>',
    to: loc.bien.proprietaire.email!,
    subject: `✅ Contrat signé : ${tenantName}`,
    html: `<p>Bonne nouvelle ! Le bail pour <strong>${loc.bien.nom}</strong> est signé.</p>`
  });
}