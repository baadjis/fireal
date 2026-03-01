'use client'

import { registerUser } from "@/app/actions/register"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import Image from 'next/image'
import { Sparkles, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react"

export default function RegisterPage() {
  const [error, setError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleFormAction = async (formData: FormData) => {
    const result = await registerUser(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white p-2">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.1)] border border-white space-y-4">
        
        <div className="text-center space-y-1">
          <div className="text-3xl font-black tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">LocAm</span>
            <span className="text-indigo-200">.</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Créez votre compte</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold border border-red-100">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center justify-center gap-3 w-full bg-white border border-slate-200 py-3 rounded-2xl font-bold hover:shadow-md hover:border-indigo-300 transition-all text-sm group"
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} />
          S&apos;inscrire avec Google
        </button>

        <div className="relative flex items-center opacity-40">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="flex-shrink mx-3 text-[9px] font-black text-slate-400">OU</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        <form action={handleFormAction} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" type="text" required className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Prénom" />
            <input name="lastName" type="text" required className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Nom" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input name="email" type="email" required className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Email" />
            <input name="telephone" type="tel" required className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Téléphone" />
          </div>

          <input name="adresse" type="text" required className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Adresse complète du bailleur" />
          
          <div className="grid grid-cols-3 gap-2">
            <input name="ville" type="text" required className="col-span-2 p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Ville" />
            <input name="codePostal" type="text" required className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="CP" />
          </div>

          <input name="password" type="password" required className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-xs transition-all" placeholder="Mot de passe" />

          <div className="flex items-start gap-2 py-1">
            <input 
              type="checkbox" id="terms" checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-[10px] text-slate-500 leading-tight">
              J&apos;accepte les <Link href="/terms" className="text-blue-600 font-bold underline">Conditions</Link> et la <Link href="/privacy" className="text-blue-600 font-bold underline">Confidentialité</Link>.
            </label>
          </div>

          <button 
            type="submit" disabled={!acceptedTerms}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              acceptedTerms ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98]" : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            S&apos;inscrire <ArrowRight className="inline ml-1" size={14} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            Déjà inscrit ? <Link href="/login" className="text-blue-600 font-black hover:text-indigo-600 underline decoration-2 underline-offset-4 transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}