/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { updateProfile, updatePassword } from "@/app/actions/user";
import { 
  User, Lock, Mail, ShieldCheck, CreditCard, 
  ChevronRight, CheckCircle2, AlertCircle, 
  PenLine, MapPin, Phone, Building2, CheckCircle 
} from "lucide-react";
import Link from "next/link";
import { SignatureManager } from "@/components/SignatureManager";
import { LogoUpload } from "@/components/LogoUpload";

export default async function ComptePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* --- ENTÊTE DE PAGE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil Bailleur</h1>
          <p className="text-slate-500">Gérez vos informations professionnelles et votre identité visuelle.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre depuis</p>
          <p className="text-sm font-bold text-slate-700">
            {user?.createdAt?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* --- SECTION 1 : STATUT ABONNEMENT & STRIPE --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-600">
            <CreditCard size={16} className="text-blue-600" />
            Abonnement & Statut
          </div>
          <Link href="/compte/billing" className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-sm">
            Gérer la facturation <ChevronRight size={12} />
          </Link>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Votre Plan</p>
              <p className="text-lg font-black text-slate-900">{user?.plan || "BASIC"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className={`p-3 rounded-xl shadow-lg ${user?.stripeConnectedId ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-amber-500 text-white shadow-amber-100'}`}>
              {user?.stripeConnectedId ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Réception Loyers</p>
              <p className="text-sm font-black text-slate-900">{user?.stripeConnectedId ? "Stripe Connect Activé" : "Non configuré"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2 : FORMULAIRE PROFIL (Logo + Identité + Adresse) --- */}
      <form action={updateProfile as any} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Building2 size={20} className="text-blue-600" /> Identité Professionnelle
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ces informations sont obligatoires pour la conformité de vos quittances et contrats de bail.
            </p>
          </div>

          <div className="md:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            {/* LOGO */}
            <LogoUpload initialLogo={user?.logoUrl} />

            {/* NOM / PRÉNOM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Prénom</label>
                <input name="firstName" defaultValue={user?.firstName || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Jean" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nom de famille</label>
                <input name="lastName" defaultValue={user?.lastName || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="DUPONT" />
              </div>
            </div>

            {/* RAISON SOCIALE / EMAIL / TEL */}
            <div className="space-y-5 pt-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Raison Sociale (ex: SCI)</label>
                <input name="name" defaultValue={user?.name || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="SCI Nom de l'Immeuble" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email public</label>
                  <input name="email" type="email" defaultValue={user?.email || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Téléphone</label>
                  <input name="telephone" type="tel" defaultValue={user?.telephone || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="06 00 00 00 00" />
                </div>
              </div>
            </div>

            {/* ADRESSE (Loi ALUR) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Adresse postale complète</label>
                <input name="adresse" defaultValue={user?.adresse || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="12 rue de la Paix" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Code Postal</label>
                  <input name="codePostal" defaultValue={user?.codePostal || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="75001" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Ville</label>
                  <input name="ville" defaultValue={user?.ville || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="PARIS" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
                <CheckCircle size={18} /> Enregistrer mon profil
              </button>
            </div>
          </div>
        </div>
      </form>

      <hr className="border-slate-200" />

      {/* --- SECTION 3 : SIGNATURE --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <PenLine size={20} className="text-blue-600" /> Signature Fac-similé
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Elle sera apposée automatiquement sur tous vos documents.
          </p>
        </div>
        <div className="md:col-span-2">
          <SignatureManager initialSignature={user?.signatureData} />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* --- SECTION 4 : SÉCURITÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Lock size={20} className="text-red-600" /> Accès & Sécurité
          </h2>
          <p className="text-sm text-slate-500 mt-1">Modifiez votre mot de passe pour sécuriser votre compte.</p>
        </div>
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <form action={updatePassword as any} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input name="currentPassword" type="password" required placeholder="Mot de passe actuel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <input name="newPassword" type="password" required placeholder="Nouveau mot de passe" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition">
                Mettre à jour l&apos;accès
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FOOTER INFO SECURITY */}
      <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-100">
          <ShieldCheck size={24} />
        </div>
        <div>
          <p className="text-blue-900 font-bold text-sm">Votre espace est sécurisé</p>
          <p className="text-blue-700 text-xs opacity-80 font-medium">
            Toutes les modifications sont enregistrées et cryptées. LocAm n&apos;a jamais accès à votre mot de passe.
          </p>
        </div>
      </div>
    </div>
  );
}