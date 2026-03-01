/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { ButtonAction } from "@/components/ButtonAction";
import { 
  Mail, MapPin, Calendar, UserCheck, UserX, FileText, 
  ArrowLeft, Edit3, CheckCircle, AlertTriangle, Info, Send, 
  Phone, Clock, ShieldCheck, Download, Zap, Eye, Quote, Lock,
  ExternalLink, UserCircle,
  User,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { activerManuellement, demarrerSignatureElectronique } from "@/app/actions/tenant";
import { DangerZoneActions } from "@/components/DangerZoneAction";
import { formatAdminName, formatAdminAddress } from "@/lib/format";
import { BailViewer } from "@/components/BailViewer";
import { RappelSignatureButton } from "@/components/RappelSignatureButton";
import { revalidatePath } from "next/cache";

export default async function LocataireDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Récupération du CONTRAT SPÉCIFIQUE
  const locataire = await prisma.locataire.findFirst({
    where: { id, bien: { proprietaireId: userId } },
    include: { 
      bien: { include: { proprietaire: true } }, 
      paiements: { orderBy: { datePaiement: 'desc' } } 
    }
  });

  if (!locataire) notFound();

  // 2. LOGIQUE DE NOTIFICATION : MARQUER LE CONTRAT COMME VU
  if (locataire.vuParBailleur === false) {
    await prisma.locataire.update({
      where: { id: locataire.id },
      data: { vuParBailleur: true }
    });
    revalidatePath('/', 'layout');
  }

  const proprietaire = locataire.bien.proprietaire;
  const isPlanAuto = proprietaire.plan === "PRO" || proprietaire.plan === "EXPERT";
  const hasAccount = !!locataire.userId;

  // Formats administratifs
  const displayName = formatAdminName(locataire.prenom, locataire.nom);
  const displayAddress = formatAdminAddress(locataire.bien.adresse, locataire.bien.codePostal, locataire.bien.ville);

  const activerAction = activerManuellement.bind(null, id);
  const signatureAction = demarrerSignatureElectronique.bind(null, id);

  const isLeaseEndingSoon = locataire.dateFinBail && 
    (new Date(locataire.dateFinBail).getTime() - new Date().getTime() < 15552000000);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      
      {/* 1. BARRE DE NAVIGATION MULTI-NIVEAUX */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
            <Link href="/locataires" className="text-gray-400 hover:text-blue-600 transition p-2 bg-white rounded-xl border border-slate-100">
                <ArrowLeft size={16} />
            </Link>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <Link href="/locataires" className="hover:text-slate-600">Locataires</Link>
                <ChevronRight size={12} />
                <Link href={`/locataires/dossier?email=${locataire.email}`} className="text-blue-600 hover:underline">
                    Dossier {locataire.nom}
                </Link>
                <ChevronRight size={12} />
                <span className="text-slate-900">Bail {locataire.bien.nom}</span>
            </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {hasAccount ? (
             <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <ShieldCheck size={14} /> Profil Certifié
             </div>
          ) : (
            <Link href={`/locataires/${locataire.id}/edit`} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm text-slate-600">
              <Edit3 size={14} /> Modifier le contrat
            </Link>
          )}
        </div>
      </div>

      {/* 2. EN-TÊTE : DÉTAILS DU CONTRAT ACTUEL */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.2)_0%,_transparent_50%)]"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className={`p-4 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 ${locataire.active ? 'text-emerald-400' : 'text-amber-400'}`}>
            {locataire.active ? <CheckCircle size={32} /> : <Clock size={32} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">{locataire.bien.nom}</h1>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 px-2 py-0.5 rounded-md">Contrat #{locataire.id.substring(0,6).toUpperCase()}</span>
            </div>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <User size={14} /> Locataire : <span className="text-white font-bold">{displayName}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 relative z-10">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Statut du Bail</p>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              locataire.statut === 'ACTIF' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {locataire.statut}
            </div>
        </div>
      </div>

      {/* 3. WORKFLOW ADMINISTRATIF (Si non actif) */}
      {locataire.statut !== "ACTIF" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 border-b-4 border-blue-600">
          <div className="max-w-md">
            <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
              <FileText className="text-blue-600" /> Signature du bail
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Ce contrat est actuellement au stade de {locataire.statut.toLowerCase()}. Vous devez obtenir la signature du locataire pour activer les quittances automatisées.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <BailViewer locataireId={locataire.id} nomLocataire={displayName} />
            
            {locataire.statut === "BROUILLON" ? (
                <>
                <form action={signatureAction as any}>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-lg">
                        Lancer Signature e-mail
                    </button>
                </form>
                <form action={activerAction}>
                    <button type="submit" className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg">
                        Signature Papier Reçue
                    </button>
                </form>
                </>
            ) : (
                <div className="flex items-center gap-4 bg-slate-50 p-2 pl-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase">En attente...</span>
                    <RappelSignatureButton locataireId={locataire.id} />
                </div>
            )}
          </div>
        </div>
      )}

      {/* 4. GRILLE DE GESTION MENSUELLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FINANCES DU CONTRAT */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-3">Conditions financières</h3>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Loyer HC</span>
                  <span className="font-bold text-slate-700">{locataire.loyerHC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Charges</span>
                  <span className="font-bold text-slate-700">{locataire.charges.toFixed(2)} €</span>
                </div>
                <div className="pt-3 border-t border-slate-50 flex justify-between items-baseline">
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Total Mensuel</span>
                  <span className="font-black text-2xl text-blue-600 tracking-tighter">
                      {(locataire.loyerHC + locataire.charges).toFixed(2)} €
                  </span>
                </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Calendar size={14} className="text-blue-500" /> Échéance le {locataire.jourPaiement} du mois
            </div>
          </div>

          {/* CLAUSES PARTICULIÈRES */}
          {locataire.conditionsParticulieres && (
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-3">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                 <Quote size={12} /> Clauses Spécifiques
               </h3>
               <p className="text-xs text-blue-800 leading-relaxed font-medium italic">
                 &quot;{locataire.conditionsParticulieres}&quot;
               </p>
            </div>
          )}
        </div>

        {/* HISTORIQUE DE CE CONTRAT */}
        <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              <Calendar size={16} className="text-blue-600" /> Historique de ce bail
            </h3>
            {locataire.active && <ButtonAction locataireId={locataire.id} />}
          </div>
          
          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[350px]">
            {locataire.paiements.length === 0 ? (
              <div className="p-12 text-center text-slate-300 italic text-sm">Aucun loyer enregistré pour ce contrat précis.</div>
            ) : (
              locataire.paiements.map((p: any) => (
                <div key={p.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-xs">
                        {p.mois}/{String(p.annee).slice(-2)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">Loyer mensuel acquitté</span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Confirmé le {new Date(p.datePaiement).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/api/quittance/${locataire.id}?mois=${p.mois}&annee=${p.annee}`} 
                    target="_blank"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Download size={18} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. GESTION DES DOCUMENTS DU CONTRAT */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest text-blue-600">
            <FileText size={16} /> Archive documentaire du contrat
          </h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col justify-between gap-6 group hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
                <FileText size={24} />
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${locataire.statut === 'ACTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {locataire.statut === 'ACTIF' ? 'Bail Validé' : 'Bail Initial'}
              </div>
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Contrat de location</p>
              <p className="text-[10px] text-slate-400 font-medium">Bail d&apos;habitation Loi ALUR</p>
            </div>
            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <BailViewer locataireId={locataire.id} nomLocataire={displayName} />
              <a href={`/api/contrat/${locataire.id}`} download className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <Download size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    
      {/* 6. RÉSILIATION DE CE CONTRAT (ZONE DE DANGER) */}
      <div className="mt-12 pt-10 border-t border-slate-100">
        <div className="bg-red-50/30 border border-red-100 rounded-[2.5rem] p-10">
          <div className="flex items-center gap-3 mb-3 text-red-800 font-black uppercase text-xs tracking-widest">
            <AlertTriangle size={20} /> 
            <h3>Résiliation de ce bail</h3>
          </div>
          <p className="text-red-700 text-sm mb-8 font-medium opacity-80 max-w-2xl leading-relaxed">
            Mettre fin à ce contrat archivera les données liées à ce bien immobilier. Le locataire conservera son accès à LocAm pour ses autres baux éventuels.
          </p>
          <DangerZoneActions id={locataire.id} />
        </div>
      </div>
    </div>
  );
}