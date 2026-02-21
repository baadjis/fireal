import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuittanceTemplate } from '@/components/QuittanceTemplate';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // 1. Sécurisation : On vérifie que c'est bien Vercel qui appelle via une clé secrète
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const today = new Date();
    const jourActuel = today.getDate(); // ex: 1 pour le 1er du mois
    const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisNom = moisFr[today.getMonth()];
    const annee = today.getFullYear();

    // 2. Trouver tous les locataires dont le jour de paiement est AUJOURD'HUI
    const locataires = await prisma.locataire.findMany({
      where: { 
        active: true,
        jourPaiement: jourActuel 
      },
      include: { 
        bien: { include: { proprietaire: true } } 
      }
    });

    const resultats = [];

    for (const loc of locataires) {
      const proprietaire = loc.bien.proprietaire;

      // 3. Génération du PDF en mémoire (Buffer)
      const pdfBuffer = await renderToBuffer(
        React.createElement(QuittanceTemplate, {
          locataire: loc,
          proprietaire: proprietaire,
          mois: moisNom,
          annee: annee
        })
      );

      // 4. Envoi de l'email via Resend
      const { data, error } = await resend.emails.send({
        from: 'LocaManager <gestion@getlocam.com>', // Plus tard, utilisez votre propre domaine
        to: loc.email,
        subject: `Quittance de loyer - ${moisNom} ${annee}`,
        html: `
          <p>Bonjour ${loc.prenom},</p>
          <p>Veuillez trouver ci-joint votre quittance de loyer pour la période de <strong>${moisNom} ${annee}</strong> concernant le logement situé au ${loc.bien.adresse}.</p>
          <p>Cordialement,<br>${proprietaire.name}</p>
        `,
        attachments: [
          {
            filename: `quittance_${moisNom}_${annee}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        ],
      });

      resultats.push({ email: loc.email, status: error ? 'erreur' : 'envoyé' });
    }

    return NextResponse.json({ processed: resultats.length, details: resultats });

  } catch (error) {
    console.error('Erreur Cron:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}