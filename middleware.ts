import {withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirige ici si l'utilisateur n'est pas connecté
  },
});

// Définissez ici toutes les routes qui nécessitent d'être connecté
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/biens/:path*",
    "/locataires/:path*",
  ],
};