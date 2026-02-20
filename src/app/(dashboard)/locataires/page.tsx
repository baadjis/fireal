/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { ButtonAction } from "@/components/ButtonAction";
import { User, Download, ChevronRight } from "lucide-react";

export default async function LocatairesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const locataires = await prisma.locataire.findMany({
    where: {
      bien: { proprietaireId: userId },
      archived: false
    },
    include: {
      bien: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Locataires</h1>
          <p className="text-gray-500">Gérez vos baux et vos quittances</p>
        </div>
        <Link href="/locataires/nouveau" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition">
          + Nouveau Locataire
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
              <th className="p-5">Locataire & Statut</th>
              <th className="p-5">Bien & Logement</th>
              <th className="p-5">Loyer Mensuel</th>
              <th className="p-5 text-right">Actions rapides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {locataires.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-gray-400">
                  Aucun locataire enregistré pour le moment.
                </td>
              </tr>
            ) : (
              locataires.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <Link href={`/locataires/${loc.id}`} className="font-bold text-gray-900 hover:text-blue-600 block">
                          {loc.prenom} {loc.nom}
                        </Link>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          loc.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {loc.statut}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-5">
                    <p className="text-sm font-medium text-gray-700">{loc.bien.nom}</p>
                    <p className="text-xs text-gray-400">{loc.bien.adresse}</p>
                  </td>

                  <td className="p-5">
                    <p className="text-sm font-bold text-gray-900">
                      {(loc.loyerHC + loc.charges).toFixed(2)} €
                    </p>
                    <p className="text-[10px] text-gray-400 italic">Charges comprises</p>
                  </td>

                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* BOUTON PDF : Toujours utile pour voir le dernier document */}
                      <a 
                        href={`/api/quittance/${loc.id}`}
                        target="_blank"
                        title="Dernière quittance"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Download size={18} />
                      </a>

                      {/* ACTION CONTEXTUELLE */}
                      {loc.statut === "ACTIF" ? (
                        <ButtonAction locataireId={loc.id}/>
                      ) : (
                        <Link 
                          href={`/locataires/${loc.id}`}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition"
                        >
                          Finaliser <ChevronRight size={14} />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}