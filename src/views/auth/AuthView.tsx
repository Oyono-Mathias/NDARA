import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useGoogleAuth } from '../../contexts/GoogleProvider';
import { normalizeFirebaseError } from '../../utils/firebaseErrors';
import { useFirestoreDocument } from '../../hooks/useFirestoreData';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Shield, Globe, Lock } from 'lucide-react';
import styles from './AuthView.module.css';

interface StatData {
  totalApprenants: number;
  totalCours: number;
  totalPays: number;
}

export const AuthView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useGoogleAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Firestore Stats (temps réel)
  const { data: stats, loading: statsLoading } = useFirestoreDocument<StatData>('statistiques', 'global');

  // URL setup
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Si la route est /register, on switch automatiquement
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (activeTab === 'register') {
      if (!fullName) {
        setError('Veuillez entrer votre nom complet');
        return;
      }
      if (!termsAccepted) {
        setError('Vous devez accepter les conditions générales');
        return;
      }
    }

    setLoading(true);
    
    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: fullName });
        
        await setDoc(doc(db, 'users', user.uid), {
          nom: fullName,
          email: user.email,
          role: 'user',
          dateInscription: serverTimestamp()
        });
        
        setSuccess('Compte créé avec succès ! Redirection...');
        setTimeout(() => navigate(from, { replace: true }), 1500);
      }
    } catch (err: unknown) {
      const normalized = normalizeFirebaseError(err);
      setError(normalized.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
        navigate(from, { replace: true });
      }
      // Other providers can be implemented similarly
    } catch (err) {
      setError('Erreur lors de la connexion sociale');
    }
  };

  const passStrength = calculatePasswordStrength(password);

  return (
    <div className={styles.authContainer}>
      <div className={styles.meshBg} aria-hidden="true">
        <div className={`${styles.meshOrb} ${styles.meshOrb1}`}></div>
        <div className={`${styles.meshOrb} ${styles.meshOrb2}`}></div>
      </div>
      <div className={styles.kentePattern} aria-hidden="true"></div>

      <div className={styles.page}>
        
        {/* Left: Branding */}
        <aside className={styles.brandSide}>
          <div className={styles.brandContent}>
            <div className={styles.brandLogo}>
              <img 
                src="https://image.qwenlm.ai/public_source/3c808314-d5a7-40a3-bc2a-5cedc60a1b5c/129ac15f1-df23-4a15-bcd3-db2b6ca4e7e0.png" 
                alt="" 
                className={styles.brandLogoImg} 
              />
              <span className={styles.brandLogoText}>NDARA</span>
            </div>
            
            <div className={styles.brandHero}>
              <h1 className={styles.brandTitle}>
                Rejoignez la <span className={styles.highlight}>révolution éducative</span> africaine
              </h1>
              <p className={styles.brandSubtitle}>
                Plus de {statsLoading ? '...' : (stats?.totalApprenants || 50000).toLocaleString()} apprenants vous attendent sur la première plateforme e-learning panafricaine.
              </p>
              
              <div className={styles.brandFeatures}>
                <div className={styles.brandFeature}>
                  <div className={styles.brandFeatureIcon}>🎓</div>
                  <div className={styles.brandFeatureText}>+1 200 cours certifiants</div>
                </div>
                <div className={styles.brandFeature}>
                  <div className={styles.brandFeatureIcon}>📱</div>
                  <div className={styles.brandFeatureText}>Apprenez hors-ligne, partout</div>
                </div>
                <div className={styles.brandFeature}>
                  <div className={styles.brandFeatureIcon}>💰</div>
                  <div className={styles.brandFeatureText}>Paiement Mobile Money accepté</div>
                </div>
                <div className={styles.brandFeature}>
                  <div className={styles.brandFeatureIcon}>🏆</div>
                  <div className={styles.brandFeatureText}>Certificats reconnus par 500+ entreprises</div>
                </div>
              </div>
            </div>
            
            <div className={styles.brandStats}>
              <div>
                <div className={styles.brandStatValue}>
                  {statsLoading ? '--' : `${(stats?.totalApprenants || 50000) / 1000}K+`}
                </div>
                <div className={styles.brandStatLabel}>Apprenants</div>
              </div>
              <div>
                <div className={styles.brandStatValue}>
                  {statsLoading ? '--' : `${(stats?.totalCours || 1200) / 1000}K`}
                </div>
                <div className={styles.brandStatLabel}>Cours</div>
              </div>
              <div>
                <div className={styles.brandStatValue}>
                  {statsLoading ? '--' : (stats?.totalPays || 25)}
                </div>
                <div className={styles.brandStatLabel}>Pays</div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Right: Form */}
        <main className={styles.formSide}>
          <div className={styles.formTop}>
            <div className={styles.formLogoMobile}>
              <img src="https://image.qwenlm.ai/public_source/3c808314-d5a7-40a3-bc2a-5cedc60a1b5c/129ac15f1-df23-4a15-bcd3-db2b6ca4e7e0.png" alt="" />
              <span>NDARA</span>
            </div>
            <button className={styles.langSwitch}>
              <Globe size={14} />
              FR
            </button>
          </div>
          
          <div className={styles.formContainer}>
            <motion.div 
              className={styles.formCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              
              <div className={styles.formHeader}>
                <div className={styles.formIcon}>
                  <Lock size={28} className="text-[#ffd700]" />
                </div>
                <h1 className={styles.formTitle}>
                  {activeTab === 'login' ? 'Bon retour parmi nous !' : 'Rejoignez NDARA !'}
                </h1>
                <p className={styles.formSubtitle}>
                  {activeTab === 'login' 
                    ? 'Connectez-vous pour continuer votre apprentissage'
                    : 'Créez votre compte et commencez à apprendre'}
                </p>
              </div>
              
              {/* Tabs */}
              <div className={styles.authTabs} role="tablist">
                <button 
                  className={`${styles.authTab} ${activeTab === 'login' ? styles.active : ''}`}
                  onClick={() => { setActiveTab('login'); navigate('/login'); }}
                  role="tab" 
                  aria-selected={activeTab === 'login'}
                >
                  Connexion
                </button>
                <button 
                  className={`${styles.authTab} ${activeTab === 'register' ? styles.active : ''}`}
                  onClick={() => { setActiveTab('register'); navigate('/register'); }}
                  role="tab" 
                  aria-selected={activeTab === 'register'}
                >
                  Inscription
                </button>
              </div>
              
              {/* Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className={`${styles.alert} ${styles.alertError}`}
                  >
                    <AlertCircle className={styles.alertIcon} />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className={`${styles.alert} ${styles.alertSuccess}`}
                  >
                    <CheckCircle2 className={styles.alertIcon} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className={styles.socialLogin}>
                <button type="button" className={styles.socialBtn} onClick={() => handleSocialSignIn('google')} aria-label="Continuer avec Google">
                  <svg viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button type="button" className={styles.socialBtn} aria-label="Continuer avec Facebook">
                  <svg viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button type="button" className={styles.socialBtn} aria-label="Continuer avec Apple">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
              
              <div className={styles.orDivider}>
                ou {activeTab === 'login' ? 'continuez avec votre email' : 'créez un compte avec votre email'}
              </div>
              
              <form className={styles.authForm} onSubmit={handleAuth} noValidate>
                {activeTab === 'register' && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="fullName">Nom complet</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input 
                        type="text" 
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={styles.formInput} 
                        placeholder="Ex: Amina Koné" 
                        autoComplete="name" 
                        required 
                      />
                    </div>
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="email">Email</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input 
                      type="email" 
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.formInput} 
                      placeholder="votre@email.com" 
                      autoComplete="email" 
                      required 
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="password">
                    Mot de passe
                    {activeTab === 'login' && (
                      <Link to="/forgot-password" className={styles.formLabelLink}>Mot de passe oublié ?</Link>
                    )}
                  </label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.formInput} 
                      placeholder={activeTab === 'login' ? '••••••••' : 'Minimum 8 caractères'} 
                      autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                      required 
                    />
                    <button 
                      type="button" 
                      className={styles.inputToggle} 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Afficher le mot de passe"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {activeTab === 'register' && password.length > 0 && (
                    <>
                      <div className={styles.passwordStrength}>
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level}
                            className={`${styles.strengthBar} ${
                              passStrength >= level 
                                ? passStrength <= 1 ? styles.weak : passStrength <= 2 ? styles.medium : styles.strong
                                : ''
                            }`} 
                          />
                        ))}
                      </div>
                      <div className={`${styles.strengthText} ${
                          passStrength <= 1 ? styles.weak : passStrength <= 2 ? styles.medium : styles.strong
                      }`}>
                        {passStrength <= 1 ? '🔴 Faible' : passStrength <= 2 ? '🟠 Moyen' : '🟢 Fort'}
                      </div>
                    </>
                  )}
                </div>
                
                {activeTab === 'login' ? (
                  <div className={styles.checkboxRow}>
                    <div 
                      className={`${styles.checkboxWrap} ${rememberMe ? styles.active : ''}`} 
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      <div className={styles.checkbox}></div>
                      <span>Se souvenir de moi</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.checkboxRow}>
                    <div 
                      className={`${styles.checkboxWrap} ${termsAccepted ? styles.active : ''}`} 
                      onClick={() => setTermsAccepted(!termsAccepted)}
                    >
                      <div className={styles.checkbox}></div>
                      <span style={{ fontSize: 'var(--text-xs)' }}>
                        J'accepte les <a href="#" style={{ color: 'var(--accent-gold)' }}>CGU</a> et la <a href="#" style={{ color: 'var(--accent-gold)' }}>Politique de confidentialité</a>
                      </span>
                    </div>
                  </div>
                )}
                
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? (
                    <div className={styles.btnSpinner}></div>
                  ) : (
                    <span className="btn-text">
                      {activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    </span>
                  )}
                </button>
                
                <div className={styles.securityBadge}>
                  {activeTab === 'login' ? (
                    <>
                      <Shield size={12} />
                      Connexion sécurisée • 2FA disponible • Chiffrement SSL
                    </>
                  ) : (
                    <>
                      <Shield size={12} />
                      7 jours d'essai gratuit • Sans engagement • Annulation à tout moment
                    </>
                  )}
                </div>
              </form>
              
            </motion.div>
            
            <div className={styles.formFooter}>
              <div className={styles.formFooterLinks}>
                <a href="#">Centre d'aide</a>
                <a href="#">Support</a>
                <a href="#">Confidentialité</a>
              </div>
              <p style={{ marginTop: 'var(--space-sm)' }}>
                © 2027 NDARA Afrique • Made with ❤️ in Africa
              </p>
            </div>
            
          </div>
        </main>
        
      </div>
    </div>
  );
};
