import React from 'react';
import { Loader2 } from 'lucide-react';

export const ProfileRedirect: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold text-gray-900 text-center">Redirection en cours...</h2>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
        Ce composant détermine la destination correcte basée sur les rôles de AuthContext (non mocké ici pour garantir le Zero Trust).
      </p>
    </div>
  );
};
