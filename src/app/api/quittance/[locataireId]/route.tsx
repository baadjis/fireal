/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/quittance/[locataireId]/route.tsx

import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { QuittanceTemplate } from '@/components/QuittanceTemplate';

export async function GET(
  request: Request,
  { params }: { params: { locataireId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Non autorisé", { status: 401 });

  const userId = (session.user as any).id;
  const { locataireId } = params;

  try {
    const locataire = await prisma.locataire.findFirst({
      where: { 
        id: locataireId,
        bien: { proprietaireId: userId }
      },
      include: { bien: true }
    });

    const proprietaire = await prisma.user.findUnique({ where: { id: userId } });

    if (!locataire || !proprietaire) return new NextResponse("Non trouvé", { status: 404 });

    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const date = new Date();
    const mois = moisFr[date.getMonth()];
    const annee = date.getFullYear();

    // 1. Générer le buffer
    const buffer = await renderToBuffer(
      <QuittanceTemplate 
        locataire={locataire} 
        proprietaire={proprietaire} 
        mois={mois} 
        annee={annee} 
      />
    );

    // 2. CORRECTION ICI : Convertir le Buffer en Uint8Array pour TypeScript
    const pdfUint8Array = new Uint8Array(buffer);

    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=quittance_${locataire.nom}.pdf`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur lors de la génération", { status: 500 });
  }
}