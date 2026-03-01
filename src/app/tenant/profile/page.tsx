/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { updateProfile, updatePassword } from "@/app/actions/user";
import { 
  User, Lock, Mail, ShieldCheck, 
  Phone, Home, MapPin, Info, CheckCircle2,
  AlertTriangle, UserCircle
} from "lucide-react";
import { formatAdminName } from "@/lib/format";

export default async function TenantProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      locataireProfiles: {
        where: { archived: false },
        include: { bien: true }
      }
    }
  });

  const baux = user?.locataireProfiles || [];
  
  // Logique d'intégrité : on considère que si le nom est déjà bien rempli, 
  // on affiche un avertissement de modification.
  const hasNameSet = !!user?.firstName && !!user?.lastName;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil</h1>
        <p className="text-slate-500 font-medium">Gérez votre identité numérique et vos accès.</p>
      </div>

      {/* --- RÉSUMÉ DES LOCATIONS --- */}
      <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <Home className="absolute right-[-20px] top-[-20px] text-white/10" size={150} />
        <div className="relative z-10 space-y-4">
          <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest">Mes contrats en cours</p>
          {baux.length === 0 ? (
            <p className="text-sm">Aucun bail actif.</p>
          ) : (
            <div className="space-y-3">
              {baux.map((bail) => (
                <div key={bail.id} className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-emerald-400 rounded-full" />
                  <div>
                    <h2 className="text-lg font-bold leading-tight">{bail.bien.nom}</h2>
                    <p className="text-emerald-100 text-xs">{bail.bien.adresse}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SECTION 1 : ÉTAT CIVIL & CONTACT */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <UserCircle size={20} className="text-emerald-600" /> Identité légale
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ces informations doivent correspondre à votre pièce d&apos;identité pour que vos quittances soient valables.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <form action={updateProfile as any} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            
            {/* ALERT DANGER : CHANGEMENT DE NOM */}
            {hasNameSet && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  <b>Attention :</b> Votre nom est déjà configuré. Modifier votre identité peut rendre vos documents précédents incohérents avec vos futurs baux.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Prénom</label>
                <input 
                  name="firstName" 
                  defaultValue={user?.firstName || ""} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nom</label>
                <input 
                  name="lastName" 
                  defaultValue={user?.lastName || ""} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-black uppercase"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* EMAIL MODIFIABLE */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email de connexion</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  name="email" 
                  type="email"
                  defaultValue={user?.email || ""} 
                  className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* TÉLÉPHONE */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  name="telephone" 
                  type="tel"
                  defaultValue={user?.telephone || ""} 
                  className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
                  placeholder="06 00 00 00 00"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={16} /> Enregistrer mon identité
              </button>
            </div>
          </form>
        </div>

        <hr className="md:col-span-3 border-slate-100" />

        {/* SECTION 2 : SÉCURITÉ */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Lock size={20} className="text-red-600" /> Sécurité
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gérez votre mot de passe d&apos;accès.</p>
        </div>

        <div className="md:col-span-2">
          <form action={updatePassword as any} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input name="currentPassword" type="password" required placeholder="Ancien mot de passe" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
              <input name="newPassword" type="password" required placeholder="Nouveau mot de passe" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg">
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}