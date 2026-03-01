/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          role: "OWNER", // Par défaut, mais sera écrasé par l'événement createUser si c'est un locataire
        };
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants manquants");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error("Utilisateur non trouvé");
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }
        return user;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  // --- ÉVÉNEMENTS : LOGIQUE DE LIAISON LOCATAIRE ---
  events: {
    async createUser({ user }) {
      // 1. On cherche s'il existe une fiche locataire créée par un proprio pour cet email
      const locataireFiche = await prisma.locataire.findUnique({
        where: { email: user.email! },
        include: { 
          bien: { 
            include: { proprietaire: true } 
          } 
        }
      });

      if (locataireFiche) {
        const planProprio = locataireFiche.bien.proprietaire.plan;

        // 2. VÉRIFICATION DU PLAN : L'espace locataire est réservé aux plans PRO et EXPERT
        if (planProprio === "PRO" || planProprio === "EXPERT") {
          await prisma.$transaction([
            // On change le rôle de l'utilisateur qui vient de s'inscrire
            prisma.user.update({
              where: { id: user.id },
              data: { role: "TENANT" }
            }),
            // On lie la fiche locataire à ce nouvel utilisateur
            prisma.locataire.update({
              where: { id: locataireFiche.id },
              data: { userId: user.id }
            })
          ]);
          console.log(`✅ Liaison Locataire réussie (Plan ${planProprio}) : ${user.email}`);
        } else {
          console.log(`⚠️ Liaison avortée : Le propriétaire est en plan ${planProprio} (BASIC requis pour espace locataire)`);
        }
      }
    }
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };