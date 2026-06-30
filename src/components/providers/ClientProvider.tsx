"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// Importation ajustée vers le code source client existant (si en plein refactoring croisé)
import { auth } from "../../firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuthSession = () => useContext(AuthContext);

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouteur persistant : pont entre le client Firebase local et la session serveur Next.js
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Élévation de privilège : Demande d'un jeton d'accès certifié (force refresh si besoin)
        try {
          const idToken = await currentUser.getIdToken(true);
          
          await fetch("/api/auth/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          });
        } catch (error) {
          console.error("[ClientProvider] Échec du durcissement de session :", error);
        }
      } else {
        // Phase de destruction : Éradication du cookie lors d'un logout natif / expiration
        try {
          await fetch("/api/auth/session", {
            method: "DELETE",
          });
        } catch (error) {
          console.error("[ClientProvider] Échec de la destruction de session :", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
