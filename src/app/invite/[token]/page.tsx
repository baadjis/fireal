/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  // 1. On attend les paramètres et la session
  const { token } = await params;
  const session = await getServerSession(authOptions);

  // 2. Récupérer la fiche locataire
  const locataireInvite = await prisma.locataire.findUnique({
    where: { invitationToken: token },
    include: { bien: true }
  });

  // CAS : Invitation inexistante ou déjà utilisée
  if (!locataireInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
           <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
           <h1 className="text-xl font-black uppercase">Lien invalide</h1>
           <p className="text-slate-500 text-sm">Cette invitation n&apos;est plus valable.</p>
        </div>
      </div>
    );
  }

  // 3. SI L'UTILISATEUR N'EST PAS CONNECTÉ
  if (!session) {
    const accountExists = await prisma.user.findUnique({ where: { email: locataireInvite.email } });
    const targetPath = accountExists ? "/login" : "/register";
    // On redirige vers login/register. Une fois connecté, NextAuth reviendra ici automatiquement.
    redirect(`${targetPath}?email=${encodeURIComponent(locataireInvite.email)}&callbackUrl=/invite/${token}`);
  }

  const loggedInUser = session.user as any;

  // 4. SÉCURITÉ : Vérifier l'email
  if (loggedInUser.email !== locataireInvite.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-4 border border-red-100">
          <ShieldAlert className="text-red-500 mx-auto" size={48} />
          <h2 className="text-xl font-black text-slate-900">Email incorrect</h2>
          <p className="text-sm text-slate-500">
            Vous êtes connecté avec <b>{loggedInUser.email}</b>, mais cette invitation est pour <b>{locataireInvite.email}</b>.
          </p>
          <p className="text-xs text-slate-400">Veuillez changer de compte.</p>
        </div>
      </div>
    );
  }

  // 5. PROCESSUS DE LIAISON
  let shouldRedirect = false;

  try {
    const rolesPrivilegies = ["ADMIN", "OWNER", "MANAGER"];
    const finalRole = rolesPrivilegies.includes(loggedInUser.role) ? loggedInUser.role : "TENANT";

    await prisma.$transaction([
      prisma.user.update({
        where: { id: loggedInUser.id },
        data: { 
          role: finalRole,
          termsAccepted: true,
          termsAcceptedAt: new Date()
        }
      }),
      prisma.locataire.update({
        where: { id: locataireInvite.id },
        data: { 
          userId: loggedInUser.id,
          invitationToken: null,
          statut: "ACTIF",
          active: true
        }
      })
    ]);
    
    shouldRedirect = true;
  } catch (error) {
    console.error("Erreur liaison invitation:", error);
    return <div className="p-20 text-center">Erreur technique lors de l&apos;activation.</div>;
  }

  // 6. REDIRECTION (Toujours en dehors du bloc try/catch et sans revalidatePath ici)
  if (shouldRedirect) {
    redirect("/tenant/dashboard");
  }
}