const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'auth', 'RegisterView.tsx');
let code = fs.readFileSync(file, 'utf8');

const imports = `import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { Loader2, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { auth } from '../../firebase';
`;

code = code.replace(/import React from "react";[\s\S]*?import { Loader2.*? } from 'lucide-react';/, imports);

const logic = `
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  
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
      const response = await fetch(\`/api/ambassador/validate?code=\${encodeURIComponent(code)}\`);
      const data = await response.json();
      if (response.ok && data.valid) {
        setRefValid(true);
        setAmbassadorName(data.ambassadorName);
      } else {
        setRefValid(false);
        setRefError(data.error || "Code invalide");
      }
    } catch (err) {
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
      
      // Process referral
      if (refCode && refValid) {
        try {
          // Attendre un peu que Firebase mette à jour currentUser
          await new Promise(resolve => setTimeout(resolve, 500));
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            await fetch('/api/ambassador/process-referral', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${token}\`
              },
              body: JSON.stringify({ code: refCode })
            });
          }
        } catch (refErr) {
          console.error("Erreur process referral", refErr);
        }
      }

      await reloadUser();
      navigate('/auth/verify-email');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
      setIsLoading(false);
    }
  };
`;

code = code.replace(/const navigate = useNavigate\(\);[\s\S]*?const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};/, logic.trim());

const ui = `
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
`;

code = code.replace(/<div className="text-center mb-8">[\s\S]*?\{error && \(/, ui.trim());

// Disable button logic
code = code.replace(
  'disabled={isLoading}',
  'disabled={isLoading || (refCode ? refValid === false : false)}'
);

fs.writeFileSync(file, code);
console.log("RegisterView updated");
