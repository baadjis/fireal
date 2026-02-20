import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Home, Building2, Users, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton"; // On va le créer juste après

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const menuItems = [
    { name: "Accueil", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { name: "Mes Biens", icon: <Building2 size={20} />, href: "/biens" },
    { name: "Mes Locataires", icon: <Users size={20} />, href: "/locataires" },
    { name: "Mon Compte", icon: <User />, href: "/compte" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar fixe */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            LocAm
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 px-4">
            <p className="text-xs text-gray-400 uppercase font-bold">Compte</p>
            <p className="text-sm font-medium text-gray-700 truncate">{session.user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Zone de contenu variable */}
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  );
}