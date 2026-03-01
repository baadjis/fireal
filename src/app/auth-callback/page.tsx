/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

// Cette page sert de "hub" juste après le login
export default async function AuthCallback() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any).role;

  if (role === "TENANT") {
    redirect("/tenant/dashboard");
  } 
  
  if (role === "ADMIN") {
    redirect("/admin"); // Ou /dashboard selon votre préférence
  }

  redirect("/dashboard"); // Pour OWNER et MANAGER
}