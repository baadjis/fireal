'use client'

import { registerUser } from "@/app/actions/register" // L'action qu'on a créé avant
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import Image from 'next/image'


export default function RegisterPage() {
  const [error, setError] = useState("")

  const handleFormAction = async (formData: FormData) => {
    const result = await registerUser(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Créer un compte</h2>
          <p className="text-gray-500 mt-2">Commencez à gérer vos biens gratuitement</p>
        </div>

        {error && <p className="bg-red-100 text-red-600 p-3 rounded-lg text-center text-sm">{error}</p>}

        <form action={handleFormAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom complet</label>
            <input name="name" type="text" required className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" required className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" placeholder="jean@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input name="password" type="password" required className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Créer mon compte
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Ou s&apos;inscrire avec</span></div>
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
          Déjà un compte ? <Link href="/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}