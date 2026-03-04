
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ContratBail } from "@/components/templates/ContratBail";
import { Resend } from "resend";
import { headers } from "next/headers";
import { createNotification } from "@/lib/notifications";
import { finaliserActivationLocataire } from "@/lib/tenant-service";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { formatAdminName } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY)

// --- GESTION DU PROFIL UTILISATEUR (Propriétaire & Locataire) ---

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) return { error: "Non autorisé" };

  const data: any = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    name: formData.get('name') as string, // Raison sociale
    email: formData.get('email') as string,
    telephone: formData.get('telephone') as string,
    adresse: formData.get('adresse') as string,
    ville: formData.get('ville') as string,
    codePostal: formData.get('codePostal') as string,
    logoUrl: formData.get('logoUrl') as string || null,
  };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: data
    });

    revalidatePath('/compte');
    revalidatePath('/tenant/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Erreur updateProfile:", error);
    return { error: "Une erreur est survenue lors de la mise à jour du profil." };
  }
}

export async function updatePassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) return { error: "Non autorisé" };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) return { error: "Utilisateur non trouvé" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return { error: "L'ancien mot de passe est incorrect." };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: "Mot de passe mis à jour avec succès" };
  } catch (error) {
    return { error: "Erreur lors de la modification du mot de passe" };
  }
}

// --- GESTION DES LOCATAIRES (BAILLEUR) ---

export async function createTenant(formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return { error: "Non autorisé" }

  const nom = formData.get('nom') as string
  const prenom = formData.get('prenom') as string
  const email = formData.get('email') as string
  const telephone = formData.get('telephone') as string
  const loyerHC = parseFloat(formData.get('loyerHC') as string)
  const charges = parseFloat(formData.get('charges') as string)
  const bienId = formData.get('bienId') as string
  const jourPaiement = parseInt(formData.get('jourPaiement') as string)
  const sendContract = formData.get('sendContract') === 'on'
  const dateDebutRaw = formData.get("dateDebutBail") as string;
  const dateFinRaw = formData.get("dateFinBail") as string;

  const dateDebutBail = dateDebutRaw ? new Date(dateDebutRaw) : null;
  const dateFinBail = dateFinRaw ? new Date(dateFinRaw) : null;
  const alreadySigned = formData.get('alreadySigned') as string;
  
  const statutInitial = alreadySigned === 'yes' ? 'ACTIF' : 'BROUILLON';
  const isActive = alreadySigned === 'yes';

  try {
    const bien = await prisma.bien.findFirst({
      where: { id: bienId, proprietaireId: userId }
    })
    if (!bien) return { error: "Bien non trouvé" }

    const locataireCree = await prisma.locataire.create({
      data: {
        nom, prenom, email, loyerHC, charges, bienId,
        jourPaiement, telephone, statut: statutInitial,
        active: isActive, dateDebutBail, dateFinBail,
        dateSignature: alreadySigned ? new Date() : null,
      },
      include: { bien: true }
    })

    if (sendContract && !alreadySigned) {
      const proprietaire = await prisma.user.findUnique({ where: { id: userId } })
      if (proprietaire) {
        const pdfBuffer = await renderToBuffer(
          React.createElement(ContratBail, { locataire: locataireCree, bien: bien, proprietaire })
        );
        await resend.emails.send({
          from: 'LocAm <notifications@getlocam.com>',
          to: locataireCree.email,
          subject: `Votre contrat de location - ${bien.nom}`,
          attachments: [{ filename: `Bail_${nom}.pdf`, content: Buffer.from(pdfBuffer) }],
          html: `<p>Bonjour ${prenom}, voici votre contrat de location.</p>`
        });
      }
    }
  } catch (error) {
    console.error(error)
    return { error: "Impossible de créer le locataire" }
  }

  revalidatePath('/locataires')
  redirect('/locataires')
}

export async function updateLocataire(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Non autorisé");

  const data = {
    prenom: formData.get('prenom') as string,
    nom: formData.get('nom') as string,
    email: formData.get('email') as string,
    telephone: formData.get('telephone') as string,
    bienId: formData.get('bienId') as string,
    loyerHC: parseFloat(formData.get('loyerHC') as string),
    charges: parseFloat(formData.get('charges') as string),
    jourPaiement: parseInt(formData.get('jourPaiement') as string),
    active: formData.get('active') === 'on',
    conditionsParticulieres: (formData.get('conditionsParticulieres') as string) || null,
    dateDebutBail: formData.get("dateDebutBail") ? new Date(formData.get("dateDebutBail") as string) : null,
    dateFinBail: formData.get("dateFinBail") ? new Date(formData.get("dateFinBail") as string) : null,
  };

  try {
    await prisma.locataire.updateMany({
      where: { id, bien: { proprietaireId: userId } },
      data: data
    });
  } catch (error) {
    return { error: "Erreur lors de la mise à jour" };
  }

  revalidatePath(`/locataires/${id}`);
  redirect(`/locataires/${id}`);
}

