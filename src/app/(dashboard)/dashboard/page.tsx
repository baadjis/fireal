/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  Building2, Users, FileText, ArrowRight, 
  Sparkles, CheckCircle2, Plus, Zap, Landmark,
  AlertCircle, TrendingUp, Lock
} from "lucide-react";
import Link from "next/link";
import { IncomeChart } from "@/components/charts/IncomeChart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Préparation des dates pour le graphique (6 derniers mois)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  // 2. Récupération des données en parallèle
  const [biensCount, locatairesCount, quittancesMois, user, rawPaiements] = await Promise.all([
    prisma.bien.count({ where: { proprietaireId: userId } }),
    prisma.locataire.count({ where: { bien: { proprietaireId: userId }, archived: false } }),
    prisma.paiement.count({ 
      where: { locataire: { bien: { proprietaireId: userId } }, mois: currentMonth, annee: currentYear } 
    }),
    prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { 
        plan: true, 
        stripeConnectedId: true,
        telephone: true, adresse: true, ville: true, firstName: true, lastName: true
      } 
    }),
    // On récupère les vrais loyers encaissés pour le graphique
    prisma.paiement.findMany({
      where: {
        locataire: { bien: { proprietaireId: userId } },
        datePaiement: { gte: sixMonthsAgo }
      },
      include: { locataire: true }
    })
  ]);

  // 3. Formatage des données pour le graphique
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const chartDataMap: { [key: string]: any } = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    chartDataMap[label] = { name: label, total: 0 };
  }

  rawPaiements.forEach(p => {
    const date = new Date(p.datePaiement);
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    if (chartDataMap[label]) {
      // On additionne Loyer + Charges pour le revenu total
      chartDataMap[label].total += (p.locataire.loyerHC + p.locataire.charges);
    }
  });

  const chartData = Object.values(chartDataMap);

  const stats = [
    { name: "Patrimoine", value: `${biensCount} Biens`, icon: <Building2 className="text-blue-600" />, color: "bg-blue-50" },
    { name: "Locataires", value: locatairesCount, icon: <Users className="text-emerald-600" />, color: "bg-emerald-50" },
    { name: "Quittances (Mois)", value: quittancesMois, icon: <FileText className="text-purple-600" />, color: "bg-purple-50" },
  ];

  const isProfileIncomplete = !user?.telephone || !user?.adresse || !user?.ville;
  const isPro = user?.plan === "PRO" || user?.plan === "EXPERT";

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* HEADER & ACTIONS RAPIDES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ravi de vous revoir, {user?.firstName || "Propriétaire"} 👋
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-sm italic">Espace de gestion {user?.plan}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/locataires/nouveau" className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm">
            <Plus size={16} /> Nouveau Locataire
          </Link>
          <Link href="/biens/nouveau" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-md shadow-blue-100">
            <Building2 size={16} /> Ajouter un bien
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.name}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION ANALYSE FINANCIÈRE (GRAPHIQUE) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" /> Flux de trésorerie
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Loyers encaissés (6 derniers mois)</p>
               </div>
               {isPro && <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg uppercase tracking-tighter">Données en direct</span>}
            </div>

            {/* OVERLAY POUR PLAN BASIC */}
            {!isPro && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] z-20 flex items-center justify-center">
                 <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-2xl text-center max-w-xs space-y-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Lock size={20} />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Fonctionnalité PRO</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Débloquez l&apos;analyse financière et l&apos;automatisation des loyers.</p>
                    </div>
                    <Link href="/compte/billing" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition">
                        Passer au plan PRO
                    </Link>
                 </div>
              </div>
            )}

            <div className={!isPro ? "opacity-20 grayscale" : ""}>
               <IncomeChart data={chartData} color="#10b981" />
            </div>
          </div>

          {/* ALERTE PROFIL INCOMPLET */}
          {isProfileIncomplete && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Coordonnées manquantes</h3>
                  <p className="text-amber-700 text-xs font-medium">Complétez votre adresse et téléphone pour générer des documents valides.</p>
                </div>
              </div>
              <Link href="/compte" className="bg-amber-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition">
                Mettre à jour
              </Link>
            </div>
          )}
          
          {/* BANNIÈRE UPSELL (Si Basic) */}
          {!isPro && (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl">
              <Sparkles className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 -rotate-12" />
              <div className="relative z-10 space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                  <Zap size={14} className="fill-current" /> Automatisation
                </div>
                <h2 className="text-3xl font-black tracking-tight">Gagnez 4h par mois.</h2>
                <p className="text-blue-100 text-sm font-medium">
                  Le plan PRO automatise l&apos;encaissement par CB et l&apos;envoi instantané des quittances PDF.
                </p>
                <div className="pt-4">
                  <Link href="/compte/billing" className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition shadow-lg">
                    Découvrir l&apos;offre
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : RÉSUMÉ & INFOS */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2 mb-6">
               <Zap className="text-amber-500" size={16} /> Status ce mois-ci
            </h3>
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collectés</span>
                  <span className="text-xl font-black text-slate-900">{quittancesMois} / {locatairesCount}</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000" 
                    style={{ width: `${(quittancesMois / locatairesCount) * 100 || 0}%` }}
                  />
               </div>
               <p className="text-[10px] text-slate-400 italic">
                 {locatairesCount - quittancesMois} locataire(s) n&apos;ont pas encore reçu de quittance pour {monthNames[now.getMonth()]}.
               </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
            <h3 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-slate-400">Assistance LocAm</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">Une question sur un contrat de bail ou un problème technique ?</p>
            <Link href="/contact" className="block w-full bg-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-blue-700 transition">
              Contacter le support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}