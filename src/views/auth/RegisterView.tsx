import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { Loader2, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, limit, runTransaction, doc, getDoc, serverTimestamp, increment , setDoc } from 'firebase/firestore';


export function RegisterView() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || localStorage.getItem('referredBy');
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ambassador logic
  const [validatingRef, setValidatingRef] = useState(false);
  const [refValid, setRefValid] = useState<boolean | null>(null);
  const [ambassadorName, setAmbassadorName] = useState('');
  const [refError, setRefError] = useState('');

  useEffect(() => {
    if (refCode) {
      validateReferralCode(refCode);
    }
  }, [refCode]);

  const validateReferralCode = async (code: string) => {
    setValidatingRef(true);
    setRefError('');
    try {
      const q = query(collection(db, "ambassadors"), where("referralCode", "==", code), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const ambData = snapshot.docs[0].data();
        
        setRefValid(true);
        setAmbassadorName(ambData.name || 'Ambassadeur');

      } else {
        setRefValid(false);
        setRefError("Code invalide ou expiré");
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      setRefValid(false);
      setRefError("Erreur de validation");
    } finally {
      setValidatingRef(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refCode && refValid === false) return; // Empêcher l'inscription

    setError(null);
    setIsLoading(true);

    try {
      await authService.register(email, password, displayName, 'student');
      const user = authService.getCurrentUser();
      
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch('/api/auth/complete-registration', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refCode: (refCode && refValid) ? refCode : undefined })
        });
        
        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           throw new Error(errData.error || 'Erreur lors de la création du profil');
        }
      }

      await reloadUser();
      localStorage.removeItem('referredBy');
      navigate('/auth/verify-email');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Créer un compte</h3>
        <p className="text-sm text-slate-400">Rejoignez l'excellence académique.</p>
      </div>

      {refCode && (
        <div className="mb-6">
          {validatingRef ? (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-sm text-slate-300">Vérification de l'invitation...</p>
            </div>
          ) : refValid ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest">Vous êtes invité par</p>
              <p className="text-lg font-black text-emerald-400">{ambassadorName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">Code :</span>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded">{refCode}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full ml-auto">
                  <CheckCircle2 className="w-3 h-3" /> Invitation valide
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-sm font-bold text-rose-400">Invitation invalide : {refError}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom complet</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

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
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mot de passe</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || (refCode ? refValid === false : false)}
          className="w-full relative flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>S'inscrire</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        Déjà un compte ?{' '}
        <Link to="/auth/login" className="font-bold text-white hover:text-emerald-400 transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
