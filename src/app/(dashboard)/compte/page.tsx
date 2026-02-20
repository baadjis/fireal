/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { updateProfile, updatePassword } from "@/app/actions/user"
import { User, Lock, Mail, ShieldCheck, CreditCard, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function ComptePage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Mon Compte</h1>
        <p className="text-gray-500">Gérez vos informations, votre plan et la sécurité de votre accès.</p>
      </div>

      {/* --- NOUVELLE SECTION : RÉSUMÉ DU PLAN & FACTURATION --- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <CreditCard size={20} className="text-blue-600" />
            Abonnement & Paiements
          </div>
          <Link 
            href="/compte/billing" 
            className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
          >
            Gérer la facturation <ChevronRight size={14} />
          </Link>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* État du Plan */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Plan Actuel</p>
              <p className="text-lg font-bold text-gray-900">{user?.plan || "BASIC"}</p>
            </div>
          </div>

          {/* État Stripe Connect */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className={`p-3 rounded-lg ${user?.stripeConnectedId ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {user?.stripeConnectedId ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Réception Loyers</p>
              <p className="text-sm font-bold text-gray-900">
                {user?.stripeConnectedId ? "Compte bancaire lié" : "Non configuré"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SECTION PROFIL */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <User size={20} className="text-blue-600" /> Profil public
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ces informations apparaissent sur vos quittances et contrats de bail.
          </p>
        </div>

        <div className="md:col-span-2">
          <form action={updateProfile as any} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet ou Raison Sociale</label>
              <input 
                name="name" 
                defaultValue={user?.name || ""} 
                className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="Ex: Jean Dupont ou SCI Horizon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  name="email" 
                  type="email"
                  defaultValue={user?.email || ""} 
                  className="w-full p-3 pl-10 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telephone</label>
              <input 
                name="telephone" 
                type="tel"
                defaultValue={user?.telephone|| ""} 
                className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="06 37 00 00 00"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input 
                name="adresse" 
                defaultValue={user?.adresse || ""} 
                className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="Ex: 12 ,rue de la paix  Villejuif 94700"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
                Enregistrer le profil
              </button>
            </div>
          </form>
        </div>

        <hr className="md:col-span-3 border-gray-100" />

        {/* SECTION SÉCURITÉ */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Lock size={20} className="text-red-600" /> Sécurité
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mise à jour régulière conseillée pour protéger vos données bancaires.
          </p>
        </div>

        <div className="md:col-span-2">
          <form action={updatePassword as any} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
              <input 
                name="currentPassword" 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input 
                name="newPassword" 
                type="password" 
                required
                placeholder="Min. 8 caractères"
                className="w-full p-3 border rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-gray-800 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition shadow-md">
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>

        {/* FOOTER INFO */}
        <div className="md:col-span-3 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <p className="text-sm text-blue-800">
            Votre compte est sécurisé. Créé le <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "--"}</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}