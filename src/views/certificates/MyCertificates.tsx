import React, { useEffect, useState } from 'react';
import { useCertificates } from '../../hooks/useCertificates';
import { CertificateCard } from '../../components/certificates/CertificateCard';
import { CertificatePreview } from '../../components/certificates/CertificatePreview';
import { Loader2, AlertCircle, Award } from 'lucide-react';

export const MyCertificates: React.FC = () => {
  const { certificates, currentCertificate, loading, error, isMockData, fetchMyCertificates, fetchCertificate } = useCertificates();
  const [viewingCertificateId, setViewingCertificateId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCertificates();
  }, [fetchMyCertificates]);

  const handleCertificateClick = (certId: string) => {
    setViewingCertificateId(certId);
    fetchCertificate(certId);
  };

  const handleBackToList = () => {
    setViewingCertificateId(null);
  };

  if (viewingCertificateId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Détails du certificat
          </h1>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
           <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center max-w-xl mx-auto w-full">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
              <button onClick={handleBackToList} className="px-6 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-xl min-h-[44px]">
                Retour à la liste
              </button>
           </div>
        ) : currentCertificate ? (
          <CertificatePreview certificate={currentCertificate} onBack={handleBackToList} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Mes Certificats
            {isMockData && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                Mock
              </span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Consultez et gérez vos certifications de fin de parcours.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Chargement de vos certificats...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erreur</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchMyCertificates()}
            className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-100 rounded-xl font-medium transition-colors min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun certificat</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Vous n'avez pas encore obtenu de certificat. Complétez vos parcours pour les voir apparaître ici.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map(cert => (
            <CertificateCard 
              key={cert.id} 
              certificate={cert} 
              onClick={handleCertificateClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
