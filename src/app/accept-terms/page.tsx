'use client'

import { useState } from "react"
import { ShieldCheck, ArrowRight } from "lucide-react"
import { acceptTermsAction } from "@/app/actions/user"
import Link from "next/link"

export default function AcceptTermsPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Dernière étape !</h1>
          <p className="text-slate-500">
            Pour commencer à gérer vos biens sur LocAm, vous devez accepter nos conditions de service.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl space-y-4 text-sm text-slate-600 border border-slate-100">
          <p>En cliquant sur le bouton ci-dessous, vous confirmez que :</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">✅ Vous acceptez nos <Link href="/terms" className="text-blue-600 underline">CGU</Link>.</li>
            <li className="flex items-start gap-2">✅ Vous acceptez notre <Link href="/privacy" className="text-blue-600 underline">Politique de confidentialité</Link>.</li>
            <li className="flex items-start gap-2">✅ Vous nous autorisez à traiter les données de vos locataires pour générer vos documents.</li>
          </ul>
        </div>

        <form action={async () => {
          setLoading(true)
          await acceptTermsAction()
        }}>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            {loading ? "Chargement..." : "J'accepte et je commence"} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}