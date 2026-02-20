/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateBien } from "@/app/actions/biens";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { Building2, Info, MapPin } from "lucide-react";

export default async function EditBienPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(id)
  const typesLogement = [
  { value: "STUDIO", label: "Studio" },
  { value: "T1", label: "Appartement T1" },
  { value: "T2", label: "Appartement T2" },
  { value: "T3", label: "Appartement T3" },
  { value: "T4", label: "Appartement T4" },
  { value: "T5", label: "Appartement T5" },
  { value: "MAISON", label: "Maison" },
  { value: "PARKING", label: "Parking / Garage" },
  { value: "LOCAL_COMMERCIAL", label: "Local Commercial" },
];
  
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const bien = await prisma.bien.findFirst({
    where: { id, proprietaireId: userId }
  });

  if (!bien) notFound();

  // Le bind lie l'ID comme PREMIER argument de la fonction updateBien
  const updateBienWithId = updateBien.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Modifier le bien : {bien.nom}</h1>
      
      <form action={updateBienWithId as any} className="bg-white p-8 rounded-xl border space-y-4">
         {/* SECTION 1 : INFORMATIONS GÉNÉRALES */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <Info size={18} />
            <h2>Informations générales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du bien</label>
              <input 
                name="nom" 
                type="text" 
                defaultValue={bien.nom}
                required 
                placeholder="Ex: Appartement Lyon 3"
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de bien</label>
              <select 
                name="type" 
                required 
                defaultValue={bien.type}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {typesLogement.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optionnel)</label>
            <textarea 
              name="description" 
              defaultValue={bien?.description || ""}
              rows={3}
              placeholder="Précisions sur l'état, équipements inclus..."
              className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        {/* SECTION 2 : ADRESSE & LOCALISATION */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <MapPin size={18} />
            <h2>Localisation</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse complète</label>
            <input 
              name="adresse" 
              type="text" 
              defaultValue={bien.adresse}
              placeholder="N° et nom de rue"
              className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ville</label>
              <input 
                name="ville" 
                type="text" 
                defaultValue={bien.ville}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Code Postal</label>
              <input 
                name="codePostal" 
                type="text" 
                defaultValue={bien.codePostal}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 : DÉTAILS TECHNIQUES */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <Building2 size={18} />
            <h2>Détails techniques</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Étage</label>
              <input 
                name="etage" 
                type="number" 
                defaultValue={bien.etage || ''}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">N° de porte / Appt</label>
              <input 
                name="numeroPorte" 
                type="text" 
                defaultValue={bien.numeroPorte || ''}
                placeholder="Ex: B24"
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Surface (m²)</label>
              <input 
                name="surface" 
                type="number" 
                step="0.01"
                defaultValue={bien.surface || ''}
                placeholder="Ex: 45.5"
                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}