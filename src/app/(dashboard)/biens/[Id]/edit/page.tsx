/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateBien } from "@/app/actions/biens";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { Building2, Info, MapPin, Armchair, Layout, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default async function EditBienPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
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

  const updateBienWithId = updateBien.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <Link href={`/biens/${id}`} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={16} className="mr-2" /> Annuler et retourner aux détails
      </Link>

      <h1 className="text-3xl font-black text-slate-900 mb-8">Modifier le bien : {bien.nom}</h1>
      
      <form action={updateBienWithId as any} className="space-y-6">
        
        {/* SECTION 1 : TYPE DE LOCATION (NOUVEAU) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Armchair size={18} /> Régime de location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${!bien.isMeuble ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">Location Nue</span>
                <input type="radio" name="isMeuble" value="false" defaultChecked={!bien.isMeuble} className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] text-slate-500">Bail standard de 3 ans. Dépôt de garantie : 1 mois HC max.</p>
            </label>

            <label className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${bien.isMeuble ? 'border-orange-600 bg-orange-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">Location Meublée</span>
                <input type="radio" name="isMeuble" value="true" defaultChecked={bien.isMeuble} className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-[10px] text-slate-500">Bail d&apos;un an. Logement équipé. Dépôt de garantie : 2 mois HC max.</p>
            </label>
          </div>
        </div>

        {/* SECTION 2 : INFORMATIONS GÉNÉRALES */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Info size={18} /> Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Nom du bien</label>
              <input name="nom" type="text" defaultValue={bien.nom} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Catégorie</label>
              <select name="type" required defaultValue={bien.type} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                {typesLogement.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3 : ADRESSE */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <MapPin size={18} /> Localisation
          </h2>
          <input name="adresse" type="text" defaultValue={bien.adresse} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Adresse" />
          <div className="grid grid-cols-2 gap-4">
            <input name="ville" type="text" defaultValue={bien.ville} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ville" />
            <input name="codePostal" type="text" defaultValue={bien.codePostal} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Code Postal" />
          </div>
        </div>

        {/* SECTION 4 : DÉTAILS TECHNIQUES */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Layout size={18} /> Caractéristiques
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <input name="etage" type="number" defaultValue={bien.etage || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Étage" />
            <input name="numeroPorte" type="text" defaultValue={bien.numeroPorte || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Porte" />
            <input name="surface" type="number" step="0.01" defaultValue={bien.surface || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Surface m²" />
          </div>
        </div>

        {/* SECTION 5 : INVENTAIRE ET DESCRIPTION (NOUVEAU) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <FileText size={18} /> Inventaire & Description
          </h2>
          <p className="text-[10px] text-slate-400 italic px-1">
            Indiquez ici la liste des meubles (si meublé) ou les éléments d&apos;accès (badges, codes, nombre de clés).
          </p>
          <textarea 
            name="inventaire" 
            defaultValue={bien.inventaire || ""}
            rows={5}
            placeholder="Ex: 1 Canapé, 1 Table de chevet, 2 Badges d'accès Vigik, 3 Jeux de clés..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}