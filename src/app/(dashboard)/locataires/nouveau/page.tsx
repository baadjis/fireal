/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createTenant } from "@/app/actions/tenant";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NouveauLocatairePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // On récupère UNIQUEMENT les biens de ce propriétaire
  const mesBiens = await prisma.bien.findMany({
    where: { proprietaireId: userId }
  });

  // SI AUCUN BIEN : Message bloquant
  if (mesBiens.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-2xl border shadow-sm">
        <div className="text-4xl mb-4">🏠</div>
        <h2 className="text-xl font-bold mb-2">Ajoutez un bien d&apos;abord</h2>
        <p className="text-gray-500 mb-6">
          Vous devez avoir au moins un logement enregistré pour y ajouter des locataires.
        </p>
        <Link href="/biens/nouveau" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold inline-block hover:bg-blue-700 transition">
          Créer mon premier bien
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/locataires" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={16} className="mr-2" />
        Retour à la liste
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-800">Nouveau Locataire</h1>

      <form action={createTenant as any} className="space-y-8">
        
        {/* SECTION 1 : LOGEMENT */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">Logement & Type de bail</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner le logement</label>
            <select 
              name="bienId" 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choisir parmi mes biens --</option>
              {mesBiens.map((bien) => (
                <option key={bien.id} value={bien.id}>
                  {bien.nom} ({bien.ville})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2 italic">
              Note : Pour une colocation, sélectionnez simplement le même logement pour chaque colocataire.
            </p>
          </div>
        </div>

        {/* SECTION 2 : IDENTITÉ DU LOCATAIRE */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">Identité du locataire</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input name="prenom" type="text" required placeholder="Ex: Jean" className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input name="nom" type="text" required placeholder="Ex: Dupont" className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse Email (pour l&apos;envoi des quittances)</label>
            <input name="email" type="email" required placeholder="locataire@exemple.com" className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
            <input name="telephone" type="tel" placeholder="06 00 00 00 00" className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* SECTION 3 : FINANCES */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">Conditions financières</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Loyer Hors Charges (€)</label>
              <input name="loyerHC" type="number" step="0.01" required placeholder="650.00" className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Provision pour charges (€)</label>
              <input name="charges" type="number" step="0.01" required placeholder="50.00" className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jour du paiement (chaque mois)</label>
            <input 
              name="jourPaiement" 
              type="number" 
              min="1" 
              max="31" 
              defaultValue="1" 
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <p className="text-xs text-gray-400 mt-1">Généralement le 1er ou le 5 du mois.</p>
          </div>
        </div>

        <div className="flex gap-4 pb-10">
          <Link href="/locataires" className="flex-1 text-center py-4 border rounded-lg font-semibold hover:bg-gray-50 transition">
            Annuler
          </Link>
          <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
            Créer le bail et le locataire
          </button>
        </div>

      </form>
    </div>
  );
}