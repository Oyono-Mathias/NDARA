import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export function LoginView() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(email, password);
      await reloadUser();
      // Redirection gérée par GuestGuard
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Bienvenue</h3>
        <p className="text-sm text-slate-400">Connectez-vous à votre espace d'apprentissage.</p>
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

        <div className="space-y-1">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Mot de passe</label>
            <Link to="/auth/forgot-password" className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Oublié ?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="••••••••"
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
            <>
              <span>Se connecter</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        Nouveau sur NDARA ?{' '}
        <Link to="/auth/register" className="font-bold text-white hover:text-emerald-400 transition-colors">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
