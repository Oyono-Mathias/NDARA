import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineFallbackProps {
  isFullScreen?: boolean;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  isFullScreen = false,
  title = "Vous êtes hors connexion",
  description = "Certaines fonctionnalités nécessitent une connexion internet active.",
  onRetry
}) => {
  const { isOnline, retryConnection } = usePWA();

  // Hide fallback if online (unless we want to always show it for debug, but logically we hide it)
  if (isOnline) {
    return null;
  }

  const handleRetry = () => {
    retryConnection();
    if (onRetry) {
      onRetry();
    }
  };

  if (isFullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center gap-6 w-full max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center shadow-inner">
          <WifiOff className="w-10 h-10" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50 rounded-xl p-4 w-full text-left">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
            <strong>Mode dégradé :</strong> Les opérations sensibles, comme les réservations et paiements, sont temporairement bloquées.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full min-h-[56px] px-8 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer
        </button>
      </div>
    );
  }

  // Persistent banner mode
  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 p-4 w-full"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">
              {title}
            </h3>
            <p className="text-amber-700 dark:text-amber-400/80 text-xs mt-0.5 line-clamp-2 break-words">
              Mode dégradé. Les données peuvent ne pas être à jour et les opérations sensibles sont bloquées.
            </p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          className="w-full sm:w-auto min-h-[44px] px-6 bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
};
