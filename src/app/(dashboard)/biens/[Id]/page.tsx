/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, Users, MapPin, Layers, Hash, Square } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";

export default async function BienDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const bien = await prisma.bien.findFirst({
    where: { id, proprietaireId: userId },
    include: { locataires: { where: { active: true } } }
  });

  if (!bien) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bien */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{bien.nom}</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={16} /> {bien.adresse}, {bien.ville}
            </p>
          </div>
        </div>
        <Link href={`/locataires/nouveau?bienId=${bien.id}`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          + Ajouter un colocataire
        </Link>

        <Link 
             href={`/biens/${bien.id}/edit`} 
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
             Modifier les informations
       </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Caractéristiques Techniques */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold border-b pb-3 flex items-center gap-2">
            <Layers size={18} className="text-blue-600" /> Fiche Technique
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-2"><Layers size={14}/> Type</span>
              <span className="font-bold text-gray-800">{bien?.type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-2"><Hash size={14}/> Étage / Porte</span>
              <span className="font-bold text-gray-800">{bien?.etage || "RDC"} - {bien?.numeroPorte || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 flex items-center gap-2"><Square size={14}/> Surface</span>
              <span className="font-bold text-gray-800">{bien?.surface || "--"} m²</span>
            </div>
          </div>
        </div>

        {/* Liste des occupants (Colocation) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Occupants actuels
            </h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {bien.locataires.length} locataire(s)
            </span>
          </div>

          <div className="divide-y">
            {bien.locataires.length === 0 ? (
              <div className="p-10 text-center text-gray-400 italic">Logement actuellement vacant.</div>
            ) : (
              bien.locataires.map((loc) => (
                <div key={loc.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <Link href={`/locataires/${loc.id}`} className="font-bold text-gray-900 hover:text-blue-600">
                      {loc.prenom} {loc.nom}
                    </Link>
                    <p className="text-sm text-gray-500">{loc.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-sm font-bold text-blue-600">{(loc.loyerHC + loc.charges).toFixed(2)} €</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Loyer mensuel</p>
                    </div>
                    <ButtonAction locataireId={loc.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}