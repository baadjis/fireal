/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { createConnectAccount, createSubscription } from "@/app/actions/stripe";
import { 
  CreditCard, Landmark, Check, Zap, ShieldCheck, 
  Star, Crown, Download, FileText, ChevronRight 
} from "lucide-react";
import Link from "next/link";

// --- CONFIGURATION DES PLANS (Avec classes complètes pour Tailwind) ---
const PLANS = [
  {
    id: "BASIC",
    name: "Basic",
    price: "0€",
    description: "Pour débuter sereinement.",
    features: ["Avis d'échéances automatiques", "Quittances illimitées", "Gestion manuelle des reçus"],
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-600",
    btnColor: "bg-blue-600",
    icon: <Zap size={20} />,
    recommended: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "9.99€",
    description: "L'automatisation totale pour gagner du temps.",
    features: ["Tout du plan Basic", "Paiement CB automatique", "Envoi quittance auto", "Tableau de bord avancé"],
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-600",
    btnColor: "bg-indigo-600",
    icon: <Star size={20} />,
    recommended: true,
  },
  {
    id: "EXPERT",
    name: "Expert",
    price: "19.99€",
    description: "Le top de la gestion immobilière.",
    features: ["Tout du plan Pro", "Signature électronique illimitée", "Rappels par SMS", "Support Prioritaire 24h/7j"],
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-600",
    btnColor: "bg-purple-600",
    icon: <Crown size={20} />,
    recommended: false,
  }
];

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // Récupération des données utilisateur et de l'historique des factures
  const [user, invoices] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.invoice.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const currentPlanId = user?.plan || "BASIC";

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Facturation & Revenus</h1>
        <p className="text-slate-500">Gérez vos abonnements et téléchargez vos justificatifs de paiement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CARTE STRIPE CONNECT (Réception des loyers) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Landmark size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Réception des loyers</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Liez votre compte bancaire pour automatiser la détection des paiements et l&apos;envoi des quittances à vos locataires.
          </p>
          {user?.stripeConnectedId ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
              <Check size={18} /> Votre compte bancaire est lié via Stripe
            </div>
          ) : (
            <form action={createConnectAccount}>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Configurer mes virements
              </button>
            </form>
          )}
        </div>

        {/* RÉSUMÉ PLAN ACTUEL */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
          </div>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Plan Actif</p>
          <h2 className="text-4xl font-black tracking-tight">{currentPlanId}</h2>
          <p className="text-slate-400 mt-2 text-sm italic font-medium">
            {PLANS.find(p => p.id === currentPlanId)?.description}
          </p>
        </div>
      </div>

      {/* --- MAPPING DES PLANS --- */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-slate-900 text-center">Mettre à jour mon abonnement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white p-8 rounded-[2.5rem] border-2 transition-all flex flex-col ${
                  isCurrent 
                  ? `${plan.borderColor} shadow-xl scale-105 z-10` 
                  : 'border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                {plan.recommended && !isCurrent && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-100">
                    Populaire
                  </span>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${plan.bgColor} ${plan.textColor}`}>
                    {plan.icon}
                  </div>
                  {isCurrent && (
                    <span className={`bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                      Actif
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ mois</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                      <div className={`mt-0.5 p-0.5 rounded-full ${plan.bgColor} ${plan.textColor}`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-default">
                    Plan actuel
                  </button>
                ) : (
                  <form action={createSubscription.bind(null, plan.id as any)}>
                    <button 
                      type="submit"
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-lg ${plan.btnColor} hover:brightness-110`}
                    >
                      Choisir {plan.name}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- NOUVELLE SECTION : HISTORIQUE DES FACTURES --- */}
      <div className="pt-10 space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
          <FileText className="text-blue-600" /> Historique de facturation
        </h2>
        
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <CreditCard size={40} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium italic">Aucune facture disponible pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-6">Numéro</th>
                    <th className="p-6">Date</th>
                    <th className="p-6">Type de service</th>
                    <th className="p-6 text-center">Montant</th>
                    <th className="p-6 text-right">Justificatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6 font-bold text-slate-900">{inv.number}</td>
                      <td className="p-6 text-sm text-slate-500 font-medium">
                        {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-6 text-xs font-bold text-slate-400 uppercase tracking-tight">
                        {inv.type.replace('_', ' ')}
                      </td>
                      <td className="p-6 text-center font-black text-slate-900">
                        {inv.amount.toFixed(2)} €
                      </td>
                      <td className="p-6 text-right">
                        <Link 
                          href={`/api/invoice/${inv.id}`} 
                          target="_blank"
                          className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Download size={14} /> PDF
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-10">
        Paiements sécurisés par Stripe • Facturation conforme aux normes européennes
      </p>
    </div>
  );
}