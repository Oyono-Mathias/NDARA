import React, { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { TwoFactorService } from '../../services/2faService';

interface TwoFactorVerifyProps {
  onSuccess?: () => void;
  contextId?: string; // Peut représenter l'ID d'une transaction, etc.
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({ onSuccess, contextId }) => {
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const isValid = await TwoFactorService.verifyCode(verificationCode, contextId);
      if (isValid && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Code invalide ou expiré.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-sm bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Vérification de sécurité</h2>
        <p className="text-gray-500 text-sm mb-8">
          Veuillez saisir le code à 6 chiffres généré par votre application d'authentification.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <label htmlFor="auth-code" className="sr-only">Code d'authentification</label>
          <input
            id="auth-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[0.5em] font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-6"
            required
            autoComplete="one-time-code"
            autoFocus
          />
          
          <button
            type="submit"
            disabled={verifying || verificationCode.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
          >
            {verifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Vérifier
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Vous n'avez pas accès à votre téléphone ? <br />
          <button className="text-blue-600 hover:underline font-medium mt-1">
            Utiliser un code de récupération
          </button>
        </p>
      </div>
    </div>
  );
};
