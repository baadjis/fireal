/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SignatureForm } from "./SignatureForm";
import { FileText, ShieldCheck, MapPin, Lock, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { formatAdminName } from "@/lib/format";

export default async function PublicSignPage({ params }: { params: Promise<{ token: string }> }) {
  // 1. Next.js 15 : On attend la promesse des paramètres
  const { token } = await params;

  // 2. Recherche du locataire via le token de signature
  const locataire = await prisma.locataire.findUnique({
    where: { tokenSignature: token },
    include: { 
      bien: { 
        include: { proprietaire: true } 
      } 
    }
  });

  // 3. Cas : Lien invalide ou contrat déjà signé/actif
  if (!locataire || locataire.statut === "ACTIF") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-slate-100 space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document déjà validé</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Ce contrat de bail a déjà été signé électroniquement. Une copie a été envoyée à toutes les parties.
            </p>
          </div>
          <Link href="/" className="inline-block text-blue-600 font-bold text-sm hover:underline">
            Retour sur getlocam.com
          </Link>
        </div>
      </div>
    );
  }

  const bailleurName = formatAdminName(
    locataire.bien.proprietaire.firstName||'', 
    locataire.bien.proprietaire.lastName||'', 
    locataire.bien.proprietaire.name
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* LOGO & EN-TÊTE */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-black text-blue-600 tracking-tighter mb-4">
            LocAm<span className="text-slate-300">.</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Signature de votre bail</h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
             <MapPin size={14} className="text-blue-500" /> 
             {locataire.bien.nom} — {locataire.bien.ville}
          </div>
        </div>

        {/* CARTE D'INFO BAILLEUR */}
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg flex items-center gap-5 relative overflow-hidden">
           <Lock className="absolute right-[-10px] top-[-10px] text-white/10" size={80} />
           <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <User size={24} className="text-white" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Propriétaire Bailleur</p>
              <p className="font-bold text-lg">{bailleurName}</p>
           </div>
        </div>

        {/* ACCÈS AU DOCUMENT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:text-blue-600 transition-colors">
              <FileText size={28} />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Contrat de location</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Bail d&apos;habitation (PDF)</p>
            </div>
          </div>
          {/* Note : Assurez-vous que l'API route autorise l'accès via le token ou la session */}
          {/* Dans le fichier page.tsx de la signature, modifiez le Link */}
<Link 
  href={`/api/contrat/${locataire.id}?token=${token}`} // On passe le token ici !
  target="_blank"
  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md"
>
  Lire le bail
</Link>
        </div>

        {/* COMPOSANT DE SIGNATURE (SignaturePad) */}
        <div className="relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-slate-100 shadow-sm z-10">
             <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Espace Locataire</p>
          </div>
          <SignatureForm token={token} locataireNom={`${locataire.prenom} ${locataire.nom}`} />
        </div>

        {/* FOOTER DE RÉASSURANCE */}
        <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex items-center gap-6 opacity-40 grayscale">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> Sécurisé
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                    <Lock size={14} /> Chiffré
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                    <Info size={14} /> Certifié
                </div>
            </div>
            <p className="text-[9px] text-slate-400 max-w-xs leading-relaxed font-medium">
                En signant ce document, une empreinte numérique incluant votre adresse IP et l&apos;horodatage sera générée à titre de preuve.
            </p>
        </div>
      </div>
    </div>
  );
}

// Composant local simple pour l'icône User
function User(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}