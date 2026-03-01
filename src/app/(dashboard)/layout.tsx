/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  Building2, Users, LayoutDashboard, User, 
  ShieldCheck, MessageSquare, Briefcase, Key,
  ChevronRight, ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. VÉRIFICATION SESSION
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // 2. RÉCUPÉRATION DES DONNÉES (Profil + Consentement + Profils Locataires)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      locataireProfiles: {
        where: { archived: false }
      }
    }
  });

  // 3. LOGIQUE ANTI-BOUCLE POUR ACCEPT-TERMS
  const headerList = await headers();
  const pathname = headerList.get('x-invoke-path') || ""; 

  if (!user?.termsAccepted && !pathname.includes('/accept-terms')) {
    redirect("/accept-terms");
  }

  // 4. RÉCUPÉRATION DES NOTIFICATIONS
  const [notifications, unreadCount, signatureCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.count({ where: { userId, type: "SIGNATURE", isRead: false } })
  ]);

  // 5. MENU DYNAMIQUE (Bailleur)
  const menuItems = [
    { name: "Accueil", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { name: "Mes Biens", icon: <Building2 size={20} />, href: "/biens" },
    { 
      name: "Mes Locataires", 
      icon: <Users size={20} />, 
      href: "/locataires",
      badge: signatureCount > 0 
    },
    { name: "Mon Compte", icon: <User size={20} />, href: "/compte" },
  ];

  // Détection si l'utilisateur a un espace locataire actif
  const hasTenantSpace = !!(user?.locataireProfiles && user.locataireProfiles.length > 0);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-black text-blue-600 tracking-tighter">
            LocAm<span className="text-slate-300">.</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Gestion Bailleur</p>
          
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm group ${
                pathname === item.href ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <span className={`${pathname === item.href ? "" : "group-hover:scale-110"} transition-transform`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {item.badge && (
                <span className="absolute right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Link>
          ))}

          {/* --- SECTION SWITCH D'ESPACE --- */}
          {(hasTenantSpace || userRole === "ADMIN") && (
            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Changer d&apos;espace</p>
              
              {hasTenantSpace && (
                <Link 
                  href="/tenant/dashboard" 
                  className="flex items-center justify-between px-4 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100 group shadow-sm shadow-emerald-100/50"
                >
                  <div className="flex items-center gap-3">
                    <Key size={18} />
                    <span>Espace Locataire</span>
                  </div>
                  <ArrowLeftRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}

              {userRole === "ADMIN" && (
                <Link 
                  href="/admin" 
                  className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg shadow-slate-200 group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-red-400" />
                    <span>Console Admin</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-slate-50 space-y-4 bg-white">
          <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    {userRole === "ADMIN" ? "Super Admin" : userRole === "MANAGER" ? "Gestionnaire" : "Bailleur"}
                </p>
            </div>
            <p className="text-xs font-bold text-slate-700 truncate">{session.user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* --- CONTENU --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <Briefcase size={18} className="text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Gestion Immobilière</h2>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}