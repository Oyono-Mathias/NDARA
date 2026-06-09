"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
// Synchronisation avec l'instance Firebase cliente existante
import { auth, db } from "../../src/firebase"; 
import { Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Authentification Firebase standard
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Détermination de la destination (Routing dynamique par Rôle)
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role = "student";
      if (userDoc.exists()) {
        role = userDoc.data().role || "student";
      }

      // 3. Temporisation stratégique : le onAuthStateChanged du ClientProvider 
      // est en train de négocier la création du Cookie '__session' avec Route Handler.
      // On introduit un léger délai pour sceller la session hybride avant la redirection.
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        if (role === 'admin' || role === 'ceo') {
            router.push("/admin/dashboard");
        } else if (role === 'instructor' || role === 'expert') {
            router.push("/instructor/dashboard");
        } else {
            router.push("/student/dashboard");
        }
      }
    } catch (err: any) {
      console.error("[Login] Auth Error:", err);
      setError("Échec de l'authentification. Identifiants invalides ou session corrompue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.1)] backdrop-blur-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Connexion Privée</h1>
        <p className="text-gray-400 text-sm">Passerelle cryptée vers votre infrastructure NDARA</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Adresse E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#10B981] outline-none transition-colors"
            required
            placeholder="vous@ndara.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Clé d'Accès</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#10B981] outline-none transition-colors"
            required
            placeholder="••••••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#10B981] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#059669] transition shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authentification"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 relative overflow-hidden">
      {/* Halo architectural en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#10B981]/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Suspense limitant le blocage client-side lors de la récupération des queryParams */}
      <Suspense fallback={<div className="text-[#10B981] animate-pulse font-mono tracking-widest text-sm text-glow">ASSEMBLAGE DU VECTEUR DE CONNEXION...</div>}>
         <LoginForm />
      </Suspense>
    </div>
  );
}
