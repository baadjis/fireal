'use client'
import { useState } from "react"
import { requestPasswordReset } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black">Vérifiez vos emails</h2>
          <p className="text-slate-500">Si un compte existe pour <b>{email}</b>, vous allez recevoir un lien de réinitialisation.</p>
          <Link href="/login" className="block text-blue-600 font-bold hover:underline">Retour à la connexion</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Mot de passe oublié ?</h1>
          <p className="text-slate-500">Pas de panique, ça arrive aux meilleurs.</p>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          await requestPasswordReset(email)
          setSent(true)
        }} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-300" size={18} />
            <input 
              type="email" required placeholder="Votre adresse email"
              className="w-full p-4 pl-10 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
            {loading ? "Envoi..." : "Recevoir le lien"}
          </button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>
      </div>
    </div>
  )
}