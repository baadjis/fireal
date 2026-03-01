/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { QuittanceLoyer } from '@/components/templates/QuittanceLoyer';
import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locataireId: string }> }
) {
  // 1. Vérification de la session
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Non autorisé", { status: 401 });

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const { locataireId } = await params;

  // 2. Récupération des paramètres de date dans l'URL
  const { searchParams } = new URL(request.url);
  const moisParam = searchParams.get('mois'); 
  const anneeParam = searchParams.get('annee'); 

  const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  const dateDoc = new Date();
  const indexMois = moisParam ? parseInt(moisParam) - 1 : dateDoc.getMonth();
  const nomMois = moisFr[indexMois];
  const anneeDoc = anneeParam ? parseInt(anneeParam) : dateDoc.getFullYear();

  try {
    // 3. Requête Prisma avec sécurité hybride (Proprio OR Locataire)
    const locataire = await prisma.locataire.findFirst({
      where: { 
        id: locataireId,
        OR: [
          { bien: { proprietaireId: userId } }, // Cas 1 : L'utilisateur est le bailleur
          { userId: userId }                  // Cas 2 : L'utilisateur est le locataire
        ]
      },
      include: { 
        bien: { 
          include: { 
            proprietaire: true // On récupère les infos du bailleur pour le PDF
          } 
        } 
      }
    });

    if (!locataire) {
      return new NextResponse("Document introuvable ou accès refusé", { status: 404 });
    }

    // Le propriétaire est extrait de la relation bien
    const proprietaire = locataire.bien.proprietaire;

    // 4. Génération du PDF
    const buffer = await renderToBuffer(
      React.createElement(QuittanceLoyer, {
        locataire: locataire,
        proprietaire: proprietaire,
        mois: nomMois,
        annee: anneeDoc
      })
    );

    // 5. Réponse PDF
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=Quittance_${locataire.nom}_${nomMois}.pdf`,
      },
    });

  } catch (error) {
    console.error("Erreur API Quittance:", error);
    return new NextResponse("Erreur lors de la génération du document", { status: 500 });
  }
}