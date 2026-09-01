import React from 'react';
import { CertificateEligibility } from '../../services/quizService';
import { FileBadge, Lock, ArrowRight } from 'lucide-react';

interface CertificateOnCompletionProps {
  eligibility: CertificateEligibility;
}

export const CertificateOnCompletion: React.FC<CertificateOnCompletionProps> = ({ eligibility }) => {
  if (!eligibility.isEligible) {
    return (
      <div className="w-full max-w-xl mx-auto mt-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
            Certification bloquée
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {eligibility.reason || 'Vous n\'avez pas atteint le seuil requis pour obtenir le certificat.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-6 relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-1 shadow-lg">
      
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left h-full">
        
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/50">
          <FileBadge className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h4 className="font-bold text-gray-900 dark:text-white">
              Éligible à la certification
            </h4>
            {eligibility.isMock && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                Mock
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-0">
            Félicitations ! Vous pouvez maintenant réclamer votre certificat de réussite.
          </p>
        </div>

        <button 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors min-h-[44px]"
          onClick={() => {
            // Intégration future (Phase 29 ou autre)
            // BLOCKED: Requires external route navigation or modal opening
            console.log("Mock: Redirection vers le générateur de certificat");
          }}
        >
          Obtenir
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
