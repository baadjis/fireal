/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { createConnectAccount, createSubscription } from "@/app/actions/stripe";
import { CreditCard, Landmark, Check, Zap, ShieldCheck, Star, Crown } from "lucide-react";

// --- CONFIGURATION DES PLANS ---
const PLANS = [
  {
    id: "BASIC",
    name: "Basic",
    price: "0€",
    description: "Pour débuter sereinement.",
    features: ["Avis d'échéances automatiques", "Quittances illimitées", "Gestion manuelle des reçus"],
    color: "blue",
    icon: <Zap size={20} />,
    recommended: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "9.99€",
    description: "L'automatisation totale pour gagner du temps.",
    features: ["Tout du plan Basic", "Paiement CB automatique", "Envoi quittance auto", "Tableau de bord avancé"],
    color: "indigo",
    icon: <Star size={20} />,
    recommended: true,
  },
  {
    id: "EXPERT",
    name: "Expert",
    price: "19.99€",
    description: "Le top de la gestion immobilière.",
    features: ["Tout du plan Pro", "Signature électronique illimitée", "Rappels par SMS", "Support Prioritaire 24h/7j"],
    color: "purple",
    icon: <Crown size={20} />,
    recommended: false,
  }
];

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: (session?.user as any).id }
  });

  const currentPlanId = user?.plan || "BASIC";

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">Facturation & Revenus</h1>
        <p className="text-gray-500">Gérez vos abonnements et configurez la réception des loyers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CARTE STRIPE CONNECT (Réception des loyers) */}
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Landmark size={24} />
          </div>
          <h2 className="text-xl font-bold">Réception des loyers</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Liez votre compte bancaire pour automatiser la détection des paiements et l&apos;envoi des quittances.
          </p>
          {user?.stripeConnectedId ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
              <Check size={18} /> Votre compte bancaire est lié
            </div>
          ) : (
            <form action={createConnectAccount}>
              <button className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Configurer mes virements
              </button>
            </form>
          )}
        </div>

        {/* RÉSUMÉ PLAN ACTUEL */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Crown size={120} />
          </div>
          <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Plan Actuellement Actif</p>
          <h2 className="text-4xl font-black">{currentPlanId}</h2>
          <p className="text-slate-400 mt-2 text-sm italic">
            {PLANS.find(p => p.id === currentPlanId)?.description}
          </p>
        </div>
      </div>

      {/* --- MAPPING DES PLANS --- */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center">Mettre à jour mon abonnement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white p-8 rounded-[2.5rem] border-2 transition-all flex flex-col ${
                  isCurrent 
                  ? `border-${plan.color}-600 shadow-xl scale-105 z-10` 
                  : 'border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Badge Recommandé */}
                {plan.recommended && !isCurrent && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                    Le plus populaire
                  </span>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-${plan.color}-50 text-${plan.color}-600`}>
                    {plan.icon}
                  </div>
                  {isCurrent && (
                    <span className={`bg-${plan.color}-100 text-${plan.color}-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter`}>
                      Actif
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-slate-400 text-sm">/mois</span>
                </div>
                
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className={`mt-0.5 p-0.5 rounded-full bg-${plan.color}-100 text-${plan.color}-600`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold cursor-default">
                    Plan actuel
                  </button>
                ) : (
                  <form action={createSubscription.bind(null, plan.id as any)}>
                    <button 
                      type="submit"
                      className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${
                        plan.id === "EXPERT" 
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                      }`}
                    >
                      S&apos;abonner au plan {plan.name}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}