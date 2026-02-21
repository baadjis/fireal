import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Configuration des polices pour un look SaaS moderne
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Métadonnées optimisées pour le SEO
export const metadata: Metadata = {
  title: {
    default: "LocAm | Gestion Locative & Automatisation",
    template: "%s | LocAm"
  },
  description: "La plateforme intelligente pour les propriétaires bailleurs. Automatisez vos quittances, générez vos baux ALUR et encaissez vos loyers par carte bancaire.",
  keywords: ["gestion locative", "quittance de loyer", "bailleur", "immobilier", "automatisation loyer", "bail location"],
  authors: [{ name: "LocAm Team" }],
  creator: "LocAm",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://locam.vercel.app", // À remplacer par votre domaine final
    siteName: "LocAm",
    title: "LocAm | Simplifiez votre gestion immobilière",
    description: "Gérez vos biens et locataires en pilote automatique.",
    images: [
      {
        url: "/og-image.png", // Image qui s'affichera sur les réseaux sociaux
        width: 1200,
        height: 630,
        alt: "LocAm Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LocAm | Gestion Locative",
    description: "Automatisez vos quittances et baux en un clic.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb", // Couleur bleue LocAm pour mobile
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}