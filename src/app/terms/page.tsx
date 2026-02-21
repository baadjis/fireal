import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour à l&apos;accueil
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-blue-600" size={32} />
          <h1 className="text-3xl font-black">Conditions Générales d&apos;Utilisation</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Présentation du service</h2>
            <p>
              LocAm est une plateforme de gestion locative destinée aux propriétaires bailleurs indépendants. 
              Le service permet la gestion des biens, des locataires, et l&apos;automatisation des documents (quittances, baux).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Responsabilité de l&apos;utilisateur</h2>
            <p>
              L&apos;utilisateur (le bailleur) est seul responsable de l&apos;exactitude des informations saisies dans la plateforme. 
              LocAm fournit des modèles basés sur la législation en vigueur (Loi ALUR), mais ne saurait être tenu responsable d&apos;un litige 
              provenant d&apos;une erreur de saisie ou d&apos;une mauvaise utilisation des documents générés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Abonnements et Paiements</h2>
            <p>
              Le plan &quot;Basic&quot; est gratuit. Les plans &quot;Pro&quot; et &quot;Expert&quot; sont facturés mensuellement. 
              Pour les paiements automatisés, LocAm utilise le service <strong>Stripe Connect</strong>. 
              En activant cette option, vous acceptez les conditions d&apos;utilisation de Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Limitation de responsabilité</h2>
            <p>
              LocAm est un outil technique. Nous ne sommes ni une agence immobilière, ni un cabinet d&apos;avocats. 
              En cas de loyer impayé par un locataire, la responsabilité de LocAm ne pourra être engagée.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}