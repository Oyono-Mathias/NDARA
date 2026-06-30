"use client";

import { motion } from "motion/react";
import { X, Smartphone, Monitor } from "lucide-react";
import { useState } from "react";

export default function PreviewModal({ onClose }: { onClose: () => void }) {
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col pt-20 pb-10 px-4 items-center"
    >
      <div className="absolute top-6 right-6 lg:right-12">
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-4 mb-8 bg-black/50 p-1.5 rounded-xl border border-white/10">
        <button 
          onClick={() => setDevice("desktop")}
          className={`px-4 py-2 rounded-lg font-mono text-sm flex items-center gap-2 transition ${device === "desktop" ? "bg-[#10B981] text-black" : "text-gray-400 hover:text-white"}`}
        >
          <Monitor className="w-4 h-4" /> DESKTOP
        </button>
        <button 
          onClick={() => setDevice("mobile")}
          className={`px-4 py-2 rounded-lg font-mono text-sm flex items-center gap-2 transition ${device === "mobile" ? "bg-[#10B981] text-black" : "text-gray-400 hover:text-white"}`}
        >
          <Smartphone className="w-4 h-4" /> MOBILE
        </button>
      </div>

      <motion.div 
        layout
        className={`bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] relative ${device === "desktop" ? "w-full max-w-5xl h-[70vh]" : "w-[375px] h-[812px] max-h-[80vh] rounded-[2.5rem] border-4 border-gray-800"}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-dots-pattern">
             <div className="w-16 h-16 rounded-full border-2 border-[#10B981]/50 border-t-[#10B981] animate-spin mb-6" />
             <h3 className="text-xl font-bold font-mono text-white mb-2">MOTEUR DE SIMULATION EN LIGNE</h3>
             <p className="text-gray-500 font-mono text-sm">Chargement haute-fidélité des composants serveur...</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
