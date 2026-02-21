import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour à l&apos;accueil
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-blue-600" size={32} />
          <h1 className="text-3xl font-black">Politique de Confidentialité</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Collecte des données</h2>
            <p>
              Nous collectons les données nécessaires au bon fonctionnement de la gestion locative : 
              noms, prénoms, adresses emails, adresses postales et montants des loyers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Statut de LocAm au sens du RGPD</h2>
            <p>
              Dans le cadre de la gestion locative, le <strong>Bailleur</strong> est le responsable du traitement 
              des données de ses locataires. <strong>LocAm</strong> agit en tant que sous-traitant technique. 
              Nous nous engageons à ne jamais revendre ni exploiter les données de vos locataires à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Services Tiers</h2>
            <p>
              Vos données sont stockées de manière sécurisée sur les serveurs de Supabase (France/Europe). 
              Pour les emails, nous utilisons Resend. Pour les paiements, nous utilisons Stripe. 
              Chacun de ces prestataires respecte les standards de sécurité les plus élevés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression 
              de vos données personnelles. Vous pouvez exercer ce droit directement depuis votre compte LocAm.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}