import React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { Loader2, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Email envoyé</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        <Link 
          to="/auth/login" 
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Mot de passe oublié</h3>
        <p className="text-sm text-slate-400">Entrez votre email pour réinitialiser votre mot de passe.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Envoyer le lien</span>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
