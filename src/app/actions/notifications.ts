/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Marquer une notification spécifique comme lue
export async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
  revalidatePath('/', 'layout'); // Rafraîchit la sidebar et la topbar
}

// Tout marquer comme lu (pour vider la cloche d'un coup)
export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
  revalidatePath('/', 'layout');
}