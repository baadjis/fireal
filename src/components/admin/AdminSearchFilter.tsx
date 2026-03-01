'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTransition } from "react";

export function AdminSearchFilter({ 
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

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("search", term);
    else params.delete("search");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleFilter = (value: string) => {
    if (!filterKey) return;
    const params = new URLSearchParams(searchParams);
    if (value) params.set(filterKey, value);
    else params.delete(filterKey);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Barre de recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        />
        {isPending && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 animate-pulse uppercase">Calcul...</div>}
      </div>

      {/* Filtre Dropdown (optionnel) */}
      {filterOptions && filterKey && (
        <select
          defaultValue={searchParams.get(filterKey)?.toString()}
          onChange={(e) => handleFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Tous les {filterKey}s</option>
          {filterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}