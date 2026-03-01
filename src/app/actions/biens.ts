/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { TypeBien } from "@prisma/client"

/**
 * CRÉATION D'UN BIEN
 */
export async function createBien(formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return { error: "Vous devez être connecté pour effectuer cette action" }
  }

  // 1. Extraction des données
  const nom = formData.get('nom') as string
  const type = formData.get('type') as TypeBien
  const adresse = formData.get('adresse') as string
  const ville = formData.get('ville') as string
  const codePostal = formData.get('codePostal') as string
  const description = formData.get('description') as string
  const numeroPorte = formData.get('numeroPorte') as string
  const inventaire = formData.get('inventaire') as string

  // 2. Logique de conversion des types
  const isMeuble = formData.get('isMeuble') === 'true'; // Convertit "true"/"false" en Boolean

  const etageRaw = formData.get('etage') as string
  const etage = etageRaw !== "" ? parseInt(etageRaw, 10) : null

  const surfaceRaw = formData.get('surface') as string
  const surface = surfaceRaw !== "" ? parseFloat(surfaceRaw) : null

  try {
    // 3. Insertion en base de données
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
        isMeuble, // Nouveau champ
        inventaire: inventaire || null, // Nouveau champ
        proprietaireId: userId,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la création du bien:", error)
    return { error: "Une erreur est survenue lors de l'enregistrement." }
  }

  revalidatePath('/biens')
  redirect('/biens')
}

/**
 * MISE À JOUR D'UN BIEN
 */
export async function updateBien(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) throw new Error("Non autorisé");

  // 1. Extraction et conversion
  const isMeuble = formData.get('isMeuble') === 'true';
  const inventaire = formData.get('inventaire') as string;

  const data = {
    nom: formData.get('nom') as string,
    type: formData.get('type') as any,
    adresse: formData.get('adresse') as string,
    ville: formData.get('ville') as string,
    codePostal: formData.get('codePostal') as string,
    description: formData.get('description') as string,
    numeroPorte: formData.get('numeroPorte') as string,
    etage: formData.get('etage') ? parseInt(formData.get('etage') as string, 10) : null,
    surface: formData.get('surface') ? parseFloat(formData.get('surface') as string) : null,
    isMeuble, // Mise à jour du régime locatif
    inventaire: inventaire || null, // Mise à jour de la liste des meubles/clés
  };

  try {
    // 2. Mise à jour sécurisée (updateMany pour filtrer par ID + Propriétaire)
    const result = await prisma.bien.updateMany({
      where: { 
        id: id, 
        proprietaireId: userId 
      },
      data: data,
    });

    if (result.count === 0) {
      throw new Error("Bien non trouvé ou non autorisé");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bien:", error);
    return { error: "Erreur technique lors de la modification." };
  }

  // 3. Revalidation du cache pour voir les changements sur les pages
  revalidatePath(`/biens/${id}`);
  revalidatePath("/biens");
  
  // 4. Redirection vers la fiche détaillée
  redirect(`/biens/${id}`);
}