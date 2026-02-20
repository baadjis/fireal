/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { updateLocataire } from "@/app/actions/tenant";
import Link from "next/link";
import { ArrowLeft, User, Euro, Building2, AlertTriangle } from "lucide-react";

export default async function EditLocatairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Récupérer le locataire actuel
  const locataire = await prisma.locataire.findFirst({
    where: { id, bien: { proprietaireId: userId } },
    include: { bien: true }
  });

  if (!locataire) notFound();

  // 2. Récupérer tous les biens du proprio pour le menu déroulant
  const mesBiens = await prisma.bien.findMany({
    where: { proprietaireId: userId }
  });

  // 3. Préparer l'action avec l'ID (Passage de l'ID à la Server Action)
  const updateLocataireWithId = updateLocataire.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <Link href={`/locataires/${id}`} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={16} className="mr-2" />
        Annuler et retourner au dossier
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-800">Modifier le contrat</h1>

      <form action={updateLocataireWithId as any} className="space-y-6">
        
        {/* STATUT DU CONTRAT */}
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 flex items-start gap-4">
          <div className="mt-1 text-orange-600"><AlertTriangle size={20} /></div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-900">Statut de l&apos;occupation</h3>
            <div className="mt-3 flex items-center gap-3">
              <input 
                type="checkbox" 
                name="active" 
                id="active" 
                defaultChecked={locataire.active}
                className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-orange-800">
                Le locataire est toujours présent dans le logement
              </label>
            </div>
            <p className="text-xs text-orange-700 mt-2 italic">
              Si vous décochez cette case, les avis d&apos;échéance automatiques s&apos;arrêteront immédiatement.
            </p>
          </div>
        </div>

        {/* IDENTITÉ */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <User size={18} />
            <h2>Identité du locataire</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input name="prenom" defaultValue={locataire.prenom} required className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input name="nom" defaultValue={locataire.nom} required className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Essentiel pour les quittances)</label>
            <input name="email" type="email" defaultValue={locataire.email} required className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
            <input name="telephone" type="tel" defaultValue={locataire.telephone as any} required className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        

        {/* LOGEMENT */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <Building2 size={18} />
            <h2>Affectation du logement</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Choisir le bien immobilier</label>
            <select name="bienId" defaultValue={locataire.bienId} className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {mesBiens.map((bien) => (
                <option key={bien.id} value={bien.id}>{bien.nom} - {bien.ville}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FINANCES */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <Euro size={18} />
            <h2>Conditions financières</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Loyer Hors Charges (€)</label>
              <input name="loyerHC" type="number" step="0.01" defaultValue={locataire.loyerHC} required className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Charges (€)</label>
              <input name="charges" type="number" step="0.01" defaultValue={locataire.charges} required className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jour du paiement</label>
            <input name="jourPaiement" type="number" min="1" max="31" defaultValue={locataire.jourPaiement} className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}