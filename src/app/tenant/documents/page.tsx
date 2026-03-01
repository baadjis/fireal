/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  FileCheck,
  Info,
  Home,
  SearchX
} from "lucide-react";
import Link from "next/link";

export default async function TenantDocumentsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Récupération de tous les profils locataires de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      locataireProfiles: {
        where: { archived: false },
        include: { 
          bien: true,
          paiements: {
            orderBy: { datePaiement: 'desc' }
          }
        }
      }
    }
  });

  const baux = user?.locataireProfiles || [];

  if (baux.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto">
          <SearchX size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Aucun document</h1>
        <p className="text-slate-500 text-sm">Vous n&apos;avez pas encore de documents disponibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Documents</h1>
        <p className="text-slate-500 mt-1 font-medium">Retrouvez l&apos;ensemble de vos baux et quittances de loyer.</p>
      </div>

      {/* BOUCLE SUR CHAQUE BAIL POUR GROUPER LES DOCUMENTS */}
      {baux.map((bail) => (
        <div key={bail.id} className="space-y-6">
          {/* Titre du logement pour grouper */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Home size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
              {bail.bien.nom} — {bail.bien.ville}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNE GAUCHE : CONTRAT DU LOGEMENT PRÉCIS */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  <FileCheck size={16} /> Contrat de location
                </h3>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-blue-600">
                    <FileText size={32} />
                    <div>
                      <p className="font-black text-slate-900 text-sm">Bail d&apos;habitation</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Réf: {bail.id.substring(0,8).toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <a 
                    href={`/api/contrat/${bail.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                  >
                    <Download size={14} /> Télécharger
                  </a>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                  <Info className="text-blue-500 shrink-0" size={18} />
                  <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                    Ce document fait foi de contrat entre vous et votre bailleur pour ce logement.
                  </p>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE : QUITTANCES DU LOGEMENT PRÉCIS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                  <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                    <ShieldCheck size={18} className="text-emerald-500" /> Historique des quittances
                  </h3>
                </div>

                <div className="divide-y divide-slate-50">
                  {bail.paiements.length === 0 ? (
                    <div className="p-16 text-center text-slate-300 italic">
                      <p className="text-sm">Aucune quittance disponible pour ce logement.</p>
                    </div>
                  ) : (
                    bail.paiements.map((p: any) => {
                      const moisFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
                      const moisNom = moisFr[p.mois - 1];

                      return (
                        <div key={p.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xs">
                              {p.mois}/{String(p.annee).slice(-2)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">Quittance {moisNom} {p.annee}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                Payée le {new Date(p.datePaiement).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          <a 
                            href={`/api/quittance/${bail.id}?mois=${p.mois}&annee=${p.annee}`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                          >
                            <Download size={14} /> PDF
                          </a>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* FOOTER RÉASSURANCE */}
      <div className="pt-10 text-center space-y-2 border-t border-slate-100">
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">
          Documents certifiés par LocAm
        </p>
        <p className="text-[9px] text-slate-200 italic">
          Conformément au RGPD, vos documents sont chiffrés et conservés sur des serveurs sécurisés.
        </p>
      </div>
    </div>
  );
}