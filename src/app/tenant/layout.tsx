/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Building2, 
  ShieldCheck, 
  Briefcase,
  Bell
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";
import prisma from "@/lib/prisma";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // 1. SÉCURITÉ : Vérifier la session
  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // 2. RÉCUPÉRATION DES DONNÉES (Profil + Notifications)
  // On récupère l'utilisateur pour vérifier s'il a accès à l'espace bailleur
  const [user, notifications, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, termsAccepted: true }
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.notification.count({
      where: { userId, isRead: false }
    })
  ]);

  // 3. CONSENT GUARD : Même les locataires doivent accepter les termes
  if (!user?.termsAccepted) {
    redirect("/accept-terms");
  }

  const menuItems = [
    { name: "Mon Tableau de bord", icon: <LayoutDashboard size={20} />, href: "/tenant/dashboard" },
    { name: "Mes Documents", icon: <FileText size={20} />, href: "/tenant/documents" },
    { name: "Mon Profil", icon: <User size={20} />, href: "/tenant/profile" },
  ];

  // Déterminer si on affiche le switch vers l'espace Bailleur
  const canManage = userRole === "OWNER" || userRole === "MANAGER" || userRole === "ADMIN";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* --- SIDEBAR LOCATAIRE (Thème Vert/Emeraude pour différencier du bleu proprio) --- */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20">
        <div className="p-8 border-b border-slate-50">
          <Link href="/tenant/dashboard" className="text-xl font-black text-emerald-600 tracking-tighter">
            LocAm <span className="text-slate-300 font-medium">Locataire</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Mon Contrat</p>
          
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all font-bold text-sm group"
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.name}
            </Link>
          ))}

          {/* SECTION : SWITCH VERS GESTION (Si autorisé) */}
          {canManage && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ma Gestion</p>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100 shadow-sm shadow-blue-50"
              >
                <Briefcase size={18} />
                <span>Espace Bailleur</span>
              </Link>
            </div>
          )}
        </nav>

        {/* PIED DE SIDEBAR */}
        <div className="p-4 border-t border-slate-50 space-y-4">
          <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Espace Locataire</p>
            </div>
            <p className="text-xs font-bold text-slate-700 truncate">{session.user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOPBAR LOCATAIRE */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Mon Dossier Location</h2>
          </div>

          {/* Notifications pour le locataire (ex: Quittance disponible) */}
          <NotificationBell 
            notifications={notifications} 
            unreadCount={unreadCount} 
          />
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}