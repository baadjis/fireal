/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

console.log("DEBUG: Prisma est chargé ?", !!prisma);
if (prisma) {
  console.log("DEBUG: Modèles disponibles :", Object.keys(prisma).filter(k => !k.startsWith("_")));
}

export const authOptions: NextAuthOptions = {
  // 1. On lie NextAuth à notre base de données Supabase via Prisma
  adapter: PrismaAdapter(prisma) as any,

  // 2. Définition des méthodes de connexion
  providers: [
    // Connexion avec Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Connexion avec Email / Mot de passe
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Vérifier si l'utilisateur a rempli les champs
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants manquants");
        }

        // Chercher l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Si l'utilisateur n'existe pas ou n'a pas de mot de passe (ex: inscrit via Google)
        if (!user || !user.password) {
          throw new Error("Utilisateur non trouvé ou connecté via Google");
        }

        // Comparer le mot de passe saisi avec le mot de passe haché en base
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        return user;
      },
    }),
  ],

  // 3. Paramètres de session
  session: {
    // IMPORTANT : Obligatoire pour faire fonctionner "Credentials"
    strategy: "jwt", 
  },

  // 4. Callbacks pour manipuler les données de session
  callbacks: {
    // On ajoute l'ID de l'utilisateur dans le Token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // On expose l'ID de l'utilisateur dans la session côté client (Front-end)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  // 5. Pages personnalisées
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // 6. Sécurité
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };