import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * Protège les routes réservées aux utilisateurs NON authentifiés (ex: Login, Register).
 * Si l'utilisateur est déjà connecté, il est redirigé vers son tableau de bord.
 */
export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Évite les boucles d'authentification en redirigeant vers le dashboard par défaut
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
