/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Building2, Users, MapPin, Layers, Hash, 
  Square, Edit3, Plus, ArrowLeft, Info, 
  ChevronRight, ExternalLink
} from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
// Import des utilitaires de formatage
import { formatAdminName, formatAdminAddress } from "@/lib/format";

export default async function BienDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // Récupération du bien avec ses locataires actifs
  const bien = await prisma.bien.findFirst({
    where: { id, proprietaireId: userId },
    include: { 
      locataires: { 
        where: { active: true, archived: false },
        orderBy: { createdAt: 'desc' }
      } 
    }
  });

  if (!bien) notFound();

  // Formatage de l'adresse du bien
  const displayAddress = formatAdminAddress(bien.adresse, bien.codePostal, bien.ville);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* 1. BARRE DE NAVIGATION HAUTE */}
      <div className="flex justify-between items-center">
        <Link href="/biens" className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition font-medium">
          <ArrowLeft size={16} className="mr-2" /> Retour au patrimoine
        </Link>
        <Link 
          href={`/biens/${bien.id}/edit`} 
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm text-slate-600"
        >
          <Edit3 size={14} /> Modifier le bien
        </Link>
      </div>

      {/* 2. EN-TÊTE PRINCIPAL */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:row justify-between items-center gap-6">
        <div className="flex items-center gap-6 flex-col md:flex-row text-center md:text-left">
          <div className="p-5 bg-blue-50 text-blue-600 rounded-[2rem]">
            <Building2 size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{bien.nom}</h1>
            <div className="flex items-start justify-center md:justify-start gap-2 mt-2 text-slate-500 font-medium">
              <MapPin size={16} className="text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm">
                {displayAddress.street} <br />
                <span className="font-bold text-slate-400">{displayAddress.cityLine}</span>
              </p>
            </div>
          </div>
        </div>
        
        <Link 
          href={`/locataires/nouveau?bienId=${bien.id}`} 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Ajouter un locataire
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. COLONNE GAUCHE : FICHE TECHNIQUE */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <Layers size={16} /> Caractéristiques
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-slate-400 text-sm flex items-center gap-2">
                  <Info size={14} /> Type
                </span>
                <span className="font-bold text-slate-700 text-sm uppercase">{bien.type}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-slate-400 text-sm flex items-center gap-2">
                  <Hash size={14} /> Étage / Porte
                </span>
                <span className="font-bold text-slate-700 text-sm">
                  {bien.etage === 0 ? "RDC" : `${bien.etage}e`} — {bien.numeroPorte || "N/A"}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400 text-sm flex items-center gap-2">
                  <Square size={14} /> Surface
                </span>
                <span className="font-bold text-slate-700 text-sm">
                  {bien.surface ? `${bien.surface} m²` : "Non renseignée"}
                </span>
              </div>
            </div>
          </div>

          {/* PETITE NOTE UX */}
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Note de gestion</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toutes les quittances liées à ce bien sont archivées dans les dossiers individuels des locataires.
            </p>
          </div>
        </div>

        {/* 4. COLONNE DROITE : LISTE DES OCCUPANTS (COLOCATION) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Occupants du logement
            </h2>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {bien.locataires.length} actif(s)
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {bien.locataires.length === 0 ? (
              <div className="p-20 text-center text-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} />
                </div>
                <p className="font-medium">Ce logement est actuellement vide.</p>
                <Link href={`/locataires/nouveau?bienId=${bien.id}`} className="text-blue-600 text-sm font-bold hover:underline mt-2 inline-block">
                  Installer un locataire
                </Link>
              </div>
            ) : (
              bien.locataires.map((loc) => (
                <div key={loc.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    {/* Avatar Initials */}
                    <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {loc.prenom[0]}{loc.nom[0]}
                    </div>
                    <div>
                      <Link href={`/locataires/${loc.id}`} className="font-black text-slate-900 hover:text-blue-600 flex items-center gap-1 transition-colors">
                        {formatAdminName(loc.prenom, loc.nom)}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-xs text-slate-400 font-medium">{loc.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-600">
                        {(loc.loyerHC + loc.charges).toFixed(2)} €
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Total Mensuel</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {/* Bouton de quittance rapide */}
                       <ButtonAction locataireId={loc.id} />
                       
                       <Link 
                        href={`/locataires/${loc.id}`}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-slate-100"
                       >
                        <ChevronRight size={20} />
                       </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}