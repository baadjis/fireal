'use client'

import { useState } from "react";
import { Send, Loader2, CheckCircle2, Zap } from "lucide-react";
import { inviterLocataire } from "@/app/actions/tenant";
import Link from "next/link";

export function InviteButton({ locataireId, plan }: { locataireId: string, plan: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Vérification du plan : Seuls PRO et EXPERT peuvent inviter
  const isEligible = plan === "PRO" || plan === "EXPERT";

  const handleInvite = async () => {
    if (!isEligible) return;
    setLoading(true);
    const res = await inviterLocataire(locataireId);
    setLoading(false);
    if (res.success) setSent(true);
    else alert(res.error);
  };

  if (!isEligible) {
    return (
      <Link href="/compte/billing" className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition">
        <Zap size={12} /> Débloquer (Plan PRO)
      </Link>
    );
  }

  return (
    <button
      onClick={handleInvite}
      disabled={loading || sent}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        sent 
          ? "bg-emerald-100 text-emerald-700" 
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : sent ? <CheckCircle2 size={14} /> : <Send size={14} />}
      {sent ? "Invitation envoyée" : "Inviter sur LocAm"}
    </button>
  );
}