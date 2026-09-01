import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { UserRole } from '../types/models';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Gardien d'interface (UX) limitant l'accès selon le rôle.
 * 
 * SÉCURITÉ: Cette vérification est purement esthétique (UX). La véritable 
 * sécurité des données (Lecture/Écriture) s'effectue via les firestore.rules 
 * ou le backend.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { role, loading, error } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // En cas d'erreur de chargement du rôle, on bloque l'accès aux interfaces sensibles.
  if (error || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