export async function signContractAction(token: string, signatureData: string, mention: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";

  try {
    const locataire = await prisma.locataire.findUnique({
      where: { tokenSignature: token },
      include: { bien: true }
    });

    if (!locataire) return { error: "Lien invalide" };

    await prisma.locataire.update({
      where: { id: locataire.id },
      data: {
        signatureDataLocataire: signatureData,
        mentionLuApprouve: mention,
        dateSignature: new Date(),
        ipSignature: ip,
        methodeSign: "INTERNE"
      }
    });

    await finaliserActivationLocataire(locataire.id);
    return { success: true };
  } catch (e) { return { error: "Erreur" }; }
}

export async function inviterLocataire(locataireId: string) {
  try {
    const loc = await prisma.locataire.findUnique({
      where: { id: locataireId },
      include: { bien: { include: { proprietaire: true } } }
    });

    if (!loc) return { error: "Locataire introuvable" };

    const token = loc.tokenSignature || crypto.randomUUID();
    await prisma.locataire.update({
      where: { id: locataireId },
      data: { invitationToken: token, tokenSignature: token }
    });

    const existingUser = await prisma.user.findUnique({ where: { email: loc.email } });
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;

    await resend.emails.send({
      from: 'LocAm Notifications <notifications@getlocam.com>',
      to: loc.email,
      subject: existingUser ? `Nouveau bail disponible` : `Invitation LocAm`,
      html: `<p>Bonjour ${loc.prenom}, votre propriétaire vous invite sur LocAm.</p><a href="${inviteUrl}">Rejoindre mon espace</a>`
    });

    return { success: true };
  } catch (error) {
    return { error: "Erreur envoi invitation" };
  }
}

// Les fonctions simples (activerManuellement, archive, delete, rappel)
export async function activerManuellement(locataireId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé");
  await prisma.locataire.update({
    where: { id: locataireId, bien: { proprietaireId: (session.user as any).id } },
    data: { statut: "ACTIF", active: true, methodeSign: "MANUELLE", dateSignature: new Date() }
  });
  revalidatePath(`/locataires/${locataireId}`);
}

// --- ARCHIVER (Résiliation de bail) ---
// On garde les données mais on arrête les quittances et on cache le bail
export async function archiveLocataire(id: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  try {
    // 1. Vérification de sécurité : le bail appartient-il à ce propriétaire ?
    const bail = await prisma.locataire.findFirst({
      where: { id, bien: { proprietaireId: userId } }
    });

    if (!bail) throw new Error("Bail non trouvé ou non autorisé");

    // 2. Mise à jour : On résilie ce contrat spécifique
    await prisma.locataire.update({
      where: { id: id },
      data: { 
        archived: true, 
        active: false,
        statut: "TERMINE" // On utilise le statut pour la clarté historique
      }
    });

  } catch (error) {
    console.error("Erreur archivage bail:", error);
    return { error: "Erreur lors de la résiliation" };
  }

  // 3. Rafraîchissement et redirection (TOUJOURS hors du try/catch)
  revalidatePath('/locataires');
  redirect('/locataires');
}

// --- SUPPRIMER (Erreur de saisie uniquement) ---
// On supprime la ligne de contrat car elle n'aurait jamais dû exister
export async function deleteLocataire(id: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  try {
    // 1. Vérification de sécurité
    const bail = await prisma.locataire.findFirst({
      where: { id, bien: { proprietaireId: userId } }
    });

    if (!bail) throw new Error("Bail non trouvé");

    // 2. Suppression du contrat (la ligne Locataire)
    // NOTE : Cela ne supprime PAS l'utilisateur (User) dans la table User !
    // L'individu garde son compte LocAm pour ses autres baux.
    await prisma.locataire.delete({
      where: { id: id }
    });

  } catch (error) {
    console.error("Erreur suppression bail:", error);
    return { error: "Impossible de supprimer ce contrat" };
  }

  revalidatePath('/locataires');
  redirect('/locataires');
}


