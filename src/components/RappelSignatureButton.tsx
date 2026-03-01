'use client'

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { renvoyerRappelSignature } from "@/app/actions/tenant";

export function RappelSignatureButton({ locataireId }: { locataireId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRappel = async () => {
    setLoading(true);
    const res = await renvoyerRappelSignature(locataireId);
    setLoading(false);

    if (res.success) {
      setSent(true);
      setTimeout(() => setSent(false), 5000); // Reset après 5s
    } else {
      alert(res.error);
    }
  };

  return (
    <button
      onClick={handleRappel}
      disabled={loading || sent}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        sent 
          ? "bg-emerald-100 text-emerald-700" 
          : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 shadow-sm"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : sent ? <CheckCircle2 size={14} /> : <Send size={14} />}
      {sent ? "Rappel envoyé !" : "Envoyer un rappel"}
    </button>
  );
}