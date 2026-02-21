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
const resend = new Resend(process.env.RESEND_API_KEY)

export async function createTenant(formData: FormData) {
  // 1. Vérification de la session (Sécurité)
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return { error: "Non autorisé" }

  // 2. Récupération des données du formulaire
  const nom = formData.get('nom') as string
  const prenom = formData.get('prenom') as string
  const email = formData.get('email') as string
  const telephone = formData.get('telephone') as string
  const loyerHC = parseFloat(formData.get('loyerHC') as string)
  const charges = parseFloat(formData.get('charges') as string)
  const bienId = formData.get('bienId') as string
  const jourPaiement = parseInt(formData.get('jourPaiement') as string)
  const sendContract = formData.get('sendContract') === 'on'

  let newLocataireId = ""

  try {
    // 3. Vérifier que le bien appartient bien à l'utilisateur connecté
    const bien = await prisma.bien.findFirst({
      where: { id: bienId, proprietaireId: userId }
    })
    if (!bien) return { error: "Bien non trouvé ou non autorisé" }

    // 4. Création du locataire
    const locataireCree = await prisma.locataire.create({
      data: {
        nom,
        prenom,
        email,
        loyerHC,
        charges,
        bienId,
        jourPaiement,
        telephone,
        statut: "BROUILLON",
        active: false
      },
      include: { bien: true } // On inclut le bien pour avoir l'adresse dans le PDF
    })

    newLocataireId = locataireCree.id

    // 5. Gestion de l'envoi du contrat (Bail)
    if (sendContract) {
      const proprietaire = await prisma.user.findUnique({ where: { id: userId } })
      
      if (proprietaire) {
        // Génération du PDF
        const pdfBuffer = await renderToBuffer(
          React.createElement(ContratBail, { 
            locataire: locataireCree, 
            bien: bien, 
            proprietaire: proprietaire 
          })
        );

        // Envoi par Resend
        await resend.emails.send({
          from: 'LocaManager <gestion@getlocam.com>',
          to: locataireCree.email,
          subject: `Votre contrat de location - ${bien.nom}`,
          attachments: [{ 
            filename: `Bail_${nom}.pdf`, 
            content: Buffer.from(pdfBuffer) 
          }],
          html: `<p>Bonjour ${prenom},</p><p>Veuillez trouver ci-joint votre contrat de location pour le logement : ${bien.adresse}.</p>`
        });
      }
    }

  } catch (error) {
    console.error("Erreur creation locataire:", error)
    return { error: "Impossible de créer le locataire" }
  }

  // 6. Navigation (En dehors du try/catch)
  revalidatePath('/locataires')
  redirect('/locataires')
}

// app/actions/tenant.ts

export async function activerManuellement(locataireId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé");

  await prisma.locataire.update({
    where: { 
        id: locataireId,
        bien: { proprietaireId: (session.user as any).id } // Sécurité
    },
    data: { 
      statut: "ACTIF",
      active: true,
      methodeSign: "MANUELLE"
    }
  });

  revalidatePath(`/locataires/${locataireId}`);
  revalidatePath(`/locataires`);
}
export async function updateLocataire(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // On extrait les données
  const prenom = formData.get('prenom') as string;
  const nom = formData.get('nom') as string;
  const email = formData.get('email') as string;
  const loyerHC = parseFloat(formData.get('loyerHC') as string);
  const charges = parseFloat(formData.get('charges') as string);
  const bienId = formData.get('bienId') as string;
  const jourPaiement = parseInt(formData.get('jourPaiement') as string);
  const telephone  = formData.get('telephone') as string
  
  // LOGIQUE CHECKBOX : Si cochée, formData renvoie "on", sinon null
  const active = formData.get('active') === 'on';

  try {
    await prisma.locataire.update({
      where: { 
        id, 
        bien: { proprietaireId: userId } // Sécurité : vérifie que le bien lié appartient au user
      },
      data: {
        prenom,
        nom,
        email,
        loyerHC,
        charges,
        bienId,
        jourPaiement,
        active,
        telephone
      },
    });
  } catch (error) {
    console.error("Erreur update locataire:", error);
    return { error: "Erreur lors de la mise à jour" };
  }

  revalidatePath(`/locataires/${id}`);
  revalidatePath(`/locataires`);
  redirect(`/locataires/${id}`);
}


export async function demarrerSignatureElectronique(locataireId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé");

  // 1. On change le statut du locataire
  await prisma.locataire.update({
    where: { id: locataireId },
    data: { 
      statut: "ATTENTE_SIGNATURE",
      methodeSign: "EN_LIGNE"
    }
  });

  // 2. ICI : Logique d'appel à une API (Yousign, Dropbox Sign, etc.)
  // Pour l'instant, on simule l'envoi d'un email avec Resend contenant le lien
  const loc = await prisma.locataire.findUnique({ where: { id: locataireId } });
  
  /* 
  await resend.emails.send({
    to: loc.email,
    subject: "Signature de votre contrat de location",
    html: `<p>Bonjour, merci de signer votre contrat via ce lien : [LIEN_SIGNATURE]</p>`
  });
  */

  revalidatePath(`/locataires/${locataireId}`);
}


// ARCHIVER (Masquer)
export async function archiveLocataire(id: string) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any).id

  await prisma.locataire.update({
    where: { id, bien: { proprietaireId: userId } },
    data: { archived: true, active: false }
  })

  revalidatePath('/locataires')
  redirect('/locataires')
}

// SUPPRIMER DÉFINITIVEMENT (Erreur de saisie)
export async function deleteLocataire(id: string) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any).id

  await prisma.locataire.delete({
    where: { id, bien: { proprietaireId: userId } }
  })

  revalidatePath('/locataires')
  redirect('/locataires')
}