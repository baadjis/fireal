/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  Building2, Users, FileText, ArrowRight, 
  Sparkles, CheckCircle2, Plus, Zap, Landmark 
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // 1. Récupération des données en parallèle
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [biensCount, locatairesCount, quittancesMois, user] = await Promise.all([
    prisma.bien.count({ where: { proprietaireId: userId } }),
    prisma.locataire.count({ where: { bien: { proprietaireId: userId }, archived: false } }),
    prisma.paiement.count({ 
      where: { locataire: { bien: { proprietaireId: userId } }, mois: currentMonth, annee: currentYear } 
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, stripeConnectedId: true } })
  ]);

  const stats = [
    { name: "Patrimoine", value: `${biensCount} Biens`, icon: <Building2 className="text-blue-600" />, color: "bg-blue-50" },
    { name: "Locataires", value: locatairesCount, icon: <Users className="text-emerald-600" />, color: "bg-emerald-50" },
    { name: "Quittances (Mois)", value: quittancesMois, icon: <FileText className="text-purple-600" />, color: "bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* HEADER & ACTIONS RAPIDES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ravi de vous revoir, {session?.user?.name?.split(' ')[0] || "Propriétaire"} 👋
          </h1>
          <p className="text-gray-500 mt-1">Voici ce qu&apos;il se passe sur votre parc immobilier aujourd&apos;hui.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/locataires/nouveau" className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm">
            <Plus size={18} /> Nouveau Locataire
          </Link>
          <Link href="/biens/nouveau" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md">
            <Building2 size={18} /> Ajouter un bien
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : UPSSELL & ONBOARDING */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* BANNIÈRE PRO (UPSELL) - S'affiche si l'utilisateur est en BASIC */}
          {user?.plan === "BASIC" && (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
              <Sparkles className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 -rotate-12" />
              <div className="relative z-10 space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                  <Zap size={14} className="fill-current" /> Passer au niveau supérieur
                </div>
                <h2 className="text-3xl font-black">Libérez-vous de la gestion manuelle.</h2>
                <p className="text-blue-100 text-lg">
                  Automatisez la collecte des loyers par CB et l&apos;envoi des quittances avec le plan <span className="font-bold text-white underline decoration-yellow-400">PRO</span>.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/compte/billing" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition">
                    Passer en PRO <ArrowRight size={18} />
                  </Link>
                  <p className="text-sm text-blue-100 flex items-center gap-2 italic">
                    <CheckCircle2 size={16} /> 14 jours d&apos;essai gratuit
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ALERTE STRIPE CONNECT - Si PRO mais pas de Stripe lié */}
          {user?.plan !== "BASIC" && !user?.stripeConnectedId && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Landmark size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900">Configurez vos paiements</h3>
                <p className="text-amber-800 text-sm">Vous êtes en mode PRO mais n&apos;avez pas encore lié votre compte bancaire via Stripe Connect. Vos locataires ne peuvent pas encore payer en ligne.</p>
                <Link href="/compte/billing" className="mt-4 inline-block text-sm font-bold bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                  Lier mon compte maintenant
                </Link>
              </div>
            </div>
          )}

          {/* CHECKLIST DE DÉMARRAGE (Si nouveau compte) */}
          {biensCount === 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Vos premiers pas sur LocaManager</h3>
              <div className="space-y-4">
                {[
                  { text: "Ajouter votre premier bien immobilier", done: biensCount > 0, link: "/biens/nouveau" },
                  { text: "Enregistrer un locataire", done: locatairesCount > 0, link: "/locataires/nouveau" },
                  { text: "Configurer votre profil de bailleur", done: !!session?.user?.name, link: "/compte" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${step.done ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                        <CheckCircle2 size={20} />
                      </div>
                      <span className={`font-medium ${step.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{step.text}</span>
                    </div>
                    {!step.done && (
                      <Link href={step.link} className="text-blue-600 text-sm font-bold hover:underline">Continuer</Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : RÉSUMÉ & INFOS */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
               <Zap className="text-yellow-500" size={20} /> Astuce Gestion
            </h3>
            <div className="p-4 bg-yellow-50 rounded-2xl text-sm text-yellow-800 leading-relaxed italic">
              &quot;Le saviez-vous ? Les propriétaires qui automatisent leurs quittances réduisent les retards de paiement de 35% dès le premier trimestre.&quot;
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Votre support</h3>
            <p className="text-sm text-gray-500 mb-4">Une question technique ou juridique ? Nos experts sont là.</p>
            <button className="w-full bg-white border border-gray-200 py-3 rounded-xl font-bold text-sm hover:shadow-sm transition">
              Contacter l&apos;assistance
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}