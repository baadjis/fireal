/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react";
import { formatAdminName } from "@/lib/format";
import { AdminUserActions } from "@/components/AdminUserActions";
import { Mail, Send, X, Loader2, Download, Users, CheckCircle2 } from "lucide-react";
import { sendBulkEmailAction } from "@/app/actions/admin";
import { exportToCSV } from "@/lib/export-csv";

export function AdminUserTable({ users }: { users: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- GESTION DE LA SÉLECTION ---
  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // --- ACTION : EXPORT CSV ---
  const handleExport = () => {
    const dataToExport = users
      .filter(u => selectedIds.includes(u.id))
      .map(u => ({
        Nom: formatAdminName(u.firstName, u.lastName, u.name),
        Email: u.email,
        Plan: u.plan,
        Biens: u._count.biens,
        Date_Inscription: new Date(u.createdAt).toLocaleDateString('fr-FR')
      }));

    exportToCSV(dataToExport, `export_admin_users_${new Date().toISOString().split('T')[0]}`);
    setSelectedIds([]);
  };

  // --- ACTION : EMAIL GROUPÉ ---
  const handleBulkEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!subject || !message) return;

    setLoading(true);
    const res = await sendBulkEmailAction(selectedIds, subject, message);
    setLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      setSelectedIds([]);
      alert("Message envoyé avec succès !");
    } else {
      alert("Erreur : " + res.error);
    }
  };

  return (
    <div className="relative pb-40"> {/* pb-40 pour laisser de la place aux menus du bas */}
      
      {/* BARRE D'ACTIONS GROUPÉES (Flottante) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 z-[100] animate-in slide-in-from-bottom-10 duration-300 border border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black italic">
              {selectedIds.length}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sélectionnés</span>
          </div>
          
          <div className="h-6 w-px bg-slate-700" />

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter hover:text-blue-400 transition-colors"
            >
              <Mail size={16} /> Email
            </button>

            <button 
              onClick={handleExport} 
              className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter hover:text-emerald-400 transition-colors"
            >
              <Download size={16} /> Exporter
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <button 
            onClick={() => setSelectedIds([])} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-visible z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-6 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={selectedIds.length === users.length && users.length > 0} 
                  onChange={toggleSelectAll} 
                />
              </th>
              <th className="p-6">Propriétaire</th>
              <th className="p-6">Plan</th>
              <th className="p-6 text-center">Patrimoine</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr 
                key={u.id} 
                className={`transition-colors duration-150 ${
                  selectedIds.includes(u.id) ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                }`}
              >
                <td className="p-6">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIds.includes(u.id)} 
                    onChange={() => toggleSelect(u.id)} 
                  />
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                      {u.firstName?.[0] || u.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        {formatAdminName(u.firstName, u.lastName, u.name)}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    u.plan === 'PRO' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                    u.plan === 'EXPERT' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {u.plan}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-black text-slate-700">{u._count.biens}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Logements</span>
                  </div>
                </td>
                <td className="p-6 text-right overflow-visible">
                  <AdminUserActions user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE D'ENVOI D'EMAIL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Email Groupé</h2>
                <p className="text-sm text-slate-500">Envoi à {selectedIds.length} utilisateurs</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objet de l&apos;email</label>
                <input name="subject" required placeholder="Ex: Importante mise à jour du service" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Votre Message</label>
                <textarea name="message" required rows={6} placeholder="Écrivez votre message ici..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm leading-relaxed" />
              </div>
              
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:bg-slate-200"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}