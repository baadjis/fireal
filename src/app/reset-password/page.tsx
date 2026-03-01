'use client'
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { resetPassword } from "@/app/actions/auth"
import { Lock, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  if (!token) return <p className="text-center mt-20">Lien invalide.</p>

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await resetPassword(token, password)
    if (res.success) setSuccess(true)
    else setError(res.error || "")
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-6">
          <CheckCircle className="mx-auto text-green-500" size={60} />
          <h2 className="text-2xl font-bold">Mot de passe modifié !</h2>
          <button onClick={() => router.push("/login")} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Se connecter</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl space-y-6">
        <h2 className="text-2xl font-black">Nouveau mot de passe</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="password" required minLength={8} placeholder="Minimum 8 caractères"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">Valider le changement</button>
        </form>
      </div>
    </div>
  )
}