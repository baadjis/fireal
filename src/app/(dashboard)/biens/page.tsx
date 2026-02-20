/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export default async function BiensPage() {
  const session = await getServerSession(authOptions);
  
  // On ne récupère que les biens appartenant à cet utilisateur
  const biens = await prisma.bien.findMany({
    where: {
      proprietaireId: (session?.user as any).id,
    },
  });

  

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Biens Immobiliers</h1>
        <Link href="/biens/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Ajouter un bien</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {biens.map((bien) => (
  <div key={bien.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
    {/* On rend le titre cliquable vers les détails */}
    <Link href={`/biens/${bien.id}`}>
      <h3 className="font-bold text-lg hover:text-blue-600 transition-colors cursor-pointer">
        {bien.nom}
      </h3>
    </Link>
    
    <p className="text-gray-500 text-sm">{bien.adresse}, {bien.ville}</p>

    <div className="mt-4 space-y-3">
      {/* Redirection vers les détails du bien */}
      <Link 
        href={`/biens/${bien.id}`}
        className="text-blue-600 font-medium flex items-center hover:translate-x-1 transition-transform"
      >
        Gérer ce bien →
      </Link>

      <hr className="border-gray-100" />

      {/* Lien pour ajouter un locataire spécifique à ce bien */}
      <Link 
        href={`/locataires/nouveau?bienId=${bien.id}`}
        className="text-sm text-gray-400 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors"
      >
        + Ajouter un colocataire
      </Link>
    </div>
  </div>
))}
      </div>
    </div>
  );
}