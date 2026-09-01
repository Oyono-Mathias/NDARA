import React, { useState } from 'react';
import { PrivacyService, DataDeletionRequest } from '../../services/privacyService';
import { Trash2, AlertTriangle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const DataDeletion: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [requestData, setRequestData] = useState<DataDeletionRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);

  // Étapes de confirmation
  const [confirmDataLoss, setConfirmDataLoss] = useState(false);
  const [confirmIrreversible, setConfirmIrreversible] = useState(false);

  const isButtonEnabled = confirmDataLoss && confirmIrreversible && status !== 'loading';

  const handleDeleteRequest = async () => {
    if (!isButtonEnabled) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await PrivacyService.requestDataDeletion();
      setRequestData(response.data);
      setIsMock(response.isMock);

      if (response.status === 'backend_not_connected') {
        setErrorMessage(response.message || 'Le backend n\'est pas connecté.');
      }
      
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue lors de la demande de suppression.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 flex items-center gap-3">
          <Trash2 className="w-6 h-6" />
          Suppression du compte
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Vous pouvez demander la suppression définitive de votre compte et de toutes vos données personnelles.
        </p>
      </div>

      {/* Avertissement Majeur */}
      <div className="bg-red-50 dark:bg-red-900/10 p-5 sm:p-6 rounded-2xl border border-red-200 dark:border-red-800/50 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-red-800 dark:text-red-400">Cette action est irréversible.</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              La suppression de votre compte entraînera :
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1 ml-1">
              <li>La perte totale de votre progression dans les cours.</li>
              <li>La suppression de tous vos certificats obtenus.</li>
              <li>L'impossibilité de restaurer votre historique.</li>
            </ul>
          </div>
        </div>
      </div>

      {status === 'success' ? (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            Demande de suppression enregistrée
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Votre demande a été prise en compte (ID: <span className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded text-xs">{requestData?.deletionId}</span>).
            <br className="hidden sm:block" />
            La suppression effective aura lieu d'ici le {requestData ? new Date(requestData.estimatedDeletionDate).toLocaleDateString() : '30 jours'}.
          </p>
          
          {isMock && (
            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Démonstration uniquement.</strong> {errorMessage || "Aucune suppression réelle n'a été effectuée. Cette opération nécessite l'intégration avec le véritable backend de sécurité."}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Checkboxes de confirmation */}
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[44px]">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 checked:bg-red-500 checked:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                  checked={confirmDataLoss}
                  onChange={(e) => setConfirmDataLoss(e.target.checked)}
                  disabled={status === 'loading'}
                />
                <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                Je comprends que je vais perdre l'accès à tous mes cours et certificats.
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[44px]">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 checked:bg-red-500 checked:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                  checked={confirmIrreversible}
                  onChange={(e) => setConfirmIrreversible(e.target.checked)}
                  disabled={status === 'loading'}
                />
                <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                Je comprends que cette action est définitive et ne pourra pas être annulée.
              </span>
            </label>
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <button
            onClick={handleDeleteRequest}
            disabled={!isButtonEnabled}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Supprimer définitivement mon compte
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
