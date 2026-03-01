/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createTenant } from "@/app/actions/tenant";
import Link from "next/link";
import { 
  ArrowLeft, User, Euro, Building2, 
  Calendar, FileText, PenTool, CheckCircle, 
  Info, AlertCircle, 
  ArrowRight
} from "lucide-react";

export default async function NouveauLocatairePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ bienId?: string }> 
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;
  const { bienId: preselectedBienId } = await searchParams;

  // Récupération des biens du propriétaire
  const mesBiens = await prisma.bien.findMany({
    where: { proprietaireId: userId }
  });

  // État bloquant si aucun bien n'existe
  if (mesBiens.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Building2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Patrimoine vide</h2>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          Vous devez enregistrer un logement avant de pouvoir y affecter un contrat de location.
        </p>
        <Link href="/biens/nouveau" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          Ajouter mon premier bien
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <Link href="/locataires" className="flex items-center text-sm text-gray-400 hover:text-blue-600 transition font-bold mb-8">
        <ArrowLeft size={16} className="mr-2" /> Retour à la liste
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nouveau Contrat</h1>
        <p className="text-slate-500 mt-2">Créez un bail conforme ou importez un locataire existant.</p>
      </div>

      <form action={createTenant as any} className="space-y-8">
        
        {/* SECTION 1 : LOGEMENT ET AFFECTATION */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
            <Building2 size={16} /> Destination du bail
          </h2>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sélectionner le logement</label>
            <select 
              name="bienId" 
              required 
              defaultValue={preselectedBienId || ""}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            >
              <option value="">-- Choisissez un bien immobilier --</option>
              {mesBiens.map((bien) => (
                <option key={bien.id} value={bien.id}>{bien.nom} — {bien.ville}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2 : IDENTITÉ DU LOCATAIRE */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
            <User size={16} /> État civil du locataire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Prénom</label>
              <input name="prenom" type="text" required placeholder="Jean" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nom de famille</label>
              <input name="nom" type="text" required placeholder="DUPONT" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email (Obligatoire)</label>
              <input name="email" type="email" required placeholder="locataire@email.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Téléphone mobile</label>
              <input name="telephone" type="tel" placeholder="06 00 00 00 00" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>
        </div>

        {/* SECTION 3 : PARAMÈTRES FINANCIERS */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
            <Euro size={16} /> Échéancier financier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Loyer Hors Charges (€)</label>
              <input name="loyerHC" type="number" step="0.01" required placeholder="850.00" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Charges mensuelles (€)</label>
              <input name="charges" type="number" step="0.01" required placeholder="50.00" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Jour du prélèvement / paiement</label>
            <input name="jourPaiement" type="number" min="1" max="31" defaultValue="1" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>

        {/* SECTION 4 : SIGNATURE & DOCUMENTS (LOGIQUE ENTERPRISE) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
            <PenTool size={16} /> Statut du bail actuel
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative flex flex-col p-5 border-2 rounded-3xl cursor-pointer hover:bg-slate-50 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs uppercase tracking-widest text-slate-700">À faire signer</span>
                <input type="radio" name="alreadySigned" value="no" defaultChecked className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Nouveau locataire : nécessite une signature (papier ou électronique) pour activer la gestion.</p>
            </label>

            <label className="relative flex flex-col p-5 border-2 rounded-3xl cursor-pointer hover:bg-slate-50 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs uppercase tracking-widest text-slate-700">Déjà signé</span>
                <input type="radio" name="alreadySigned" value="yes" className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Locataire déjà en place : activation immédiate sans envoi de bail automatique.</p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Date d&apos;effet du bail</label>
              <input name="dateDebutBail" type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Date de fin prévue</label>
              <input name="dateFinBail" type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Conditions particulières / Clauses</label>
            <textarea 
              name="conditionsParticulieres" 
              rows={4} 
              placeholder="Ex : Le locataire est responsable de l'entretien annuel de la chaudière..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
             <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
               Si vous choisissez &quot;À faire signer&quot;, vous pourrez envoyer le contrat au locataire par e-mail depuis la fiche détaillée après la création.
             </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Link href="/locataires" className="flex-1 text-center py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition">
            Annuler
          </Link>
          <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
            Créer le dossier <ArrowRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
}