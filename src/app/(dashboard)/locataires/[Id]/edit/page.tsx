/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { updateLocataire } from "@/app/actions/tenant";
import Link from "next/link";
import { 
  ArrowLeft, User, Euro, Building2, 
  AlertTriangle, Calendar, FileText,
  Lock, Info
} from "lucide-react";

export default async function EditLocatairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Récupérer le contrat (Locataire)
  // On s'assure via le WHERE que ce contrat appartient bien à ce bailleur
  const locataire = await prisma.locataire.findFirst({
    where: { id, bien: { proprietaireId: userId } },
    include: { bien: true }
  });

  if (!locataire) notFound();

  // 2. Vérification de l'indépendance du profil
  // Si userId est présent, le locataire gère lui-même son identité.
  const isLinkedToAccount = !!locataire.userId;

  const mesBiens = await prisma.bien.findMany({
    where: { proprietaireId: userId }
  });

  const updateLocataireWithId = updateLocataire.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <Link href={`/locataires/${id}`} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition font-medium">
        <ArrowLeft size={16} className="mr-2" /> Annuler et retourner au dossier
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion du contrat</h1>
        <p className="text-slate-500 mt-1">Modification des conditions de location.</p>
      </div>

      <form action={updateLocataireWithId as any} className="space-y-6">
        
        {/* --- SECTION 1 : IDENTITÉ (VERROUILLÉE SI COMPTE EXISTANT) --- */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
              <User size={18} /> Identité du locataire
            </h2>
            {isLinkedToAccount && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <Lock size={12} /> Profil vérifié & lié
              </span>
            )}
          </div>

          {isLinkedToAccount && (
            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100 mb-4">
              <Info className="text-blue-600 shrink-0" size={18} />
              <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                Le locataire possède un compte LocAm actif. Ses informations personnelles (Nom, Prénom, Email) sont désormais gérées par lui-même pour garantir l&apos;intégrité de son identité sur ses différents baux.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Prénom</label>
                <input 
                  name="prenom" 
                  defaultValue={locataire.prenom} 
                  disabled={isLinkedToAccount}
                  className={`w-full p-3 border rounded-xl outline-none transition-all ${isLinkedToAccount ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500'}`} 
                />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Nom</label>
                <input 
                  name="nom" 
                  defaultValue={locataire.nom} 
                  disabled={isLinkedToAccount}
                  className={`w-full p-3 border rounded-xl outline-none transition-all ${isLinkedToAccount ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500'}`} 
                />
            </div>
          </div>
          
          <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email</label>
              <input 
                name="email" 
                type="email" 
                defaultValue={locataire.email} 
                disabled={isLinkedToAccount}
                className={`w-full p-3 border rounded-xl outline-none transition-all ${isLinkedToAccount ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500'}`} 
              />
          </div>
        </div>

        {/* --- SECTION 2 : CONDITIONS DU BAIL (TOUJOURS MODIFIABLES PAR LE BAILLEUR) --- */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Building2 size={18} /> Conditions contractuelles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Logement affecté</label>
                <select name="bienId" defaultValue={locataire.bienId} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                {mesBiens.map((bien) => (
                    <option key={bien.id} value={bien.id}>{bien.nom} — {bien.ville}</option>
                ))}
                </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Loyer HC (€)</label>
              <input name="loyerHC" type="number" step="0.01" defaultValue={locataire.loyerHC} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Charges (€)</label>
              <input name="charges" type="number" step="0.01" defaultValue={locataire.charges} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* --- SECTION 3 : CALENDRIER --- */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Calendar size={18} /> Dates & Échéances
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Début du bail</label>
              <input name="dateDebutBail" type="date" defaultValue={locataire.dateDebutBail ? new Date(locataire.dateDebutBail).toISOString().split('T')[0] : ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Jour du paiement</label>
              <input name="jourPaiement" type="number" min="1" max="31" defaultValue={locataire.jourPaiement} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          Mettre à jour le contrat
        </button>

      </form>
    </div>
  );
}