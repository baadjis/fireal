/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { InvoiceTemplate } from '@/components/templates/InvoiceTemplate';
import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  // 1. Vérification de la session
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Non autorisé", { status: 401 });

  const userId = (session.user as any).id;
  const { invoiceId } = await params;

  try {
    // 2. Récupérer la facture et vérifier qu'elle appartient bien à l'utilisateur connecté
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: invoiceId,
        userId: userId // Sécurité cruciale : un utilisateur ne peut pas voir la facture d'un autre
      }
    });

    if (!invoice) {
      return new NextResponse("Facture non trouvée", { status: 404 });
    }

    // 3. Récupérer les infos de l'utilisateur pour l'adresse de facturation
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return new NextResponse("Utilisateur non trouvé", { status: 404 });
    }

    // 4. Générer le PDF avec le template InvoiceTemplate
    const buffer = await renderToBuffer(
      React.createElement(InvoiceTemplate, {
        invoice: invoice,
        user: user
      })
    );

    // 5. Convertir le Buffer en Uint8Array pour la compatibilité Next.js 15 / TS
    const pdfUint8Array = new Uint8Array(buffer);

    // 6. Retourner le PDF
    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        // "inline" pour l'ouvrir dans le navigateur, "attachment" pour forcer le téléchargement
        'Content-Disposition': `inline; filename=Facture_${invoice.number}.pdf`,
      },
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    return new NextResponse("Erreur lors de la génération de la facture", { status: 500 });
  }
}