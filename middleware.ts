import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Lecture du cookie "__session" imposé par Firebase Auth
  const session = request.cookies.get("__session")?.value;

  // Interception des routes à base de patterns stricts
  if (
    request.nextUrl.pathname.startsWith("/student") ||
    request.nextUrl.pathname.startsWith("/instructor") ||
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    // Audit de présence
    if (!session) {
      // Éradication des erreurs d'état du client : Refus au niveau Edge/Server
      // Redirection immédiate HTTP 302 vers le Login avec intention de retour
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Poursuite de la chaîne sans interception si valide ou public
  return NextResponse.next();
}

// Verrouillage périmétrique pour optimiser l'exécution du Middleware
export const config = {
  matcher: [
    "/student/:path*",
    "/instructor/:path*",
    "/admin/:path*",
  ],
};
