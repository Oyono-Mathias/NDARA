import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/models';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!appUser || !allowedRoles.includes(appUser.role)) {
    // Si pas les droits, redirige vers une page d'accès refusé ou l'accueil
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
