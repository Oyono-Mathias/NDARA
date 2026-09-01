import React, { useState } from 'react';
import { PrivacyService, DataExportRequest } from '../../services/privacyService';
import { Download, AlertCircle, FileJson, Loader2, CheckCircle2 } from 'lucide-react';

export const DataExport: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [requestData, setRequestData] = useState<DataExportRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);

  const handleExportRequest = async () => {
    if (status === 'loading') return;
    
    setStatus('loading');
    setErrorMessage(null);
    
    try {
      const response = await PrivacyService.requestDataExport();
      setRequestData(response.data);
      setIsMock(response.isMock);
      
      // Si le backend n'est pas connecté, c'est considéré techniquement comme un succès 
      // de la simulation, mais on affichera le message approprié.
      if (response.status === 'backend_not_connected') {
        setErrorMessage(response.message || 'Le backend n\'est pas connecté.');
      }
      
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur inattendue est survenue lors de la demande d\'export.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Download className="w-6 h-6 text-primary" />
          Export des données
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Vous avez le droit de demander une copie des données personnelles que nous conservons à votre sujet.
        </p>
      </div>

      {/* Information Box */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-gray-500" />
          Que contient l'export ?
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-1">
          <li>Informations de profil (nom, email).</li>
          <li>Historique des cours suivis et progression.</li>
          <li>Certificats obtenus.</li>
          <li>Vos préférences et paramètres.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-4 italic">
          L'export sera fourni dans un format lisible par machine (JSON ou CSV). La génération du fichier peut prendre plusieurs heures. Un email vous sera envoyé lorsque le fichier sera prêt.
        </p>
      </div>

      {/* Action Area */}
      <div className="flex flex-col gap-4">
        
        {status === 'success' && (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Demande enregistrée
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Votre demande a bien été prise en compte. Identifiant de suivi : <span className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded text-xs">{requestData?.requestId}</span>
            </p>
            
            {/* Avertissement MOCK explicite */}
            {isMock && (
              <div className="mt-2 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong>Mode démonstration.</strong> {errorMessage || "Aucun email réel ne sera envoyé et aucun fichier ne sera généré sans connexion à l'infrastructure backend."}
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {status !== 'success' && (
          <button
            onClick={handleExportRequest}
            disabled={status === 'loading'}
            className="w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Demander l'export de mes données
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
};
