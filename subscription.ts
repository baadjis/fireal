import prisma from "@/lib/prisma";

export async function checkTenantLimit(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true }
  });

  const count = await prisma.locataire.count({
    where: { bien: { proprietaireId: userId }, archived: false }
  });

  if (user?.plan === "FREE" && count >= 1) return false;
  if (user?.plan === "PRO" && count >= 5) return false; // Exemple
  
  return true;
}