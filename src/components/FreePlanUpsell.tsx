'use client'

import Link from "next/link";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
// Importation de la configuration unique
import { APP_PLANS } from "@/lib/plans-config";

export function FreePlanUpsell({ isFree }: { isFree: boolean }) {
  if (!isFree) return null;

  // On récupère dynamiquement les infos du plan BASE
  const basePlan = APP_PLANS.find(p => p.id === "BASE");
  
  // Sécurité au cas où le plan n'est pas trouvé
  if (!basePlan) return null;

  return (
    <div className="mx-3 mt-6 p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl text-white shadow-lg shadow-amber-200/40 relative overflow-hidden group">
      {/* Animation de fond */}
      <Sparkles 
        className="absolute -right-2 -top-2 text-white/20 group-hover:rotate-12 transition-transform duration-700" 
        size={70} 
      />
      
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
            <Zap size={12} className="fill-current text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upgrade</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold leading-tight">
            Passez au plan <span className="text-amber-200">{basePlan.name}</span> pour seulement <span className="underline">{basePlan.price}</span> / bail.
          </p>
          <p className="text-[9px] opacity-90 leading-snug font-medium">
            Supprimez la publicité et automatisez vos quittances par e-mail.
          </p>
        </div>

        <Link 
          href="/compte/billing" 
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all shadow-sm active:scale-95"
        >
          En savoir plus <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}