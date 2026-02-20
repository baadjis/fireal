/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { ButtonAction } from "@/components/ButtonAction";
import { 
  Mail, MapPin, Calendar, UserCheck, UserX, FileText, 
  ArrowLeft, Edit3, CheckCircle, AlertTriangle, Info, Send, 
  PhoneIcon
} from "lucide-react";
import Link from "next/link";
import { activerManuellement, demarrerSignatureElectronique } from "@/app/actions/tenant";
import { DangerZoneActions } from "@/components/DangerZoneAction";

export default async function LocataireDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  // Récupération complète : locataire + bien + propriétaire (pour le plan) + paiements
  const locataire = await prisma.locataire.findFirst({
    where: { id, bien: { proprietaireId: userId } },
    include: { 
      bien: { include: { proprietaire: true } }, 
      paiements: { orderBy: { datePaiement: 'desc' } } 
    }
  });

  if (!locataire) notFound();

  const proprietaire = locataire.bien.proprietaire;
  const isPlanAuto = proprietaire.plan === "PRO" || proprietaire.plan === "EXPERT";

  // Préparation des actions
  const activerAction = activerManuellement.bind(null, id);
  const signatureAction = demarrerSignatureElectronique.bind(null, id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* 1. BARRE DE NAVIGATION */}
      <div className="flex justify-between items-center">
        <Link href="/locataires" className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition">
          <ArrowLeft size={16} className="mr-2" /> Retour à la liste
        </Link>
        <Link href={`/locataires/${locataire.id}/edit`} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          <Edit3 size={16} /> Modifier le dossier
        </Link>
      </div>

      {/* 2. EN-TÊTE RÉCAPITULATIF */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-2xl ${locataire.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {locataire.active ? <UserCheck size={32} /> : <UserX size={32} />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{locataire.prenom} {locataire.nom}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
              <span className="flex items-center gap-1"><Mail size={14}/> {locataire.email}</span>
               <span className="flex items-center gap-1"><PhoneIcon size={14}/> {locataire.telephone}</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> {locataire.bien.nom}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 uppercase font-bold tracking-wider">Statut Contrat</p>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
            locataire.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {locataire.statut}
          </span>
        </div>
      </div>

      {/* 3. ZONE DE WORKFLOW (Brouillon / Signature) */}
      {locataire.statut === "BROUILLON" && (
        <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-md">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <FileText /> Finaliser le contrat
            </h2>
            <p className="text-blue-100 text-sm">
              Le bail est prêt. Choisissez le mode de signature pour activer la gestion automatisée.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/api/contrat/${locataire.id}`} target="_blank" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition">
              Télécharger (PDF)
            </Link>
            <form action={signatureAction}>
              <button type="submit" className="bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 transition">
                Signature électronique
              </button>
            </form>
            <form action={activerAction}>
              <button type="submit" className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition shadow-md">
                Activer (Signé papier)
              </button>
            </form>
          </div>
        </div>
      )}

      {locataire.statut === "ATTENTE_SIGNATURE" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-amber-800">
            <Send className="animate-pulse" />
            <div>
              <p className="font-bold">Contrat envoyé pour signature électronique</p>
              <p className="text-sm">En attente de l&apos;action du locataire sur son email.</p>
            </div>
          </div>
          <form action={activerAction}>
            <button type="submit" className="text-sm font-bold text-amber-900 underline hover:text-amber-700">
              Forcer l&apos;activation (Signature papier reçue)
            </button>
          </form>
        </div>
      )}

      {/* 4. GRILLE D'INFORMATIONS FINANCIÈRES ET HISTORIQUE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Infos Bail */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-3 text-gray-700">Conditions financières</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Loyer HC</span>
              <span className="font-semibold">{locataire.loyerHC.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Charges</span>
              <span className="font-semibold">{locataire.charges.toFixed(2)} €</span>
            </div>
            <div className="pt-3 border-t flex justify-between font-bold text-lg text-blue-600">
              <span>Total</span>
              <span>{(locataire.loyerHC + locataire.charges).toFixed(2)} €</span>
            </div>
          </div>

          {/* Widget d'explication du Plan */}
          <div className={`p-4 rounded-2xl border ${isPlanAuto ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex items-start gap-3">
              <Info className={isPlanAuto ? 'text-green-600' : 'text-blue-600'} size={20} />
              <div className="text-xs">
                <p className={`font-bold uppercase ${isPlanAuto ? 'text-green-800' : 'text-blue-800'}`}>
                  Gestion {proprietaire.plan}
                </p>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  {isPlanAuto 
                    ? "Les quittances sont générées automatiquement dès réception du paiement Stripe." 
                    : "Vous devez confirmer manuellement la réception du virement pour envoyer la quittance."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des Loyers */}
        <div className="md:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Calendar size={18} /> Historique des loyers
            </h3>
            {locataire.active && <ButtonAction locataireId={locataire.id} />}
          </div>
          
          <div className="divide-y flex-1 overflow-y-auto max-h-[400px]">
            {locataire.paiements.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">
                Aucun paiement enregistré pour le moment.
              </div>
            ) : (
              locataire.paiements.map((p: any) => (
                <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-500" />
                    <div>
                      <span className="font-bold text-sm">Loyer {p.mois}/{p.annee}</span>
                      <p className="text-[10px] text-gray-400">Reçu le {new Date(p.datePaiement).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Payé</span>
                    <Link 
                      href={`/api/quittance/${locataire.id}?mois=${p.mois}&annee=${p.annee}`} 
                      target="_blank"
                      className="text-blue-600 text-xs font-bold hover:underline"
                    >
                      Voir PDF
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    
      {/* 5. ZONE DE DANGER */}
      <div className="mt-12 border-t pt-10">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
            <AlertTriangle size={18} /> 
            <h3>Zone de danger</h3>
          </div>
          <p className="text-red-700 text-sm mb-6">
            Ces actions suppriment définitivement le dossier ou l&apos;archivent pour arrêter la facturation.
          </p>
          <DangerZoneActions id={locataire.id} />
        </div>
      </div>
    </div>
  );
}