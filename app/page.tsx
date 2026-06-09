import { Suspense } from "react";
import HeroSection from "../components/public/HeroSection";
import FeaturesSection from "../components/public/FeaturesSection";

// React Server Component (RSC) ultra-performant.
// 0 JavaScript envoyé au client pour la structure globale.
export default function LandingPage() {
  return (
    <div className="relative">
      {/* Background Gradients (Statiques) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section interactive, embarquant potentiellement des animations */}
      <HeroSection />

      {/* Sections supplémentaires (Features, Testimonials, etc.) chargées progressivement */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse">Chargement des fonctionnalités...</div>}>
        <FeaturesSection />
      </Suspense>

      {/* Footer Statique */}
      <footer className="border-t border-white/5 py-12 text-center text-sm font-mono text-gray-500">
        <p>© {new Date().getFullYear()} NDARA. Next.js App Router Architecture.</p>
      </footer>
    </div>
  );
}
