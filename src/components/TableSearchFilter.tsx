'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { useTransition } from "react";

export function TableSearchFilter({ 
  placeholder, 
  filterOptions, 
  filterKey 
}: { 
  placeholder: string, 
  filterOptions?: { label: string, value: string }[],
  filterKey?: string 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      {/* Barre de recherche */}
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-blue-500' : 'text-slate-400'}`} size={18} />
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(e) => updateParams("search", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-sm"
        />
      </div>

      {/* Filtre (Optionnel) */}
      {filterOptions && filterKey && (
        <div className="relative">
          <select
            defaultValue={searchParams.get(filterKey)?.toString()}
            onChange={(e) => updateParams(filterKey, e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="">Tous les statuts</option>
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      )}
    </div>
  );
}