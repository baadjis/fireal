/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContratBail } from '@/components/templates/ContratBail';
import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locataireId: string }> }
) {
  // 1. Vérification de la session
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Non autorisé", { status: 401 });

  const userId = (session.user as any).id;
  const { locataireId } = await params;

  try {
    // 2. Récupérer toutes les données nécessaires
    const locataire = await prisma.locataire.findFirst({
      where: { 
        id: locataireId,
        bien: { proprietaireId: userId } // Sécurité : vérifie la propriété
      },
      include: { bien: true }
    });

    const proprietaire = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!locataire || !proprietaire) {
      return new NextResponse("Document non trouvé", { status: 404 });
    }

    // 3. Générer le PDF en utilisant le template du Contrat (Bail)
    const buffer = await renderToBuffer(
      React.createElement(ContratBail, { 
        locataire: locataire, 
        bien: locataire.bien, 
        proprietaire: proprietaire 
      })
    );

    // 4. Conversion pour Next.js 15 / TypeScript
    const pdfUint8Array = new Uint8Array(buffer);

    // 5. Retourner le PDF
    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        // "inline" pour l'ouvrir dans le navigateur, "attachment" pour le télécharger
        'Content-Disposition': `inline; filename=Contrat_Bail_${locataire.nom}.pdf`,
      },
    });

  } catch (error) {
    console.error("Erreur génération contrat:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}