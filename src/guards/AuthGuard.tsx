import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protège les routes nécessitant que l'utilisateur soit connecté.
 * Redirige vers la page de login en gardant l'historique de la route voulue.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirige silencieusement en transmettant la route d'origine pour le flux post-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ne pas exposer le children si non authentifié.
  return <>{children}</>;
};
