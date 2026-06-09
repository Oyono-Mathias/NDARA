import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as admin from "firebase-admin";

// Initialisation sécurisée du SDK Firebase Admin
// L'instance n'est créée que si elle n'existe pas déjà (évite les fuites de mémoire en mode dev)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Fix pour les retours à la ligne dans la clé privée via les variables d'environnement
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Jeton d'authentification manquant" }, { status: 401 });
    }

    // Durée de vie du cookie fixée à 5 jours, comme requis pour des raisons de confort et sécurité
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Émission du jeton de session officiel Firebase
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Injection immédiate et sécurisée dans les en-têtes HTTP
    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[Auth API] Erreur critique lors de la génération de la session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("__session");
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[Auth API] Erreur critique lors de la destruction de la session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
