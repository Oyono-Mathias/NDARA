import React, { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export function AuthView() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
        if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    if (activeTab === 'register' && settings?.users?.allowRegistration === false) {
        setError("Les nouvelles inscriptions sont temporairement suspendues.");
        return;
    }

    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      let referredBy = null;
      try {
          const refDataStr = localStorage.getItem('ndara_referral');
          if (refDataStr) {
              const refData = JSON.parse(refDataStr);
              if (refData.expiresAt > Date.now() && refData.instructorId) {
                  referredBy = refData.instructorId;
              }
          }
      } catch (e) {}

      if (!userSnap.exists()) {
        if (settings?.users?.allowRegistration === false) {
            await auth.signOut();
            setError("Les nouvelles inscriptions sont temporairement suspendues.");
            return;
        }

        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || "",
          fullName: user.displayName || "Étudiant",
          username: (user.displayName || 'user').replace(/\s/g, '_').toLowerCase() + Math.floor(1000 + Math.random() * 9000),
          role: "student",
          status: "active",
          createdAt: serverTimestamp(),
          profilePictureURL: user.photoURL || '',
          balance: 0,
          affiliateBalance: 0,
          pendingAffiliateBalance: 0,
          referredBy: referredBy,
          affiliateStats: { clicks: 0, registrations: 0, sales: 0, earnings: 0 }
        });

        // Track registration in the referrer profile if exists
        // Though it shouldn't hold back the response too long; it could be done async but we just do it here
        if (referredBy) {
            const refDocRef = doc(db, "users", referredBy);
            const refSnap = await getDoc(refDocRef);
            if (refSnap.exists()) {
                const affStats = refSnap.data().affiliateStats || { clicks: 0, registrations: 0, sales: 0, earnings: 0 };
                affStats.registrations = (affStats.registrations || 0) + 1;
                await setDoc(refDocRef, { affiliateStats: affStats }, { merge: true });
            }
        }
      }

      const userData = userSnap.exists() ? userSnap.data() : { role: 'student' };
      
      if (userData.role === 'admin' || userData.role === 'ceo') {
          navigate('/admin/dashboard');
      } else if (userData.role === 'expert' || userData.role === 'instructor') {
          navigate('/instructor/dashboard');
      } else {
          navigate('/student/dashboard');
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
          setError("Le popup de connexion a été bloqué par votre navigateur. Autorisez-le ou ouvrez la page dans un nouvel onglet.");
      } else if (err.code === 'auth/popup-closed-by-user') {
          // ignore error since user just closed it
          setError("La connexion a été annulée. Veuillez réessayer.");
      } else {
          setError("Une erreur est survenue lors de l'authentification.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        setLoading(true);
        setError(null);
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        let userData: any;
        if (!userSnap.exists()) {
            userData = {
              uid: user.uid,
              email: user.email || email,
              fullName: user.displayName || "Étudiant",
              username: (user.displayName || 'user').replace(/\s/g, '_').toLowerCase() + Math.floor(1000 + Math.random() * 9000),
              role: "student",
              status: "active",
              createdAt: serverTimestamp(),
              profilePictureURL: user.photoURL || '',
              balance: 0,
              affiliateBalance: 0,
              pendingAffiliateBalance: 0,
              affiliateStats: { clicks: 0, registrations: 0, sales: 0, earnings: 0 }
            };
            await setDoc(userRef, userData);
        } else {
            userData = userSnap.data();
        }
        
        if (userData.role === 'admin' || userData.role === 'ceo') {
            navigate('/admin/dashboard');
        } else if (userData.role === 'expert' || userData.role === 'instructor') {
            navigate('/instructor/dashboard');
        } else {
            navigate('/student/dashboard');
        }
    } catch (err: any) {
        setError(err.message || "Identifiants incorrects.");
    } finally {
        setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings?.users?.allowRegistration === false) {
        setError("Les nouvelles inscriptions sont temporairement suspendues.");
        return;
    }
    if (!terms) {
        setError("Vous devez accepter les conditions d'utilisation.");
        return;
    }
    try {
        setLoading(true);
        setError(null);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        
        let referredBy = null;
        try {
            const refDataStr = localStorage.getItem('ndara_referral');
            if (refDataStr) {
                const refData = JSON.parse(refDataStr);
                if (refData.expiresAt > Date.now() && refData.instructorId) {
                    referredBy = refData.instructorId;
                }
            }
        } catch (e) {}

        const userRef = doc(db, "users", authUser.uid);
        await setDoc(userRef, {
            uid: authUser.uid,
            email: email,
            fullName: fullName,
            username: fullName.replace(/\s/g, '_').toLowerCase() + Math.floor(1000 + Math.random() * 9000),
            role: "student",
            status: "active",
            createdAt: serverTimestamp(),
            balance: 0,
            affiliateBalance: 0,
            pendingAffiliateBalance: 0,
            referredBy: referredBy,
            affiliateStats: { clicks: 0, registrations: 0, sales: 0, earnings: 0 }
        });

        if (referredBy) {
            const refDocRef = doc(db, "users", referredBy);
            const refSnap = await getDoc(refDocRef);
            if (refSnap.exists()) {
                const affStats = refSnap.data().affiliateStats || { clicks: 0, registrations: 0, sales: 0, earnings: 0 };
                affStats.registrations = (affStats.registrations || 0) + 1;
                await setDoc(refDocRef, { affiliateStats: affStats }, { merge: true });
            }
        }

        navigate('/student/dashboard');
    } catch (err: any) {
        setError(err.message || "Erreur d'inscription.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center relative overflow-hidden items-center p-4 py-12">
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 glass rounded-[2.5rem] p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col bg-[#111111]">
        
        <div className="flex flex-col items-center mb-8">
            <Link to="/" className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-primary font-black text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-4 transition-transform hover:scale-105">
                N
            </Link>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Ndara Afrique</h1>
        </div>
        
        <div className="flex gap-2 bg-black rounded-2xl p-1 mb-6 border border-white/5">
            <button 
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 rounded-xl h-10 font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'login' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
            >
                Connexion
            </button>
            <button 
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`flex-1 rounded-xl h-10 font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'register' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
            >
                Inscription
            </button>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-4 rounded-xl mb-6 font-medium text-center">
            {error}
          </div>
        )}

        {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
                <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 focus:outline-none transition-all text-sm"
                        placeholder="email@exemple.com"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Mot de passe</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 focus:outline-none transition-all text-sm"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Se Connecter
                </button>
            </form>
        )}

        {activeTab === 'register' && (
            settings?.users?.allowRegistration === false ? (
                <div className="py-6 text-center space-y-4 mb-6 bg-black rounded-xl border border-white/5">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscriptions suspendues</p>
                    <p className="text-xs text-slate-500 italic">Revenez très prochainement.</p>
                </div>
            ) : (
                <form onSubmit={handleEmailRegister} className="space-y-4 mb-6">
                    <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Nom complet</label>
                        <input 
                            type="text" 
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 focus:outline-none transition-all text-sm"
                            placeholder="Prénom & Nom"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 focus:outline-none transition-all text-sm"
                            placeholder="nom@exemple.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Mot de passe</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 focus:outline-none transition-all text-sm"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                        <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 bg-black border-white/10 rounded text-primary focus:ring-primary focus:ring-offset-black" />
                        <label htmlFor="terms" className="text-[10px] text-slate-500 font-medium">
                            J'accepte les <Link to="/cgu" className="text-slate-300 underline">conditions d'utilisation</Link> et la <Link to="/legal" className="text-slate-300 underline">politique de confidentialité</Link>.
                        </label>
                    </div>
                    <button 
                      type="submit"
                      disabled={loading || !terms}
                      className="w-full h-12 bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors mt-2 disabled:opacity-50"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Créer un compte
                    </button>
                </form>
            )
        )}

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#111111] px-4 text-slate-500 tracking-widest">OU</span></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-black border border-white/10 text-white hover:bg-white/5 flex items-center justify-center gap-3 h-12 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm"
        >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continuer avec Google
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
           <ShieldCheck className="w-3 h-3 text-primary" />
           Authentification sécurisée
        </div>
      </div>
    </div>
  );
}
