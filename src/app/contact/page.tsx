'use client'

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendContactEmail } from "@/app/actions/contact";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const MAX_WORDS = 200;

  // Calcul du nombre de mots
  const wordCount = message.trim() === "" ? 0 : message.trim().split(/\s+/).length;
  const isTooLong = wordCount > MAX_WORDS;
  const isDisabled = message.trim() === "" || isTooLong || loading;

  const handleAction = async (formData: FormData) => {
    setLoading(true);
    const res = await sendContactEmail(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* NAVIGATION */}
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          LocAm<span className="text-slate-400">.</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* TEXTE GAUCHE */}
        <div className="space-y-8">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Une question ? <br />
              <span className="text-blue-600">On vous répond.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto lg:mx-0">
              Notre support technique et juridique est disponible pour vous accompagner dans votre gestion.
            </p>
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Mail size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Email direct</p>
                <p className="font-bold text-sm">contact@getlocam.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
               <ShieldCheck size={24} />
               <p className="text-xs font-bold uppercase tracking-widest">Temps de réponse : &lt; 24h</p>
            </div>
          </div>
        </div>

        {/* FORMULAIRE DROITE */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-100">
          {success ? (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Message reçu !</h2>
              <p className="text-slate-500 mt-2">Nous lisons votre demande et revenons vers vous.</p>
              <button onClick={() => { setSuccess(false); setMessage(""); }} className="mt-8 text-blue-600 font-bold hover:underline">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form action={handleAction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input name="name" type="text" required placeholder="Nom complet" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <input name="email" type="email" required placeholder="Votre Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <select name="subject" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
                <option>Question sur le plan PRO</option>
                <option>Assistance technique</option>
                <option>Suggestion d&apos;amélioration</option>
                <option>Autre</option>
              </select>

              <div className="relative">
                <textarea 
                  name="message"
                  required 
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez-nous votre besoin..."
                  className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 transition-all text-sm resize-none ${
                    isTooLong ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-blue-500"
                  }`}
                />
                
                {/* COMPTEUR DE MOTS */}
                <div className={`absolute bottom-3 right-4 text-[10px] font-black uppercase tracking-widest ${
                  isTooLong ? "text-red-500" : "text-slate-300"
                }`}>
                  {wordCount} / {MAX_WORDS} mots
                </div>
              </div>

              {isTooLong && (
                <p className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 ml-1">
                  <AlertCircle size={12} /> Votre message est trop long
                </p>
              )}

              <button 
                type="submit" 
                disabled={isDisabled}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  isDisabled 
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" 
                    : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                }`}
              >
                {loading ? "Envoi..." : "Envoyer mon message"} <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}