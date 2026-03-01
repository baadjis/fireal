/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  Building2, MapPin, Users, Edit2, Plus, 
  Eye, Maximize, SearchX 
} from "lucide-react";
import { formatAdminAddress } from "@/lib/format";
import { TableSearchFilter } from "@/components/TableSearchFilter";

export default async function BiensPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string }> 
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // Récupération sécurisée du paramètre de recherche (Next.js 15)
  const { search } = await searchParams;

  const biens = await prisma.bien.findMany({
    where: {
      proprietaireId: userId,
      AND: [
        search ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { ville: { contains: search, mode: 'insensitive' } },
            { adresse: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    },
    include: {
      _count: {
        select: { locataires: { where: { active: true, archived: false } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Patrimoine</h1>
          <p className="text-slate-500 font-medium text-sm">Gérez vos logements et suivez l&apos;occupation en temps réel.</p>
        </div>
        <Link 
          href="/biens/nouveau" 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Ajouter un bien
        </Link>
      </div>

      {/* BARRE DE RECHERCHE */}
      <TableSearchFilter placeholder="Rechercher par nom, ville ou adresse..." />

      {/* RÉSULTATS */}
      {biens.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {search ? <SearchX size={32} className="text-slate-300" /> : <Building2 size={32} className="text-slate-300" />}
          </div>
          <p className="text-slate-500 font-bold">
            {search ? `Aucun résultat pour "${search}"` : "Vous n'avez pas encore de biens enregistrés."}
          </p>
          {!search && (
            <Link href="/biens/nouveau" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline mt-4 inline-block">
              Créer mon premier logement →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {biens.map((bien) => {
            const addr = formatAdminAddress(bien.adresse, bien.codePostal, bien.ville);
            const occupantCount = bien._count.locataires;

            return (
              <div key={bien.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* HEADER CARTE */}
                <div className="p-6 pb-2 flex justify-between items-start">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 size={24} />
                  </div>
                  <div className="flex gap-1">
                    <Link 
                      href={`/biens/${bien.id}/edit`}
                      className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <Link 
                      href={`/biens/${bien.id}`}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Détails"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>
                </div>

                {/* CONTENU */}
                <div className="p-6 pt-2 space-y-4">
                  <div>
                    <Link href={`/biens/${bien.id}`}>
                      <h3 className="font-black text-xl text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {bien.nom}
                      </h3>
                    </Link>
                    <div className="flex items-start gap-2 mt-1 text-slate-400">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-medium leading-tight">
                        {addr.street} <br />
                        <span className="font-black text-slate-300 uppercase">{addr.cityLine}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                       <Maximize size={12} /> {bien.surface || '--'} m²
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                       {bien.type}
                    </span>
                  </div>
                </div>

                {/* FOOTER CARTE */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${occupantCount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                      <Users size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {occupantCount === 0 ? "Logement vide" : `${occupantCount} locataire(s)`}
                    </span>
                  </div>

                  <Link 
                    href={`/locataires/nouveau?bienId=${bien.id}`}
                    className="p-2 bg-white border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Installer un locataire"
                  >
                    <Plus size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}