import prisma from "@/lib/prisma";

export async function createNotification(userId: string, data: {
  title: string,
  message: string,
  type: "SIGNATURE" | "PAIEMENT" | "ALERTE",
  link?: string
}) {
  return await prisma.notification.create({
    data: {
      userId,
      ...data
    }
  });
}