import Link from "next/link";
import { 
  ShieldCheck, 
  Zap, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  MailCheck, 
  Lock,
  Smartphone,
  CheckCircle,
  HelpCircle,
  Clock,
  Euro
} from "lucide-react";

import { DashboardMockup } from "@/components/DashboardMockup";

export default function HomePage() {
  
  const faqs = [
    {
      q: "Les quittances sont-elles conformes à la loi ?",
      a: "Absolument. Tous nos documents (avis d'échéance, quittances, baux) sont rédigés par des experts juridiques et mis à jour selon la loi ALUR."
    },
    {
      q: "Comment fonctionne le paiement automatisé ?",
      a: "Grâce à notre intégration Stripe Connect, vos locataires reçoivent un lien de paiement sécurisé. Dès qu'ils paient, la quittance est générée et envoyée sans aucune action de votre part."
    },
    {
      q: "Est-ce sécurisé pour mes données bancaires ?",
      a: "LocAm n'enregistre jamais vos coordonnées bancaires. Nous utilisons Stripe, le leader mondial du paiement, pour garantir une sécurité de niveau bancaire."
    },
    {
      q: "Puis-je gérer une colocation ?",
      a: "Oui, vous pouvez ajouter autant de locataires que vous le souhaitez sur un même bien immobilier. Chaque colocataire recevra ses documents individuellement."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black text-blue-600 tracking-tighter">
            LocAm<span className="text-slate-400">.</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Fonctionnalités</a>
            <a href="#faq" className="hover:text-blue-600 transition">Questions</a>
            <Link href="/register" className="hover:text-blue-600 transition">Tarifs</Link>
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
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
            <Zap size={16} className="fill-current" /> 
            PRO : Automatisez 100% de vos revenus locatifs
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Votre gestion locative <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              en pilote automatique.
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Gérez vos baux, automatisez vos quittances et recevez vos loyers directement par CB. 
            LocAm simplifie la vie des propriétaires indépendants.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
              Démarrer gratuitement <ArrowRight size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <CheckCircle size={16} className="text-emerald-500" /> Sans engagement
            </div>
          </div>

          {/* DYNAMIC DASHBOARD MOCKUP */}
          <div className="mt-20 relative max-w-6xl mx-auto px-4 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative">
              <div aria-label="Aperçu du Dashboard LocAm" className="transform transition-all duration-700 hover:scale-[1.01]">
                <DashboardMockup />
              </div>

              {/* Badge Flottant */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 hidden lg:flex items-center gap-3 animate-bounce shadow-blue-100">
                <div className="p-2 bg-green-100 text-green-600 rounded-full">
                  <Euro size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loyer reçu</p>
                  <p className="text-sm font-black text-slate-900">+ 1 250.00 €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- ENGAGEMENT / PROMISES --- */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-20">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <ShieldCheck className="text-blue-600" /> Modèles Loi ALUR
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Clock className="text-blue-600" /> -4h de paperasse / mois
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Smartphone className="text-blue-600" /> Gestion Mobile-First
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-500">De l&apos;entrée du locataire à la fin du bail.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Quittances Intelligentes",
                desc: "Générez et envoyez vos quittances automatiquement dès que le paiement est confirmé.",
                icon: <MailCheck className="text-blue-600" size={32} />
              },
              {
                title: "Baux & Signature",
                desc: "Créez vos contrats en quelques clics et faites-les signer électroniquement avec valeur juridique.",
                icon: <FileText className="text-emerald-600" size={32} />
              },
              {
                title: "Collecte de Loyers",
                desc: "Proposez le paiement par CB. Vos revenus arrivent directement sur votre compte bancaire.",
                icon: <Zap className="text-purple-600" size={32} />
              }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-sm hover:shadow-xl">
                <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-blue-50 transition-colors">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12 justify-center">
            <HelpCircle size={32} className="text-blue-400" />
            <h2 className="text-3xl font-black">Vos questions</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <h3 className="font-bold text-lg mb-3 flex gap-3 text-blue-300">
                  <span>Q.</span> {faq.q}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-black">Prêt à simplifier votre gestion ?</h2>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Rejoignez les propriétaires qui ont déjà choisi LocAm pour leur sérénité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register" className="px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-2xl hover:bg-blue-50 transition shadow-xl">
                Essayer gratuitement
              </Link>
            </div>
            <p className="text-sm text-blue-200">Aucune carte bancaire requise pour commencer.</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-black text-slate-800">LocAm<span className="text-blue-600">.</span></div>
          <div className="flex gap-8 text-sm font-semibold text-slate-500">
             <Link href="/privacy" className="hover:text-blue-600 transition">Confidentialité</Link>
             <Link href="/terms" className="hover:text-blue-600 transition">CGU</Link>
             <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
          </div>
          <p className="text-sm text-slate-400 font-medium italic">© {new Date().getFullYear()} LocAm. Fait pour les bailleurs.</p>
        </div>
      </footer>
    </div>
  );
}