/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBien } from "@/app/actions/biens"

export default function NouveauBienPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ajouter un nouveau bien immobilier</h1>
      
      <form action={createBien as any} className="bg-white p-8 rounded-xl border shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom du bien (ex: Appartement T3)</label>
          <input 
            name="nom" 
            type="text" 
            required 
            placeholder="Nom pour vous repérer"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse complète</label>
          <input 
            name="adresse" 
            type="text" 
            required 
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ville</label>
            <input 
              name="ville" 
              type="text" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code Postal</label>
            <input 
              name="codePostal" 
              type="text" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5" 
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Enregistrer le bien
          </button>
        </div>
      </form>
    </div>
  )
}