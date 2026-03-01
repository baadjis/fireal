/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  FileText, Download, Home, Calendar, 
  Wallet, CheckCircle, SearchX, MapPin, 
  User, MessageSquare 
} from "lucide-react";
import Link from "next/link";
import { formatAdminName, formatAdminAddress } from "@/lib/format";

export default async function TenantDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Récupération de l'utilisateur avec TOUTES ses fiches locataires rattachées
  const userWithLeases = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      locataireProfiles: {
        where: { archived: false },
        include: { 
          bien: { include: { proprietaire: true } },
          paiements: { orderBy: { datePaiement: 'desc' } }
        }
      }
    }
  });

  const baux = userWithLeases?.locataireProfiles || [];

  // 2. Gestion de l'état vide (Aucun bail rattaché)
  if (baux.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto">
          <SearchX size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Aucun bail actif</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Votre compte n&apos;est rattaché à aucun contrat de location pour le moment.
          </p>
        </div>
        <Link href="/contact" className="inline-block text-blue-600 font-bold text-sm hover:underline">
          Besoin d&apos;aide ? Contactez le support
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* HEADER DE BIENVENUE */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Bonjour, {userWithLeases?.firstName || userWithLeases?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {baux.length > 1 
              ? `Vous avez ${baux.length} locations actives sur votre espace.` 
              : "Bienvenue dans votre espace locataire LocAm."}
          </p>
        </div>
      </div>

      {/* BOUCLE SUR CHAQUE BAIL (Logique Multi-Bail) */}
      {baux.map((bail) => {
        const totalMensuel = bail.loyerHC + bail.charges;
        const bailleurName = formatAdminName(bail.bien.proprietaire.firstName||'', bail.bien.proprietaire.lastName||'', bail.bien.proprietaire.name);
        const bienAddr = formatAdminAddress(bail.bien.adresse, bail.bien.codePostal, bail.bien.ville);

        return (
          <div key={bail.id} className="space-y-6">
            {/* SÉPARATEUR SI MULTI-BAIL */}
            <div className="flex items-center gap-4">
              <span className="h-px bg-slate-200 flex-1"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Location : {bail.bien.nom}
              </span>
              <span className="h-px bg-slate-200 flex-1"></span>
            </div>

            {/* STATS DU BAIL PRÉCIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Home size={24}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Adresse</p>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{bienAddr.inline}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Wallet size={24}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Mensualité TTC</p>
                  <p className="text-lg font-black text-slate-900">{totalMensuel.toFixed(2)} €</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Calendar size={24}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Échéance</p>
                  <p className="text-lg font-black text-slate-900">le {bail.jourPaiement} / mois</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* DOCUMENTS & HISTORIQUE */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* ACTIONS DOCUMENTS */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" /> Mon Contrat
                    </h2>
                    <a 
                      href={`/api/contrat/${bail.id}`} 
                      target="_blank"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
                    >
                      <Download size={16} className="group-hover:animate-bounce" /> Voir mon bail
                    </a>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" /> Dernier reçu
                    </h2>
                    <a 
                      href={`/api/quittance/${bail.id}`} 
                      target="_blank"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      <Download size={16} /> Quittance
                    </a>
                  </div>
                </div>

                {/* TABLEAU HISTORIQUE */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 flex justify-between items-center">
                    <span>Historique des paiements</span>
                    <span className="px-2 py-0.5 bg-slate-50 rounded text-slate-400 font-bold">{bail.paiements.length} réglé(s)</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {bail.paiements.slice(0, 5).map((p) => (
                      <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <CheckCircle size={18} className="text-emerald-500" />
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Loyer {p.mois} / {p.annee}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Validé le {new Date(p.datePaiement).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Link 
                          href={`/api/quittance/${bail.id}?mois=${p.mois}&annee=${p.annee}`} 
                          target="_blank"
                          className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                        >
                          <Download size={18} />
                        </Link>
                      </div>
                    ))}
                    {bail.paiements.length === 0 && (
                      <div className="p-10 text-center text-slate-300 italic text-xs">Aucun paiement enregistré pour ce bail.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTACT BAILLEUR */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 opacity-10">
                     <User size={100} />
                   </div>
                   <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-6">Bailleur Responsable</h3>
                   <div className="space-y-5 relative z-10">
                      <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Nom / Raison Sociale</p>
                        <p className="font-bold text-sm mt-1">{bailleurName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Email de contact</p>
                        <p className="font-bold text-sm mt-1 truncate">{bail.bien.proprietaire.email}</p>
                      </div>
                      <div className="pt-4">
                         <Link href="/contact" className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-white/20 transition">
                           <MessageSquare size={14} /> Signaler un problème
                         </Link>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}