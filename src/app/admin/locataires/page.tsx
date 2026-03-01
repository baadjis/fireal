/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdminLocataireTable } from "@/components/admin/AdminLocataireTable";
import { AdminSearchFilter } from "@/components/admin/AdminSearchFilter";
import prisma from "@/lib/prisma";

export default async function AdminLocatairesPage({ searchParams }: any) {
  const { search, statut } = await searchParams;

  const locataires = await prisma.locataire.findMany({
    where: {
      archived: false,
      AND: [
        search ? { OR: [{ nom: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {},
        statut ? { statut: statut as any } : {}
      ]
    },
    include: {
      bien: { include: { proprietaire: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Base globale des Locataires</h1>
      <AdminSearchFilter placeholder="Rechercher un locataire..." filterKey="statut" filterOptions={[{label: "Actifs", value: "ACTIF"}, {label: "Brouillons", value: "BROUILLON"}]} />
      
      {/* NOUVEAU COMPOSANT AVEC SÉLECTION ET EXPORT */}
      <AdminLocataireTable locataires={locataires} />
    </div>
  );
}