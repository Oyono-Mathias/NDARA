import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { Loader2, MailCheck, AlertCircle, RefreshCw } from 'lucide-react';

export function VerifyEmailView() {
  const navigate = useNavigate();
  const { firebaseUser, reloadUser } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers login
    if (!firebaseUser) {
      navigate('/auth/login');
      return;
    }
    
    // Si l'email est déjà vérifié, rediriger vers dashboard
    if (firebaseUser.emailVerified) {
      navigate('/student/dashboard');
    }
    
    // Polling pour vérifier si l'email a été validé
    const interval = setInterval(async () => {
      await reloadUser();
      if (authService.getCurrentUser()?.emailVerified) {
        clearInterval(interval);
        navigate('/student/dashboard');
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [firebaseUser, navigate, reloadUser]);

  const handleResend = async () => {
    if (!firebaseUser) return;
    
    setError(null);
    setIsResending(true);
    setResendSuccess(false);

    try {
      await authService.sendVerificationEmail(firebaseUser);
      setResendSuccess(true);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
        <MailCheck className="w-8 h-8 text-blue-400" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Vérifiez votre email</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Nous avons envoyé un lien de confirmation à <br/>
          <strong className="text-white">{firebaseUser?.email}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}
      
      {resendSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left">
          <p className="text-sm text-emerald-400">Un nouveau lien de vérification a été envoyé.</p>
        </div>
      )}

      <div className="pt-4 space-y-4">
        <p className="text-xs text-slate-500">
          Cette page se rafraîchira automatiquement une fois votre email vérifié.
        </p>
        
        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isResending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Renvoyer le lien</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
