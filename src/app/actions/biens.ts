/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { TypeBien } from "@prisma/client" // Import de l'Enum généré par Prisma

export async function createBien(formData: FormData) {
  // 1. Vérification de la session
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return { error: "Vous devez être connecté pour effectuer cette action" }
  }

  // 2. Extraction et conversion des données du formulaire
  const nom = formData.get('nom') as string
  const type = formData.get('type') as TypeBien // On caste vers l'Enum Prisma
  const adresse = formData.get('adresse') as string
  const ville = formData.get('ville') as string
  const codePostal = formData.get('codePostal') as string
  const description = formData.get('description') as string
  const numeroPorte = formData.get('numeroPorte') as string

  // Conversion sécurisée des nombres (si vide, on envoie null)
  const etageRaw = formData.get('etage') as string
  const etage = etageRaw !== "" ? parseInt(etageRaw, 10) : null

  const surfaceRaw = formData.get('surface') as string
  const surface = surfaceRaw !== "" ? parseFloat(surfaceRaw) : null

  try {
    // 3. Insertion dans la base de données
    await prisma.bien.create({
      data: {
        nom,
        type,
        adresse,
        ville,
        codePostal,
        description: description || null,
        etage,
        numeroPorte: numeroPorte || null,
        surface,
        proprietaireId: userId, // Lien automatique avec l'utilisateur connecté
      },
    })
  } catch (error) {
    console.error("Erreur lors de la création du bien:", error)
    return { error: "Une erreur est survenue lors de l'enregistrement." }
  }

  // 4. Mise à jour du cache et redirection
  revalidatePath('/biens')
  redirect('/biens')
}


export async function updateBien(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) throw new Error("Non autorisé");

  // On prépare les données
  const data = {
    nom: formData.get('nom') as string,
    type: formData.get('type') as any,
    adresse: formData.get('adresse') as string,
    ville: formData.get('ville') as string,
    codePostal: formData.get('codePostal') as string,
    description: formData.get('description') as string,
    numeroPorte: formData.get('numeroPorte') as string,
    etage: formData.get('etage') ? parseInt(formData.get('etage') as string) : null,
    surface: formData.get('surface') ? parseFloat(formData.get('surface') as string) : null,
  };

  try {
    // On utilise updateMany pour pouvoir filtrer par ID ET proprietaireId (Sécurité)
    // car le "update" simple ne prend que des champs uniques (ID)
    const result = await prisma.bien.updateMany({
      where: { 
        id: id, // Ici 'id' doit être une string, pas undefined
        proprietaireId: userId 
      },
      data: data,
    });

    if (result.count === 0) {
      throw new Error("Bien non trouvé ou vous n'êtes pas le propriétaire");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return { error: "Erreur technique" };
  }

  revalidatePath(`/biens/${id}`);
  revalidatePath("/biens");
  redirect(`/biens/${id}`);
}