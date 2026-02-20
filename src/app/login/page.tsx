'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image  from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // On gère la redirection nous-mêmes pour voir les erreurs
    })

    if (res?.error) {
      setError("Identifiants invalides")
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Connexion</h2>
          <p className="text-gray-500 mt-2">Bon retour parmi nous</p>
        </div>

        {error && <p className="bg-red-100 text-red-600 p-3 rounded-lg text-center text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Se connecter
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Ou continuer avec</span></div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition"
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" 
           width={100}
           height={100}
          />
          Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Pas encore de compte ? <Link href="/register" className="text-blue-600 hover:underline">S&apos;inscrire</Link>
        </p>
      </div>
    </div>
  )
}