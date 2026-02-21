import { Building2, Users, FileText, CheckCircle, Search, Bell } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex h-[500px] text-left">
      {/* Sidebar simulée */}
      <div className="w-48 border-r border-slate-100 bg-slate-50 p-4 hidden md:flex flex-col gap-4">
        <div className="h-6 w-24 bg-blue-600 rounded-md mb-4" />
        {[Building2, Users, FileText].map((Icon, i) => (
          <div key={i} className="flex items-center gap-3">
            <Icon size={16} className="text-slate-400" />
            <div className="h-2 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Contenu simulé */}
      <div className="flex-1 flex flex-col">
        {/* Topbar simulée */}
        <div className="h-14 border-b border-slate-100 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-300">
            <Search size={16} />
            <span className="text-xs">Rechercher un locataire...</span>
          </div>
          <Bell size={16} className="text-slate-300" />
        </div>

        <div className="p-6 space-y-6 overflow-hidden">
          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                <div className="h-2 w-12 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-8 bg-slate-800 rounded" />
              </div>
            ))}
          </div>

          {/* Bannière PRO simulée */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="h-4 w-48 bg-white/20 rounded mb-2" />
            <div className="h-3 w-64 bg-white/10 rounded" />
          </div>

          {/* Liste de locataires simulée */}
          <div className="space-y-3">
            <div className="h-3 w-32 bg-slate-800 rounded mb-4" />
            {[
              { name: "Jean Dupont", status: "Payé", color: "bg-green-100 text-green-700" },
              { name: "Marie Curie", status: "En attente", color: "bg-amber-100 text-amber-700" },
              { name: "Paul Valéry", status: "Payé", color: "bg-green-100 text-green-700" },
            ].map((loc, i) => (
              <div key={i} className="flex justify-between items-center p-3 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full" />
                  <div>
                    <div className="font-bold text-xs text-slate-700">{loc.name}</div>
                    <div className="h-2 w-16 bg-slate-100 rounded mt-1" />
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${loc.color}`}>
                  {loc.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}