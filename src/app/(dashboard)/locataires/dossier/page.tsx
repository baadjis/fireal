import { archiveLocataire } from "@/app/actions/tenant";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { formatAdminName } from "@/lib/format";
import prisma from "@/lib/prisma";
import { Building2, Trash2 } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function DossierLocatairePage({ searchParams }: any) {
  const { email } = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // On récupère tous les baux liés à cet email pour CE bailleur
  const baux = await prisma.locataire.findMany({
    where: { 
      email: email, 
      bien: { proprietaireId: userId },
      archived: false
    },
    include: { bien: true, paiements: true }
  });

  if (baux.length === 0) return redirect("/locataires");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER : L'INDIVIDU */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-2xl font-black">
             {baux[0].prenom[0]}{baux[0].nom[0]}
           </div>
           <div>
             <h1 className="text-3xl font-black">{formatAdminName(baux[0].prenom, baux[0].nom)}</h1>
             <p className="text-slate-400 font-medium">{email}</p>
           </div>
        </div>
      </div>

      <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 px-4">Contrats de location en cours</h2>

      {/* LISTE DES BAUX (CONTRATS) */}
      <div className="grid grid-cols-1 gap-6">
        {baux.map((bail:any) => (
          <div key={bail.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
             <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Building2 size={24}/></div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{bail.bien.nom}</h3>
                    <p className="text-xs text-slate-400">{bail.bien.adresse}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-300">Loyer mensuel</p>
                    <p className="font-black text-blue-600">{(bail.loyerHC + bail.charges).toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-300">Statut</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{bail.statut}</span>
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <Link href={`/locataires/${bail.id}`} className="bg-slate-100 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                  Gérer ce bail
                </Link>
                {/* ACTION DE RÉSILIATION : Met archived: true uniquement sur ce bail */}
                <form action={archiveLocataire.bind(null, bail.id) as any}>
                   <button type="submit" className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition">
                     <Trash2 size={20} />
                   </button>
                </form>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}