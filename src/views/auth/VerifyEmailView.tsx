import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/authService';
import { normalizeFirebaseError } from '../../utils/firebaseErrors';
import { auth } from '../../firebase';

export const VerifyEmailView: React.FC = () => {
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirige vers le dashboard si l'email est déjà vérifié
  useEffect(() => {
    if (!authLoading && currentUser?.emailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await AuthService.sendVerificationEmail();
      setSuccess("Un nouvel e-mail de vérification a été envoyé.");
    } catch (err: unknown) {
      const normalized = normalizeFirebaseError(err);
      setError(normalized.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setError(null);
    try {
      // Force le rafraîchissement du profil utilisateur
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          navigate('/dashboard', { replace: true });
        } else {
          setError("Votre adresse e-mail n'est pas encore vérifiée. Veuillez vérifier votre boîte de réception.");
        }
      }
    } catch (err: unknown) {
      const normalized = normalizeFirebaseError(err);
      setError(normalized.message);
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      // Ignorer silencieusement l'erreur de déconnexion si la session est expirée
      navigate('/login', { replace: true });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Sécurité: Ne pas afficher si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-4 text-center">
        <p className="text-gray-600 mb-4">Veuillez vous connecter pour vérifier votre compte.</p>
        <button 
          onClick={() => navigate('/login', { replace: true })}
          className="text-blue-600 font-medium"
        >
          Aller à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vérifiez votre e-mail</h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Un lien de vérification a été envoyé à l'adresse :<br/>
          <span className="font-medium text-gray-900">{currentUser.email}</span>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl mb-6 text-left border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl mb-6 flex items-start text-left border border-green-100">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {checking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                J'ai vérifié mon e-mail
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Renvoyer le lien'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};
