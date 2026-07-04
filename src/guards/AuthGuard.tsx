import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  if (appUser?.deletedAt) {
      return (
          <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center p-4">
              <div className="text-center text-white">
                  <h1 className="text-2xl font-bold mb-2">Compte supprimé</h1>
                  <p className="text-slate-400">Ce compte n'est plus actif. Veuillez contacter le support.</p>
              </div>
          </div>
      );
  }

  return <>{children}</>;
}
