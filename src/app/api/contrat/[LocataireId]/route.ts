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
  { params }: { params: Promise<{ LocataireId: string }> }
) {
  const { LocataireId } = await params;
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get('token'); // Récupération du token depuis l'URL

  // 1. On tente de récupérer la session (si elle existe)
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  try {
    // 2. VÉRIFICATION DE SÉCURITÉ HYBRIDE
    const locataireCheck = await prisma.locataire.findFirst({
      where: { 
        id: LocataireId,
        OR: [
          // Option A : Utilisateur connecté est le proprio
          { bien: { proprietaireId: userId || 'non-connecté' } }, 
          // Option B : Utilisateur connecté est le locataire lié
          { userId: userId || 'non-connecté' },
          // Option C : Accès public via Token valide (pour signature)
          { 
            AND: [
              { tokenSignature: tokenParam || 'aucun-token' },
              { statut: { in: ['BROUILLON', 'ATTENTE_SIGNATURE'] } }
            ]
          }
        ]
      },
      select: { bienId: true, id: true }
    });

    if (!locataireCheck) {
      return new NextResponse("Accès non autorisé ou lien expiré", { status: 403 });
    }

    // 3. RÉCUPÉRATION DES DONNÉES POUR LE TEMPLATE
    const bienComplet = await prisma.bien.findUnique({
      where: { id: locataireCheck.bienId },
      include: {
        proprietaire: true,
        locataires: {
          where: { active: true, archived: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!bienComplet) return new NextResponse("Erreur données", { status: 404 });

    const currentLocataire = bienComplet.locataires.find(l => l.id === LocataireId);

    // 4. GÉNÉRATION DU PDF
    const buffer = await renderToBuffer(
      React.createElement(ContratBail, { 
        locataire: currentLocataire, 
        bien: bienComplet, 
        proprietaire: bienComplet.proprietaire 
      })
    );

    const pdfUint8Array = new Uint8Array(buffer);

    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=Bail_${currentLocataire?.nom}.pdf`,
        'Cache-Control': 'no-store'
      },
    });

  } catch (error) {
    console.error("Erreur API Contrat:", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}