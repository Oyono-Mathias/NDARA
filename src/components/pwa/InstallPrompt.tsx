import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Download, X, Loader2 } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const { installStatus, installPWA, dismissInstallPrompt } = usePWA();

  // Show only if the app is installable or currently installing
  if (
    installStatus !== 'installable' && 
    installStatus !== 'installation_in_progress'
  ) {
    return null;
  }

  const isInstalling = installStatus === 'installation_in_progress';

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none flex justify-center">
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.3)] rounded-3xl p-5 w-full max-w-md pointer-events-auto flex flex-col gap-4"
        role="dialog"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-desc"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/50">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h3 id="pwa-install-title" className="font-bold text-gray-900 dark:text-white text-base">
                Installez Ndara
              </h3>
              <p id="pwa-install-desc" className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words mt-0.5">
                Ajoutez l'application sur votre écran d'accueil pour une expérience rapide et hors ligne.
              </p>
            </div>
          </div>
          <button
            onClick={dismissInstallPrompt}
            disabled={isInstalling}
            className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors shrink-0 disabled:opacity-50"
            aria-label="Fermer l'invite d'installation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <button
            onClick={dismissInstallPrompt}
            disabled={isInstalling}
            className="flex-1 w-full min-h-[44px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Plus tard
          </button>
          <button
            onClick={installPWA}
            disabled={isInstalling}
            className="flex-1 w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {isInstalling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Installation...
              </>
            ) : (
              'Installer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
