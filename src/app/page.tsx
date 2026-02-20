import Link from "next/link";
import { 
  ShieldCheck, 
  Zap, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  MailCheck, 
  Lock,
  Smartphone
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black text-blue-600 tracking-tighter">
            LocAm<span className="text-slate-400">.</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Tarifs</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition">
              Connexion
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide animate-fade-in">
            <Zap size={16} className="fill-current" /> 
            NOUVEAU : Signature électronique incluse
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Gérez vos loyers <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              en pilote automatique.
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            La plateforme tout-en-un pour les propriétaires bailleurs. 
            Générez vos baux, automatisez vos quittances et recevez vos paiements sans lever le petit doigt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
              Démarrer gratuitement <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-slate-400 font-medium italic">
              Sans carte bancaire • Configuration en 2 minutes
            </p>
          </div>

          {/* Preview Image / Dashboard Mockup (Simulé par CSS) */}
          <div className="mt-20 relative max-w-6xl mx-auto">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10" />
             <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 transform perspective-1000 rotate-x-2">
                <div className="bg-slate-50 rounded-2xl h-[400px] w-full flex items-center justify-center border border-slate-100 border-dashed">
                   <div className="text-slate-300 flex flex-col items-center gap-2">
                      <Smartphone size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">Aperçu du Dashboard</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black">Tout pour simplifier votre vie de bailleur</h2>
            <p className="text-slate-500">Oubliez les fichiers Excel et les relances manuelles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Quittances Automatisées",
                desc: "Dès que le loyer est payé, la quittance est générée en PDF et envoyée par email au locataire.",
                icon: <MailCheck className="text-blue-600" size={32} />
              },
              {
                title: "Baux & Contrats Pro",
                desc: "Utilisez nos templates juridiques mis à jour selon la loi ALUR pour créer vos contrats en 1 clic.",
                icon: <FileText className="text-emerald-600" size={32} />
              },
              {
                title: "Paiement en ligne CB",
                desc: "Proposez le paiement par carte bancaire à vos locataires pour réduire les impayés de 40%.",
                icon: <Zap className="text-purple-600" size={32} />
              },
              {
                title: "Suivi des Charges",
                desc: "Visualisez la rentabilité de vos biens et gérez les provisions sur charges facilement.",
                icon: <ShieldCheck className="text-orange-600" size={32} />
              },
              {
                title: "Stockage Sécurisé",
                desc: "Tous vos documents (EDL, diagnostics, baux) archivés et accessibles 24h/24 en toute sécurité.",
                icon: <Lock className="text-red-600" size={32} />
              },
              {
                title: "Multi-biens & Coloc",
                desc: "Que vous ayez un studio ou un immeuble complet, gérez tout depuis une interface unique.",
                icon: <Smartphone className="text-cyan-600" size={32} />
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all">
                <div className="mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-black">Prêt à gagner 5h par mois ?</h2>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Rejoignez les propriétaires qui nous font confiance pour leur gestion immobilière.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register" className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-2xl hover:bg-blue-50 transition">
                Créer mon compte gratuit
              </Link>
            </div>
            <div className="flex justify-center gap-6 text-sm text-blue-200 pt-4">
              <span className="flex items-center gap-2"><CheckCircle2 size={16}/> Sans engagement</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16}/> Support 7j/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-black text-slate-400">LocaManager<span className="text-blue-600">.</span></div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
             <Link href="/privacy" className="hover:text-blue-600">Confidentialité</Link>
             <Link href="/terms" className="hover:text-blue-600">Conditions</Link>
             <Link href="/contact" className="hover:text-blue-600">Contact</Link>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} LocaManager. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}