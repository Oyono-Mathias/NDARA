import React, { useState } from 'react';
import { Download, Share2, AlertCircle } from 'lucide-react';
import { Certificate } from '../../services/certificateService';
import { CertificateTemplate } from '../../views/certificates/CertificateTemplate';

interface CertificatePreviewProps {
  certificate: Certificate;
  onBack?: () => void;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ certificate, onBack }) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = () => {
    // We mock the failure of PDF infrastructure to comply with rules.
    setDownloadError("DOWNLOAD_NOT_AVAILABLE: L'infrastructure de génération PDF n'est pas encore connectée au backend réel. Action reportée.");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Actions / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="self-start text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[44px]"
          >
            Retour
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            Télécharger (PDF)
          </button>
          
          <button 
            onClick={() => alert("Partage non disponible dans cette phase.")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            {downloadError}
          </p>
        </div>
      )}

      {certificate.isMock && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 text-center text-sm font-medium text-amber-700 dark:text-amber-400">
          Ceci est une prévisualisation simulée (MOCK). Ce certificat n'a pas de valeur officielle tant que le backend n'est pas connecté.
        </div>
      )}

      {/* The Certificate Document Container */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[800px] w-full transform origin-top-left sm:transform-none">
          <CertificateTemplate certificate={certificate} />
        </div>
      </div>
    </div>
  );
};
