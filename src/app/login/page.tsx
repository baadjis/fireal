'use client'

import { signIn } from "next-auth/react"
import { useState,Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) setError("Email ou mot de passe incorrect.")
    else router.push(callbackUrl)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white p-3">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.1)] border border-white p-6 md:p-8 space-y-4">
        
        {/* LOGO AVEC GRADIENT TEXT */}
        <div className="text-center space-y-1">
          <div className="text-4xl font-black tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">LocAm</span>
            <span className="text-blue-200">.</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Bon retour !</h2>
        </div>

        {error && (
          <div className="bg-red-50/50 backdrop-blur-sm text-red-600 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold border border-red-100/50 animate-in fade-in zoom-in duration-300">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* GOOGLE - BOUTON DESIGN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center justify-center gap-3 w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-2xl hover:shadow-md hover:border-blue-300 transition-all text-sm group"
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} />
          Continuer avec Google
        </button>

        <div className="relative flex items-center opacity-50">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">OU</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
         <Suspense >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="email" required 
                className="w-full p-3.5 pl-10 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm"
                placeholder="Email professionnel"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="password" required 
                  className="w-full p-3.5 pl-10 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm"
                  placeholder="Mot de passe"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end px-1">
                <Link href="/forgot-password" title="Récupérer" className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Se connecter <ArrowRight size={14} />
          </button>
        </form>
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-100 space-y-3">
          <p className="text-[10px] text-slate-400">
            En vous connectant, vous acceptez nos <Link href="/terms" className="text-blue-500 font-bold hover:underline">Conditions</Link>.
          </p>
          <p className="text-sm font-medium text-slate-500">
            Pas de compte ? <Link href="/register" className="text-blue-600 font-black hover:text-indigo-600 transition-colors underline decoration-2 underline-offset-4">S&apos;inscrire gratuitement</Link>
          </p>
        </div>
      </div>
    </div>
  )
}