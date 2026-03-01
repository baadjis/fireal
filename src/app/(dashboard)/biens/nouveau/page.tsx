/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBien } from "@/app/actions/biens";
import Link from "next/link";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Info, 
  Armchair, 
  Layout, 
  FileText 
} from "lucide-react";

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

export default function NouveauBienPage() {
  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Retour */}
      <Link href="/biens" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition font-medium">
        <ArrowLeft size={16} className="mr-2" />
        Retour au patrimoine
      </Link>

      <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Ajouter un bien immobilier</h1>

      <form action={createBien as any} className="space-y-6">
        
        {/* SECTION 1 : RÉGIME DE LOCATION (Meublé ou Nu) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Armchair size={18} /> Régime de location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative flex flex-col p-4 border-2 border-slate-100 rounded-2xl cursor-pointer transition-all hover:border-slate-200 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">Location Nue</span>
                <input type="radio" name="isMeuble" value="false" defaultChecked className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Bail standard de 3 ans. <br/>Idéal pour les logements vides.</p>
            </label>

            <label className="relative flex flex-col p-4 border-2 border-slate-100 rounded-2xl cursor-pointer transition-all hover:border-slate-200 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">Location Meublée</span>
                <input type="radio" name="isMeuble" value="true" className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Bail d&apos;un an renouvelable. <br/>Équipements obligatoires inclus.</p>
            </label>
          </div>
        </div>

        {/* SECTION 2 : INFORMATIONS GÉNÉRALES */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <Info size={18} />
            <h2>Informations générales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Nom personnalisé du bien</label>
              <input 
                name="nom" 
                type="text" 
                required 
                placeholder="Ex: T2 Centre-Ville"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Type de bien</label>
              <select 
                name="type" 
                required 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {typesLogement.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Description courte</label>
            <textarea 
              name="description" 
              rows={2}
              placeholder="Précisions sur l'état général du bien..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            ></textarea>
          </div>
        </div>

        {/* SECTION 3 : ADRESSE & LOCALISATION */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <MapPin size={18} />
            <h2>Localisation</h2>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Adresse complète</label>
            <input 
              name="adresse" 
              type="text" 
              required 
              placeholder="N° et nom de rue"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Ville</label>
              <input 
                name="ville" 
                type="text" 
                required 
                placeholder="Ex: Paris"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Code Postal</label>
              <input 
                name="codePostal" 
                type="text" 
                required 
                placeholder="75000"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
              />
            </div>
          </div>
        </div>

        {/* SECTION 4 : DÉTAILS TECHNIQUES */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <Layout size={18} />
            <h2>Détails techniques</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Étage</label>
              <input 
                name="etage" 
                type="number" 
                placeholder="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">N° de porte</label>
              <input 
                name="numeroPorte" 
                type="text" 
                placeholder="A21"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Surface (m²)</label>
              <input 
                name="surface" 
                type="number" 
                step="0.01" 
                placeholder="45"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" 
              />
            </div>
          </div>
        </div>

        {/* SECTION 5 : INVENTAIRE ET ACCÈS */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <FileText size={18} />
            <h2>Inventaire & Accès</h2>
          </div>
          <p className="text-[10px] text-slate-400 italic px-1 leading-relaxed">
            Listez ici les meubles (si meublé) ou les accessoires remis (badges Vigik, nombre de clés, télécommande garage, codes digicodes). Ces données figureront sur le bail.
          </p>
          <textarea 
            name="inventaire" 
            rows={5}
            placeholder="Ex: 1 Canapé cuir, 2 Badges d'accès, 3 Jeux de clés..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
          ></textarea>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/biens" className="flex-1 text-center py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition">
            Annuler
          </Link>
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100"
          >
            Créer le bien immobilier
          </button>
        </div>
      </form>
    </div>
  );
}