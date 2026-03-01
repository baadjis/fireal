/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Users, Building2, MessageSquare, Zap, ArrowUpRight, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { IncomeChart } from "@/components/charts/IncomeChart";

export default async function AdminDashboardPage() {
  // 1. Calcul de la date d'il y a 6 mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // 2. Récupération des données globales + Invoices réelles
  const [totalUsers, totalBiens, totalLocataires, openTickets, rawInvoices] = await Promise.all([
    prisma.user.count(),
    prisma.bien.count(),
    prisma.locataire.count({ where: { archived: false } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.invoice.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        amount: true,
        createdAt: true
      }
    })
  ]);

  // 3. Formater les données pour le graphique (6 derniers mois)
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  
  // On crée un squelette pour les 6 derniers mois avec 0€ par défaut
  const chartDataMap: { [key: string]: any } = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    chartDataMap[label] = { name: label, total: 0, month: d.getMonth(), year: d.getFullYear() };
  }

  // On remplit avec les vraies données de la base
  rawInvoices.forEach(inv => {
    const invDate = new Date(inv.createdAt);
    const label = `${monthNames[invDate.getMonth()]} ${invDate.getFullYear().toString().slice(-2)}`;
    if (chartDataMap[label]) {
      chartDataMap[label].total += inv.amount;
    }
  });

  const chartData = Object.values(chartDataMap);

  const stats = [
    { name: "Utilisateurs", value: totalUsers, icon: <Users />, color: "text-blue-600", bg: "bg-blue-100/50", href: "/admin/users" },
    { name: "Locataires globaux", value: totalLocataires, icon: <UserCheck />, color: "text-emerald-600", bg: "bg-emerald-100/50", href: "/admin/locataires" },
    { name: "Biens total", value: totalBiens, icon: <Building2 />, color: "text-purple-600", bg: "bg-purple-100/50", href: "/admin/users" },
    { name: "Tickets actifs", value: openTickets, icon: <MessageSquare />, color: "text-amber-600", bg: "bg-amber-100/50", href: "/admin/support" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Console Admin</h1>
          <p className="text-slate-500 font-medium">Suivi de la croissance de LocAm en temps réel.</p>
        </div>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="bg-white p-6 rounded-[2.5rem] border border-white shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowUpRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.name}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRAPHIQUE DES REVENUS RÉELS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-black text-xs uppercase tracking-widest text-slate-800">Chiffre d&apos;affaires (HT)</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Basé sur les factures payées</p>
            </div>
            <Zap size={16} className="text-blue-600" />
          </div>
          <IncomeChart data={chartData} color="#2563eb" />
        </div>

        {/* ACTIONS RAPIDES ADMIN */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="text-blue-400" /> Pilotage
          </h2>
          <div className="space-y-3">
            <Link href="/admin/users" className="block p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Gérer les utilisateurs</span>
                <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white" />
              </div>
            </Link>
            <Link href="/admin/support" className="block p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Tickets en attente</span>
                <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">{openTickets}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}