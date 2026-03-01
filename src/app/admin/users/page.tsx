/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdminSearchFilter } from "@/components/admin/AdminSearchFilter";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import prisma from "@/lib/prisma";

export default async function AdminUsersPage({ searchParams }: any) {
  const { search, plan } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {},
        plan ? { plan } : {}
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { biens: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Gestion des Utilisateurs</h1>
      <AdminSearchFilter placeholder="Rechercher un bailleur..." filterKey="plan" filterOptions={[{label: "Basic", value: "BASIC"}, {label: "Pro", value: "PRO"}]} />
      
      {/* ON PASSE LES USERS AU COMPOSANT DE TABLE CLIENT */}
      <AdminUserTable users={users} />
    </div>
  );
}