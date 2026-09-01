import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div 
      role="alert" 
      className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-center shadow-md animate-in slide-in-from-top-full duration-300 safe-area-top"
    >
      <WifiOff className="w-4 h-4 mr-2" aria-hidden="true" />
      <span className="text-sm font-medium">Vous êtes hors ligne. Vérifiez votre connexion internet.</span>
    </div>
  );
};
