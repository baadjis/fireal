import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as string;

    // 1. PROTECTION ADMIN : Seuls les admins accèdent à /admin
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. PROTECTION LOCATAIRE (TENANT) : Seuls les locataires accèdent à /tenant
    // S'ils essaient d'aller dans le dashboard proprio, on les renvoie chez eux
    if (role === "TENANT") {
      if (!pathname.startsWith("/tenant") && !pathname.includes("/accept-terms") && !pathname.includes("/api")) {
        return NextResponse.redirect(new URL("/tenant/dashboard", req.url));
      }
    }

    // 3. PROTECTION PROPRIÉTAIRE/GESTIONNAIRE : Ils ne vont pas dans /tenant
    if ((role === "OWNER" || role === "MANAGER") && pathname.startsWith("/tenant")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Note : La redirection vers /accept-terms est gérée dans le DashboardLayout 
    // ou le TenantLayout pour plus de précision.
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // L'utilisateur doit être connecté
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/biens/:path*", 
    "/locataires/:path*", 
    "/compte/:path*", 
    "/accept-terms", 
    "/admin/:path*",
    "/tenant/:path*" // On ajoute les routes locataires
  ],
};