import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function GuestGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (firebaseUser) {
    // Si l'utilisateur est déjà connecté, on redirige vers son tableau de bord selon son rôle
    const targetPath = appUser?.role === 'admin' || appUser?.role === 'superadmin' 
      ? '/admin' 
      : appUser?.role === 'instructor' 
        ? '/instructor' 
        : '/student/dashboard';
        
    const from = (location.state as any)?.from?.pathname || targetPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
