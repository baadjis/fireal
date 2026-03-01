/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { formatAdminName } from "@/lib/format";
import { User, MapPin, ChevronRight, Hash } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function LocatairesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // On récupère tous les contrats (Locataire) du bailleur
  const contrats = await prisma.locataire.findMany({
    where: { bien: { proprietaireId: userId }, archived: false },
    include: { bien: true },
  });

  // LOGIQUE DE GROUPEMENT PAR EMAIL (Pour voir les individus)
  const locatairesGroupes = contrats.reduce((acc: any, contrat) => {
    const email = contrat.email;
    if (!acc[email]) {
      acc[email] = {
        infos: { prenom: contrat.prenom, nom: contrat.nom, email: contrat.email, userId: contrat.userId },
        nbContrats: 0,
        loyerTotal: 0,
        biens: []
      };
    }
    acc[email].nbContrats += 1;
    acc[email].loyerTotal += (contrat.loyerHC + contrat.charges);
    acc[email].biens.push(contrat.bien.nom);
    return acc;
  }, {});

  const listeLocataires = Object.values(locatairesGroupes);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-black">Mes Locataires ({listeLocataires.length})</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listeLocataires.map((loc: any) => (
          <Link key={loc.infos.email} href={`/locataires/dossier?email=${loc.infos.email}`}>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black">
                  {loc.infos.prenom[0]}{loc.infos.nom[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {formatAdminName(loc.infos.prenom, loc.infos.nom)}
                  </h3>
                  <p className="text-xs text-slate-400">{loc.infos.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Contrats actifs</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{loc.nbContrats}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Total Loyers</span>
                  <span className="text-slate-900">{loc.loyerTotal.toFixed(2)} €</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-blue-600 font-bold text-xs uppercase tracking-widest">
                Voir le dossier complet <ChevronRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}