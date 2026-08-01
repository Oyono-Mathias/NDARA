import { logger } from '../../lib/logger';
import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";

export function PromptCopierFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const promptText = `PHASE 1 — SÉCURISATION ET STABILISATION DU MODULE INSTRUCTOR

Avant toute modification, analyse l'existant et respecte strictement l'architecture actuelle. Ne supprime aucune fonctionnalité déjà opérationnelle.

OBJECTIF :
Corriger les problèmes critiques identifiés dans l'audit du module Instructor et préparer une base stable pour les futurs développements.

TRAVAIL À EFFECTUER :

1. SÉCURITÉ FIRESTORE (PRIORITÉ ABSOLUE)
Réécrire les règles Firestore concernant :
- courses
- course_coupons
- course_announcements
- course_resources
- course_qna
- certificates
- enrollments
... (et la suite des 8 points)`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      logger.error("Failed to copy", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 bg-[#10B981] text-black p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
        aria-label="Copier le prompt"
      >
        <Copy className="h-6 w-6" />
      </button>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Copier le prompt"
      >
        <div className="flex flex-col gap-6 p-4">
          <div className="bg-[#1e293b] rounded-2xl p-4 max-h-[40vh] overflow-y-auto border border-white/5 text-xs text-slate-300 whitespace-pre-wrap">
            {promptText}
          </div>
          
          <button
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-[#10B981] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#10B981]/90 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Prompt copié !
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copier le prompt
              </>
            )}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
