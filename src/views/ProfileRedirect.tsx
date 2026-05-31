import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function ProfileRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/student/profile', { replace: true });
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white font-sans">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6 relative z-10" />
      </div>
      <h1 className="text-sm font-black uppercase tracking-[0.4em] text-white/80 animate-pulse">
        Chargement du profil...
      </h1>
    </div>
  );
}
