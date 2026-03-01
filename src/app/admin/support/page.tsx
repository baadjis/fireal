import prisma from "@/lib/prisma";
import { MessageSquare, Send } from "lucide-react";
import { SupportReplyForm } from "./SupportReplyForm"; // Composant client pour le textarea

export default async function AdminSupportPage() {
  const tickets = await prisma.supportTicket.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black">Tickets Support ({tickets.length})</h1>
      
      <div className="grid gap-6">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900">{t.name} ({t.email})</p>
                <p className="text-xs text-blue-600 font-bold uppercase">{t.subject}</p>
              </div>
              <span className="text-[10px] text-slate-300 font-bold">{new Date(t.createdAt).toLocaleString()}</span>
            </div>
            <p className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 italic">&quot;{t.message}&quot;</p>
            
            {/* Formulaire de réponse */}
            <SupportReplyForm ticketId={t.id} />
          </div>
        ))}
      </div>
    </div>
  );
}