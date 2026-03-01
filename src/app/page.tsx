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
  HelpCircle,
  Clock,
  Euro,
  Star
} from "lucide-react";

import { DashboardMockup } from "@/components/DashboardMockup";

export default function HomePage() {
  
  const faqs = [
    {
      q: "Les quittances sont-elles conformes à la loi ?",
      a: "Absolument. Tous nos documents (avis d'échéance, quittances, baux) sont rédigés selon les normes de la loi ALUR et mis à jour régulièrement."
    },
    {
      q: "Comment fonctionne le paiement automatisé ?",
      a: "Via Stripe Connect, vos locataires reçoivent un lien de paiement. Une fois le virement validé, LocAm génère et envoie la quittance sans aucune intervention de votre part."
    },
    {
      q: "Est-ce sécurisé pour mes données ?",
      a: "Nous utilisons un chiffrement de bout en bout et confions la gestion des flux financiers à Stripe, leader mondial certifié PCI-DSS."
    },
    {
      q: "Puis-je gérer une colocation ?",
      a: "Oui. LocAm permet d'ajouter plusieurs locataires par logement. Chaque occupant dispose de son propre suivi et reçoit ses documents personnellement."
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white text-slate-900 scroll-smooth">
      
      {/* --- NAVIGATION GLASSMORPHISM --- */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-3xl font-black tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">LocAm</span>
            <span className="text-blue-400">.</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Support</a>
            <Link href="/register" className="hover:text-blue-600 transition-colors">Tarifs</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-black text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">
              Connexion
            </Link>
            <Link href="/register" className="hidden sm:flex px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-48 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 shadow-xl shadow-blue-500/5 animate-fade-in">
            <Star size={14} className="fill-current" /> 
            Plébiscité par les bailleurs indépendants
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
            Gérez vos loyers <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600">
              sans lever le petit doigt.
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            La plateforme SaaS qui automatise la bureaucratie locative. Générez vos baux, envoyez vos quittances et encaissez vos loyers en pilote automatique.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3">
              Démarrer gratuitement <ArrowRight size={20} />
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CheckCircle2 size={18} className="text-emerald-500" /> Sans engagement
            </div>
          </div>

          {/* DYNAMIC DASHBOARD MOCKUP WITH GLOW */}
          <div className="mt-24 relative max-w-6xl mx-auto px-4 group">
            {/* Lueur d'arrière-plan */}
            <div className="absolute -inset-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-[3rem] blur-3xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            
            <div className="relative">
              <div className="transform transition-all duration-1000 hover:rotate-x-1 hover:scale-[1.02]">
                <DashboardMockup />
              </div>

              {/* Badge Flottant "Revenue" */}
              <div className="absolute -top-10 -right-4 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-white hidden lg:flex items-center gap-4 animate-bounce shadow-blue-500/10">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                  <Euro size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Loyer Encaissé</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">+ 1 450.00 €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- TRUST BAR --- */}
      <section className="py-16 bg-white/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: <ShieldCheck className="text-blue-600" />, text: "Contrats certifiés Loi ALUR" },
            { icon: <Clock className="text-blue-600" />, text: "Gain de temps de 4h/mois" },
            { icon: <Lock className="text-blue-600" />, text: "Données bancaires cryptées" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-4 text-slate-600 font-black text-xs uppercase tracking-widest">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-50">{item.icon}</div>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Pensé pour votre <br /><span className="text-blue-600">sérénité financière.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Quittances Auto",
                desc: "Génération instantanée en PDF et envoi automatique par mail dès réception du loyer.",
                icon: <MailCheck className="text-blue-600" size={32} />,
                gradient: "from-blue-50 to-white"
              },
              {
                title: "Signature Électronique",
                desc: "Faites signer vos baux juridiquement sans papier ni stylo, directement depuis un smartphone.",
                icon: <FileText className="text-indigo-600" size={32} />,
                gradient: "from-indigo-50 to-white"
              },
              {
                title: "Collecte de Loyers",
                desc: "Acceptez les paiements par carte bancaire. Vos fonds arrivent directement sur votre IBAN.",
                icon: <Zap className="text-amber-500" size={32} />,
                gradient: "from-amber-50 to-white"
              }
            ].map((f, i) => (
              <div key={i} className={`group p-12 rounded-[3rem] border border-slate-200 bg-gradient-to-b ${f.gradient} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}>
                <div className="mb-8 p-5 bg-white w-fit rounded-[1.5rem] shadow-xl shadow-slate-200/50 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION DARK --- */}
      <section id="faq" className="py-32 px-6 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#2563eb10_0%,_transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-20 space-y-4">
            <HelpCircle size={48} className="mx-auto text-blue-500 opacity-50 mb-4" />
            <h2 className="text-4xl md:text-5xl font-black">Des réponses à vos questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
                <h3 className="font-black text-sm uppercase tracking-widest mb-4 text-blue-400 flex gap-3">
                  <span>•</span> {faq.q}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3.5rem] p-16 text-center text-white relative overflow-hidden shadow-[0_30px_100px_rgba(37,99,235,0.4)]">
          <Zap className="absolute left-[-20px] bottom-[-20px] text-white/5 w-96 h-96" />
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">Prêt à simplifier votre vie ?</h2>
            <p className="text-blue-100 text-xl max-w-xl mx-auto font-medium">
              Rejoignez les centaines de propriétaires qui ont automatisé leur patrimoine avec LocAm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register" className="px-12 py-6 bg-white text-blue-600 text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl active:scale-95">
                Commencer l&apos;essai gratuit
              </Link>
            </div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest italic opacity-70">Aucune carte bancaire requise</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="text-3xl font-black text-slate-900 tracking-tighter">
              LocAm<span className="text-blue-600">.</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">La gestion locative intelligente pour les bailleurs d&apos;aujourd&apos;hui.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Link href="/privacy" className="hover:text-blue-600 transition-colors">Confidentialité</Link>
             <Link href="/terms" className="hover:text-blue-600 transition-colors">Conditions</Link>
             <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">© {new Date().getFullYear()} LocAm — All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}