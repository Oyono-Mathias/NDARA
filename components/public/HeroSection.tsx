"use client";

import { useState } from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { PlayCircle, ArrowRight } from "lucide-react";

// Lazy loading natif du système premium "Preview Modal". 
// Le code du widget/simulateur ne sera téléchargé que si l'utilisateur clique sur "Aperçu".
const PreviewModal = dynamic(() => import("./PreviewModal"), {
  loading: () => <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-pulse text-[#10B981] font-mono">CHARGEMENT DU MOTEUR D'APERÇU...</div>,
  ssr: false, // Évite les problèmes de dimensionnement/hydratation pour les Canvas/Widgets
});

export default function HeroSection() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-mono text-gray-300">NEXT.JS 15 ARCHITECTURE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
          Apprenez sans limites avec <span className="text-[#10B981] text-glow">NDARA</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Découvrez la plateforme d'éducation nouvelle génération. Une expérience fluide, ultra-rapide et optimisée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#10B981] text-black font-bold rounded-xl flex items-center gap-2 hover:bg-[#059669] transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreview(true)}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/10 transition"
          >
            <PlayCircle className="w-5 h-5 text-[#10B981]" /> Voir l'Aperçu Interactif
          </motion.button>
        </div>
      </motion.div>

      {/* Rendu asynchrone du modal Premium */}
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </section>
  );
}
