/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react";
import { formatAdminName } from "@/lib/format";
import { Mail, Download, X, Loader2, MapPin } from "lucide-react";
import { exportToCSV } from "@/lib/export-csv";

export function AdminLocataireTable({ locataires }: { locataires: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- LOGIQUE DE SÉLECTION ---
  const toggleSelectAll = () => {
    if (selectedIds.length === locataires.length) setSelectedIds([]);
    else setSelectedIds(locataires.map(l => l.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- LOGIQUE D'EXPORTATION ---
  const handleExport = () => {
    const dataToExport = locataires
      .filter(l => selectedIds.includes(l.id))
      .map(l => ({
        Nom: formatAdminName(l.prenom, l.nom),
        Email: l.email,
        Logement: l.bien.nom,
        Propriétaire: l.bien.proprietaire.name || l.bien.proprietaire.email,
        Loyer_Total: (l.loyerHC + l.charges).toFixed(2),
        Statut: l.statut,
        Date_Creation: new Date(l.createdAt).toLocaleDateString('fr-FR')
      }));

    exportToCSV(dataToExport, `export_locataires_${new Date().toISOString().slice(0,10)}`);
    setSelectedIds([]); // On vide la sélection après export
  };

  return (
    <div className="relative">
      {/* BARRE D'ACTIONS GROUPÉES */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 z-[100] animate-in slide-in-from-bottom-10">
          <span className="text-xs font-black uppercase tracking-widest">{selectedIds.length} locataires sélectionnés</span>
          <div className="h-6 w-px bg-slate-700" />
          <button onClick={handleExport} className="flex items-center gap-2 text-xs font-bold hover:text-emerald-400 transition">
            <Download size={16} /> Exporter en CSV
          </button>
          <button onClick={() => setSelectedIds([])} className="text-slate-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-6 w-10">
                <input type="checkbox" checked={selectedIds.length === locataires.length && locataires.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300" />
              </th>
              <th className="p-6">Locataire</th>
              <th className="p-6">Propriétaire</th>
              <th className="p-6">Loyer</th>
              <th className="p-6 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {locataires.map((loc) => (
              <tr key={loc.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(loc.id) ? 'bg-blue-50/30' : ''}`}>
                <td className="p-6">
                  <input type="checkbox" checked={selectedIds.includes(loc.id)} onChange={() => toggleSelect(loc.id)} className="rounded border-slate-300 text-blue-600" />
                </td>
                <td className="p-6">
                  <p className="font-bold text-slate-900">{formatAdminName(loc.prenom, loc.nom)}</p>
                  <p className="text-xs text-slate-400">{loc.email}</p>
                </td>
                <td className="p-6">
                   <p className="text-sm font-medium text-slate-700">{loc.bien.proprietaire.name || loc.bien.proprietaire.email}</p>
                   <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10}/> {loc.bien.nom}</p>
                </td>
                <td className="p-6">
                   <p className="font-black text-slate-900">{(loc.loyerHC + loc.charges).toFixed(2)} €</p>
                </td>
                <td className="p-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    loc.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {loc.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}