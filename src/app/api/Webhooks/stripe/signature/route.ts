import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { finaliserActivationLocataire } from '@/lib/tenant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Logique Yousign ou interne
    const signatureId = body.data?.signature_request?.id || body.signatureId;

    if (!signatureId) {
      return NextResponse.json({ error: "No ID" }, { status: 400 });
    }

    const loc = await prisma.locataire.findFirst({
      where: { signatureId: signatureId }
    });

    if (loc) {
      await finaliserActivationLocataire(loc.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}