export async function demarrerSignatureElectronique(locataireId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) throw new Error("Non autorisé");

  try {
    // 1. Récupérer le locataire et vérifier qu'il appartient bien au bailleur
    const loc = await prisma.locataire.findFirst({
      where: { 
        id: locataireId, 
        bien: { proprietaireId: userId } 
      },
      include: { 
        bien: { include: { proprietaire: true } } 
      }
    });

    if (!loc) throw new Error("Locataire non trouvé");

    // 2. Générer un token de signature unique s'il n'existe pas déjà
    const token = loc.tokenSignature || crypto.randomUUID();

    // 3. Mettre à jour le locataire : Statut "ATTENTE_SIGNATURE"
    await prisma.locataire.update({
      where: { id: locataireId },
      data: {
        statut: "ATTENTE_SIGNATURE",
        methodeSign: "EN_LIGNE",
        tokenSignature: token,
        invitationToken: token, // On synchronise les tokens pour plus de simplicité
      }
    });

    // 4. Préparer l'email avec le lien sécurisé
    const signLink = `${process.env.NEXTAUTH_URL}/sign/${token}`;
    const bailleurName = formatAdminName(
      loc.bien.proprietaire.firstName||'', 
      loc.bien.proprietaire.lastName||'', 
      loc.bien.proprietaire.name
    );

    await resend.emails.send({
      from: 'LocAm Security <notifications@getlocam.com>',
      to: loc.email,
      subject: `Signature de votre contrat de location - ${loc.bien.nom}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h2>Bonjour ${loc.prenom},</h2>
          <p>Votre propriétaire, <strong>${bailleurName}</strong>, vous invite à signer électroniquement votre contrat de bail pour le logement situé à :</p>
          <p style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong>${loc.bien.nom}</strong><br/>
            ${loc.bien.adresse}, ${loc.bien.ville}
          </p>
          <p>Veuillez cliquer sur le bouton ci-dessous pour consulter et signer le document. Cette opération ne prend que quelques minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signLink}" style="background-color: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Lire et signer mon bail
            </a>
          </div>
          <p style="font-size: 11px; color: #94a3b8;">
            Ce lien est strictement personnel et sécurisé. Ne le partagez pas.
          </p>
        </div>
      `
    });

    // 5. Rafraîchir la page pour voir le changement de statut
    revalidatePath(`/locataires/${locataireId}`);
    return { success: true };

  } catch (error) {
    console.error("Erreur demarrerSignatureElectronique:", error);
    return { error: "Une erreur est survenue lors du lancement de la signature." };
  }
}

export async function renvoyerRappelSignature(locataireId:string) {

   const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) throw new Error("Non autorisé");

  try {
    // 1. Récupérer le locataire et vérifier qu'il appartient bien au bailleur
    const loc = await prisma.locataire.findFirst({
      where: { 
        id: locataireId, 
        bien: { proprietaireId: userId } 
      },
      include: { 
        bien: { include: { proprietaire: true } } 
      }
    });

    if (!loc) throw new Error("Locataire non trouvé");

    // 2. Générer un token de signature unique s'il n'existe pas déjà
    const token = loc.tokenSignature || crypto.randomUUID();

    // 3. Mettre à jour le locataire : Statut "ATTENTE_SIGNATURE"
    await prisma.locataire.update({
      where: { id: locataireId },
      data: {
        statut: "ATTENTE_SIGNATURE",
        methodeSign: "EN_LIGNE",
        tokenSignature: token,
        invitationToken: token, // On synchronise les tokens pour plus de simplicité
      }
    });

    // 4. Préparer l'email avec le lien sécurisé
    const signLink = `${process.env.NEXTAUTH_URL}/sign/${token}`;
    const bailleurName = formatAdminName(
      loc.bien.proprietaire.firstName||'', 
      loc.bien.proprietaire.lastName||'', 
      loc.bien.proprietaire.name
    );

    await resend.emails.send({
      from: 'LocAm Security <notifications@getlocam.com>',
      to: loc.email,
      subject: `Signature de votre contrat de location - ${loc.bien.nom}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h2>Bonjour ${loc.prenom},</h2>
          <p>Votre propriétaire, <strong>${bailleurName}</strong>, vous invite à signer électroniquement votre contrat de bail pour le logement situé à :</p>
          <p style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong>${loc.bien.nom}</strong><br/>
            ${loc.bien.adresse}, ${loc.bien.ville}
          </p>
          <p>Veuillez cliquer sur le bouton ci-dessous pour consulter et signer le document. Cette opération ne prend que quelques minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signLink}" style="background-color: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Lire et signer mon bail
            </a>
          </div>
          <p style="font-size: 11px; color: #94a3b8;">
            Ce lien est strictement personnel et sécurisé. Ne le partagez pas.
          </p>
        </div>
      `
    });

    // 5. Rafraîchir la page pour voir le changement de statut
    revalidatePath(`/locataires/${locataireId}`);
    return { success: true };

  } catch (error) {
    console.error("Erreur demarrerSignatureElectronique:", error);
    return { error: "Une erreur est survenue lors du lancement de la signature." };
  }
  
}



export async function signContractAction2(token: string, signatureData: string, mention: string) {
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