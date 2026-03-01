/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  ArrowLeft, 
  ShieldAlert, 
  UserCheck,
  Briefcase,
  ExternalLink,
  Key,
  ArrowLeftRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import prisma from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // 1. SÉCURITÉ : Strictement réservé aux ADMIN
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userId = (session.user as any).id;

  // 2. RÉCUPÉRATION DES DONNÉES (Inclusion des profils locataires pour le switch)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      locataireProfiles: {
        where: { archived: false }
      }
    }
  });

  // CONSENT GUARD
  if (!user?.termsAccepted) {
    redirect("/accept-terms");
  }

  const adminMenuItems = [
    { name: "Vue d'ensemble", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "Gérer utilisateurs", icon: <Users size={20} />, href: "/admin/users" },
    { name: "Tous les locataires", icon: <UserCheck size={20} />, href: "/admin/locataires" },
    { name: "Gérer tickets", icon: <MessageSquare size={20} />, href: "/admin/support" },
  ];

  // Logique du switch d'espace (Vérification de l'array locataireProfiles)
  const hasTenantSpace = !!(user?.locataireProfiles && user.locataireProfiles.length > 0);

  // Logique des initiales pour l'avatar
  const name = session.user?.name || "Admin";
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* --- SIDEBAR NOIRE (ADMIN) --- */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shadow-2xl z-30">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <Link href="/admin" className="text-2xl font-black tracking-tighter">
              LocAm <span className="text-blue-500">Admin</span>
            </Link>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
            Super Administration
          </p>
          
          {adminMenuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all font-bold text-sm group"
            >
              <span className="group-hover:text-blue-400 group-hover:scale-110 transition-all">
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
          
          {/* SECTION : NAVIGATION TRANSVERSALE (SWITCH D'ESPACE) */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
              Switch d&apos;Espace
            </p>
            
            {/* Vers Espace Bailleur */}
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-4 py-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all font-bold text-xs border border-blue-600/20 group"
            >
              <div className="flex items-center gap-3">
                <Briefcase size={18} />
                <span>Espace Bailleur</span>
              </div>
              <ArrowLeftRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Vers Espace Locataire (si rattaché) */}
            {hasTenantSpace && (
              <Link
                href="/tenant/dashboard"
                className="flex items-center justify-between px-4 py-3 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all font-bold text-xs border border-emerald-600/20 group"
              >
                <div className="flex items-center gap-3">
                  <Key size={18} />
                  <span>Mon Espace Locataire</span>
                </div>
                <ArrowLeftRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>
        </nav>

        {/* COMPTE ADMIN (STYLE DARK) */}
        <div className="p-6 bg-slate-900/80 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg border border-blue-500/50">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black truncate uppercase tracking-tighter">Administrateur</p>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <p className="text-[10px] text-slate-500 truncate font-medium">{session.user?.email}</p>
            </div>
          </div>
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* --- ZONE DE CONTENU --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR ADMIN */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              Terminal Admin
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}