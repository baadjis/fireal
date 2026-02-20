'use client'

import { useState } from "react";
import { confirmerPaiementEtEnvoyerQuittance } from "@/app/actions/quittance";
import { CheckCircle, Loader2, Send } from "lucide-react";

export function ButtonAction({ locataireId }: { locataireId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleAction = async () => {
    if (!confirm("Voulez-vous valider le paiement et envoyer la quittance par email ?")) return;
    
    setStatus('loading');
    const res = await confirmerPaiementEtEnvoyerQuittance(locataireId);
    
    if (res?.success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      alert(res?.error || "Une erreur est survenue");
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={status === 'loading' || status === 'success'}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
        status === 'success' 
          ? "bg-green-100 text-green-700" 
          : status === 'error'
          ? "bg-red-100 text-red-700"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {status === 'loading' ? (
        <Loader2 size={16} className="animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle size={16} />
      ) : (
        <Send size={14} />
      )}
      {status === 'success' ? "Envoyé !" : status === 'loading' ? "Envoi..." : "Quittance"}
    </button>
  );
}