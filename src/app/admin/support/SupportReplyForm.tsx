'use client'

import { useState } from "react";
import { replyToSupport } from "@/app/actions/admin";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export function SupportReplyForm({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setLoading(true);
    const res = await replyToSupport(ticketId, reply);
    setLoading(false);

    if (res.success) {
      setDone(true);
    } else {
      alert("Erreur lors de l'envoi");
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-4 rounded-2xl font-bold text-sm border border-emerald-100">
        <CheckCircle2 size={18} />
        Réponse envoyée avec succès et ticket clôturé.
      </div>
    );
  }

  return (
    <form onSubmit={handleReply} className="space-y-3">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Tapez votre réponse ici..."
        rows={4}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !reply.trim()}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg disabled:bg-slate-200"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {loading ? "Envoi..." : "Répondre par email"}
        </button>
      </div>
    </form>
  );
}