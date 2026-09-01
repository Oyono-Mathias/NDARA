import React, { useEffect, useState } from 'react';
import { useCertificates } from '../../hooks/useCertificates';
import { Loader2, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { CertificatePreview } from '../../components/certificates/CertificatePreview';

interface CertificateGeneratorProps {
  courseId: string; // Passed from route or parent
  onBack?: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ courseId, onBack }) => {
  const { 
    checkCourseEligibility, 
    generateCertificate, 
    eligibility, 
    loading, 
    generating, 
    error,
    currentCertificate 
  } = useCertificates();

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      checkCourseEligibility(courseId);
    }
  }, [courseId, checkCourseEligibility]);

  const handleGenerate = async () => {
    setLocalError(null);
    const cert = await generateCertificate(courseId);
    if (!cert && !error) {
       // If no cert returned and no error from hook, set local fallback error
       setLocalError("La génération a échoué. Action bloquée ou backend indisponible.");
    }
  };

  // If a certificate was just generated (or was already generated), show it
  if (currentCertificate) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Votre Certificat</h1>
        </div>
        <CertificatePreview certificate={currentCertificate} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Obtention du Certificat
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Vérification des critères de complétion pour générer votre certificat Ndara officiel.
        </p>
      </header>

      {(error || localError) && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 sm:p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 dark:text-red-400 font-medium">
            {error || localError}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Vérification de l'éligibilité...</p>
        </div>
      ) : eligibility ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${eligibility.isEligible ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
              {eligibility.isEligible ? <CheckCircle className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {eligibility.courseTitle}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Statut : <span className="font-semibold uppercase">{eligibility.status}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {eligibility.isEligible ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl">
                <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                  Félicitations ! Vous avez complété toutes les exigences. Vous pouvez maintenant générer votre certificat.
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 p-4 rounded-xl">
                <p className="text-orange-800 dark:text-orange-300 text-sm font-medium">
                  {eligibility.reason || "Vous n'êtes pas encore éligible pour ce certificat."}
                </p>
              </div>
            )}

            {eligibility.isMock && (
               <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-3 py-2 rounded-lg font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                 Mode Mock : Les validations sont simulées côté client.
               </div>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-end">
             {onBack && (
               <button 
                 onClick={onBack}
                 className="w-full sm:w-auto px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
               >
                 Annuler
               </button>
             )}
             
             <button
               onClick={handleGenerate}
               disabled={!eligibility.isEligible || generating}
               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
             >
               {generating ? (
                 <><Loader2 className="w-5 h-5 animate-spin" /> Génération...</>
               ) : (
                 "Générer mon certificat"
               )}
             </button>
          </div>

        </div>
      ) : null}
    </div>
  );
};
