import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, CheckCircle2, AlertCircle, Info, Lock, 
  Mail, User, Shield, ChevronLeft, ArrowRight
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useGoogleAuth } from '../../contexts/GoogleProvider';
import { normalizeFirebaseError } from '../../utils/firebaseErrors';
import { useFirestoreDocument } from '../../hooks/useFirestoreData';
import styles from './RegisterView.module.css';

interface StatData {
  totalApprenants: number;
  totalCours: number;
  totalPays: number;
}

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useGoogleAuth();
  
  // Real-time stats
  const { data: stats, loading: statsLoading } = useFirestoreDocument<StatData>('statistiques', 'global');

  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Role State
  const [role, setRole] = useState<'learner' | 'instructor' | 'ambassador'>('learner');
  
  // Interests State
  const [interests, setInterests] = useState<Set<string>>(new Set());
  
  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validation
  const validateEmail = (email: string) => /^[^s@]+@[^s@]+.[^s@]+$/.test(email);
  
  const getPasswordScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordScore(password);

  const toggleInterest = (interest: string) => {
    const newInterests = new Set(interests);
    if (newInterests.has(interest)) {
      newInterests.delete(interest);
    } else {
      newInterests.add(interest);
    }
    setInterests(newInterests);
  };

  // Steps navigation
  const nextStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!firstName.trim() || !lastName.trim()) return setError('Veuillez entrer votre nom complet');
      if (!validateEmail(email)) return setError('Veuillez entrer un email valide');
      if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères');
      if (!termsAccepted) return setError('Vous devez accepter les conditions générales');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (interests.size < 3) return;
      setCurrentStep(4);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // OTP Countdown
  useEffect(() => {
    let timer: any;
    if (currentStep === 4 && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, countdown]);

  const handleResendOtp = () => {
    setCountdown(60);
    // Logic to resend OTP goes here
  };

  // Final Submission
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    
    setLoading(true);
    setError(null);

    // Simulate OTP Verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (code !== '123456') {
      setError('Code incorrect. Pour la démo, utilisez 123456.');
      setOtp(Array(6).fill(''));
      otpRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    try {
      // Firebase Registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await updateProfile(user, { displayName: fullName });
      
      await setDoc(doc(db, 'users', user.uid), {
        nom: fullName,
        email: user.email,
        role: role,
        interets: Array.from(interests),
        dateInscription: serverTimestamp()
      });

      setCurrentStep(5); // Success state
    } catch (err: unknown) {
      const normalized = normalizeFirebaseError(err);
      setError(normalized.message);
    } finally {
      setLoading(false);
    }
  };

  // Success Countdown
  const [redirectCount, setRedirectCount] = useState(5);
  useEffect(() => {
    let timer: any;
    if (currentStep === 5 && redirectCount > 0) {
      timer = setInterval(() => setRedirectCount(prev => prev - 1), 1000);
    } else if (currentStep === 5 && redirectCount === 0) {
      navigate('/dashboard');
    }
    return () => clearInterval(timer);
  }, [currentStep, redirectCount, navigate]);


  // Social Sign In
  const handleSocialSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Erreur lors de la connexion avec Google');
    }
  };

  const interestsList = [
    { id: 'business', icon: '💼', label: 'Business' },
    { id: 'marketing', icon: '📱', label: 'Marketing' },
    { id: 'tech', icon: '💻', label: 'Tech & Dev' },
    { id: 'finance', icon: '💰', label: 'Finance' },
    { id: 'agritech', icon: '🌱', label: 'AgriTech' },
    { id: 'design', icon: '🎨', label: 'Design' },
    { id: 'langues', icon: '🗣️', label: 'Langues' },
    { id: 'leadership', icon: '👑', label: 'Leadership' },
    { id: 'sante', icon: '⚕️', label: 'Santé' },
    { id: 'entrepreneuriat', icon: '🚀', label: 'Entrepreneuriat' },
    { id: 'mobile-money', icon: '📲', label: 'Mobile Money' },
    { id: 'couture', icon: '🧵', label: 'Couture & Mode' }
  ];

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className={styles.registerContainer}>
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
                Commencez votre <span className={styles.highlight}>aventure éducative</span> dès aujourd'hui
              </h1>
              <p className={styles.brandSubtitle}>
                Rejoignez plus de {statsLoading ? '...' : (stats?.totalApprenants || 50000).toLocaleString()} apprenants africains qui transforment leur vie grâce à NDARA.
              </p>
              
              <div className={styles.benefitsList}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>🎁</div>
                  <div className={styles.benefitContent}>
                    <div className={styles.benefitTitle}>Bonus de bienvenue 5 000 FCFA</div>
                    <div className={styles.benefitDesc}>Crédit offert sur votre wallet pour vos premiers cours</div>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>🎓</div>
                  <div className={styles.benefitContent}>
                    <div className={styles.benefitTitle}>7 jours d'essai Premium gratuit</div>
                    <div className={styles.benefitDesc}>Accès illimité à tous les cours Premium</div>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>📜</div>
                  <div className={styles.benefitContent}>
                    <div className={styles.benefitTitle}>Certificats reconnus</div>
                    <div className={styles.benefitDesc}>Valorisez votre parcours auprès de 500+ entreprises</div>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>🌍</div>
                  <div className={styles.benefitContent}>
                    <div className={styles.benefitTitle}>Communauté panafricaine</div>
                    <div className={styles.benefitDesc}>Réseautez avec 50 000+ apprenants du continent</div>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonial}>
                <p className={styles.testimonialText}>
                  NDARA a complètement changé ma carrière. En 6 mois, j'ai obtenu 3 certifications et décroché un poste de manager. La qualité des cours est exceptionnelle !
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>SK</div>
                  <div>
                    <div className={styles.testimonialName}>Sarah Koné</div>
                    <div className={styles.testimonialRole}>Marketing Manager • 🇨🇮 Abidjan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Right: Form */}
        <main className={styles.formSide}>
          {currentStep < 5 && (
            <div className={styles.formTop}>
              <div className={styles.formLogoMobile}>
                <img src="https://image.qwenlm.ai/public_source/3c808314-d5a7-40a3-bc2a-5cedc60a1b5c/129ac15f1-df23-4a15-bcd3-db2b6ca4e7e0.png" alt="" />
                <span>NDARA</span>
              </div>
              <div className={styles.topActions}>
                <button className={styles.langSwitch}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  FR
                </button>
                <Link to="/login" className={styles.loginLink}>Connexion</Link>
              </div>
            </div>
          )}
          
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              
              {/* Stepper */}
              {currentStep < 5 && (
                <div className={styles.stepper}>
                  <div className={styles.stepperProgress}>
                    <div 
                      className={styles.stepperProgressFill} 
                      style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    ></div>
                    {[1, 2, 3, 4].map(step => (
                      <div 
                        key={step} 
                        className={`${styles.stepperStep} ${currentStep === step ? styles.active : ''} ${currentStep > step ? styles.completed : ''}`}
                      >
                        <div className={styles.stepperCircle}>
                          {currentStep > step ? null : <span className={styles.stepperNumber}>{step}</span>}
                        </div>
                        <div className={styles.stepperLabel}>
                          {step === 1 ? 'Compte' : step === 2 ? 'Rôle' : step === 3 ? 'Intérêts' : 'Vérification'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alert Error */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className={`${styles.alert} ${styles.alertError}`}
                  >
                    <AlertCircle className={styles.alertIcon} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <motion.div 
                    key="step1"
                    variants={variants} initial="hidden" animate="visible" exit="exit"
                    className={styles.stepPanel}
                  >
                    <div className={styles.formHeader}>
                      <div className={styles.formIcon}>✨</div>
                      <h1 className={styles.formTitle}>Créez votre compte</h1>
                      <p className={styles.formSubtitle}>Rejoignez la communauté NDARA en 2 minutes</p>
                    </div>
                    
                    <div className={styles.socialLogin}>
                      <button className={styles.socialBtn} onClick={handleSocialSignIn} aria-label="S'inscrire avec Google">
                        <svg viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </button>
                      <button className={styles.socialBtn} aria-label="S'inscrire avec Facebook">
                        <svg viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      <button className={styles.socialBtn} aria-label="S'inscrire avec Apple">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className={styles.divider}>ou avec votre email</div>
                    
                    <div className={styles.authForm}>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="firstName">Prénom</label>
                          <div className={styles.inputWrap}>
                            <User className={styles.inputIcon} />
                            <input 
                              type="text" 
                              id="firstName" 
                              className={styles.formInput} 
                              placeholder="Amina" 
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="lastName">Nom</label>
                          <div className={styles.inputWrap}>
                            <User className={styles.inputIcon} />
                            <input 
                              type="text" 
                              id="lastName" 
                              className={styles.formInput} 
                              placeholder="Koné" 
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="email">Email</label>
                        <div className={styles.inputWrap}>
                          <Mail className={styles.inputIcon} />
                          <input 
                            type="email" 
                            id="email" 
                            className={`${styles.formInput} ${email && !validateEmail(email) ? styles.error : ''} ${email && validateEmail(email) ? styles.success : ''}`} 
                            placeholder="amina@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="password">Mot de passe</label>
                        <div className={styles.inputWrap}>
                          <Lock className={styles.inputIcon} />
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            id="password" 
                            className={styles.formInput} 
                            placeholder="Minimum 8 caractères" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button 
                            type="button" 
                            className={styles.inputToggle} 
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        
                        {password.length > 0 && (
                          <>
                            <div className={styles.passwordStrength}>
                              {[1, 2, 3, 4].map(level => (
                                <div key={level} className={`${styles.strengthBar} ${passScore >= level ? (passScore <= 1 ? styles.weak : passScore <= 2 ? styles.medium : styles.strong) : ''}`}></div>
                              ))}
                            </div>
                            <div className={`${styles.strengthText} ${passScore <= 1 ? styles.weak : passScore <= 2 ? styles.medium : styles.strong}`}>
                              {passScore <= 1 ? '🔴 Faible' : passScore <= 2 ? '🟠 Moyen' : passScore === 3 ? '🟡 Bon' : '🟢 Excellent'}
                            </div>
                            <div className={styles.passwordRules}>
                              <div className={`${styles.passwordRule} ${password.length >= 8 ? styles.valid : ''}`}>
                                <CheckCircle2 size={12} /> <span>8+ caractères</span>
                              </div>
                              <div className={`${styles.passwordRule} ${/[A-Z]/.test(password) ? styles.valid : ''}`}>
                                <CheckCircle2 size={12} /> <span>1 majuscule</span>
                              </div>
                              <div className={`${styles.passwordRule} ${/[0-9]/.test(password) ? styles.valid : ''}`}>
                                <CheckCircle2 size={12} /> <span>1 chiffre</span>
                              </div>
                              <div className={`${styles.passwordRule} ${/[^A-Za-z0-9]/.test(password) ? styles.valid : ''}`}>
                                <CheckCircle2 size={12} /> <span>1 spécial (!@#)</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className={`${styles.checkboxWrap} ${termsAccepted ? styles.active : ''}`} onClick={() => setTermsAccepted(!termsAccepted)}>
                        <div className={styles.checkbox}></div>
                        <span>
                          J'accepte les <Link to="/legal">Conditions Générales</Link> et la <Link to="/privacy">Politique de Confidentialité</Link> de NDARA
                        </span>
                      </div>
                      
                      <button onClick={nextStep} className={`${styles.btn} ${styles.btnPrimary}`}>
                        <span className={styles.btnText}>Continuer</span>
                        <ArrowRight size={18} />
                      </button>
                      
                      <div className={styles.securityBadge}>
                        <Shield size={12} />
                        Données chiffrées • Conforme RGPD • 2FA disponible
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    variants={variants} initial="hidden" animate="visible" exit="exit"
                    className={styles.stepPanel}
                  >
                    <div className={styles.formHeader}>
                      <div className={styles.formIcon}>🎯</div>
                      <h1 className={styles.formTitle}>Quel est votre objectif ?</h1>
                      <p className={styles.formSubtitle}>Choisissez le rôle qui vous correspond le mieux</p>
                    </div>
                    
                    <div className={styles.roleGrid}>
                      <div className={`${styles.roleCard} ${role === 'learner' ? styles.selected : ''}`} onClick={() => setRole('learner')}>
                        <div className={styles.roleHeader}>
                          <div className={`${styles.roleIcon} ${styles.learner}`}>🎓</div>
                          <div>
                            <div className={styles.roleTitle}>Apprenant <span className={styles.roleBadge}>Populaire</span></div>
                          </div>
                        </div>
                        <div className={styles.roleDesc}>Je veux apprendre de nouvelles compétences et obtenir des certifications reconnues.</div>
                        <div className={styles.rolePerks}>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> +1 200 cours</span>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> Certificats</span>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> Mode hors-ligne</span>
                        </div>
                      </div>
                      
                      <div className={`${styles.roleCard} ${role === 'instructor' ? styles.selected : ''}`} onClick={() => setRole('instructor')}>
                        <div className={styles.roleHeader}>
                          <div className={`${styles.roleIcon} ${styles.instructor}`}>👨‍🏫</div>
                          <div>
                            <div className={styles.roleTitle}>Instructeur</div>
                          </div>
                        </div>
                        <div className={styles.roleDesc}>Je veux partager mon expertise et générer des revenus en créant des cours.</div>
                        <div className={styles.rolePerks}>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> 70% royalties</span>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> Dashboard pro</span>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> Analytics</span>
                        </div>
                      </div>
                      
                      <div className={`${styles.roleCard} ${role === 'ambassador' ? styles.selected : ''}`} onClick={() => setRole('ambassador')}>
                        <div className={styles.roleHeader}>
                          <div className={`${styles.roleIcon} ${styles.ambassador}`}>🤝</div>
                          <div>
                            <div className={styles.roleTitle}>Ambassadeur</div>
                          </div>
                        </div>
                        <div className={styles.roleDesc}>Je veux recommander NDARA et gagner des commissions sur les abonnements.</div>
                        <div className={styles.rolePerks}>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> 20% commissions</span>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> Wallet dédié</span>
                          <span className={styles.rolePerk}><CheckCircle2 size={12}/> Leaderboard</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formNav}>
                      <button onClick={prevStep} className={`${styles.btn} ${styles.btnGhost}`}>
                        <ChevronLeft size={18} /> Retour
                      </button>
                      <button onClick={nextStep} className={`${styles.btn} ${styles.btnPrimary}`}>
                        <span className={styles.btnText}>Continuer</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    variants={variants} initial="hidden" animate="visible" exit="exit"
                    className={styles.stepPanel}
                  >
                    <div className={styles.formHeader}>
                      <div className={styles.formIcon}>💡</div>
                      <h1 className={styles.formTitle}>Qu'est-ce qui vous intéresse ?</h1>
                      <p className={styles.formSubtitle}>Sélectionnez au moins 3 thèmes pour personnaliser votre expérience</p>
                    </div>
                    
                    <div className={styles.interestsGrid}>
                      {interestsList.map(item => (
                        <button 
                          key={item.id}
                          className={`${styles.interestChip} ${interests.has(item.id) ? styles.selected : ''}`}
                          onClick={() => toggleInterest(item.id)}
                        >
                          <span className={styles.interestIcon}>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className={styles.interestsCounter}>
                      <strong>{interests.size}</strong> / 3 minimum sélectionnés
                    </div>
                    
                    <div className={styles.formNav}>
                      <button onClick={prevStep} className={`${styles.btn} ${styles.btnGhost}`}>
                        <ChevronLeft size={18} /> Retour
                      </button>
                      <button onClick={nextStep} disabled={interests.size < 3} className={`${styles.btn} ${styles.btnPrimary}`}>
                        <span className={styles.btnText}>Continuer</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <motion.div 
                    key="step4"
                    variants={variants} initial="hidden" animate="visible" exit="exit"
                    className={styles.stepPanel}
                  >
                    <div className={styles.formHeader}>
                      <div className={styles.formIcon}>📧</div>
                      <h1 className={styles.formTitle}>Vérifiez votre email</h1>
                      <p className={styles.formSubtitle}>
                        Un code à 6 chiffres a été envoyé à<br/>
                        <strong style={{ color: 'var(--accent-gold)' }}>{email.substring(0,2)}***@{email.split('@')[1]}</strong>
                      </p>
                    </div>
                    
                    <div className={styles.otpContainer}>
                      {otp.map((digit, index) => (
                        <input 
                          key={index}
                          ref={el => otpRefs.current[index] = el}
                          type="text" 
                          className={`${styles.otpInput} ${digit ? styles.filled : ''}`}
                          maxLength={1}
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                        />
                      ))}
                    </div>
                    
                    <div className={styles.otpResend}>
                      <span>Vous n'avez pas reçu le code ? </span>
                      <button onClick={handleResendOtp} disabled={countdown > 0}>
                        {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                      </button>
                    </div>
                    
                    <div className={`${styles.alert} ${styles.alertInfo}`} style={{ marginTop: 'var(--space-md)' }}>
                      <Info className={styles.alertIcon} />
                      <span><strong>Démo :</strong> Utilisez le code <strong style={{ color: 'var(--accent-gold)' }}>123456</strong></span>
                    </div>
                    
                    <div className={styles.formNav}>
                      <button onClick={prevStep} disabled={loading} className={`${styles.btn} ${styles.btnGhost}`}>
                        <ChevronLeft size={18} /> Retour
                      </button>
                      <button 
                        onClick={handleVerifyOtp} 
                        disabled={otp.join('').length !== 6 || loading} 
                        className={`${styles.btn} ${styles.btnPrimary} ${loading ? styles.loading : ''}`}
                      >
                        <span className={styles.btnText}>Vérifier</span>
                        {loading && <div className={styles.btnSpinner}></div>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SUCCESS */}
                {currentStep === 5 && (
                  <motion.div 
                    key="step5"
                    variants={variants} initial="hidden" animate="visible" exit="exit"
                    className={styles.successState}
                  >
                    <div className={styles.successIconWrap}>
                      <div className={styles.successRing}></div>
                      <div className={styles.successIcon}>✓</div>
                    </div>
                    <h2 className={styles.successTitle}>Bienvenue sur NDARA ! 🎉</h2>
                    <p className={styles.successMessage}>
                      Votre compte a été créé avec succès.<br/>
                      Vos avantages ont été activés !
                    </p>
                    
                    <div className={styles.successPerks}>
                      <div className={styles.successPerk}>
                        <div className={styles.successPerkIcon}>💰</div>
                        <span>5 000 FCFA crédités</span>
                      </div>
                      <div className={styles.successPerk}>
                        <div className={styles.successPerkIcon}>🎓</div>
                        <span>7 jours Premium</span>
                      </div>
                      <div className={styles.successPerk}>
                        <div className={styles.successPerkIcon}>🏅</div>
                        <span>Badge "Nouveau"</span>
                      </div>
                      <div className={styles.successPerk}>
                        <div className={styles.successPerkIcon}>🎁</div>
                        <span>Cours gratuit offert</span>
                      </div>
                    </div>
                    
                    <button onClick={() => navigate('/dashboard')} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }}>
                      <span className={styles.btnText}>Accéder à mon dashboard</span>
                      <ArrowRight size={18} />
                    </button>
                    
                    <div className={styles.countdown}>
                      Redirection automatique dans <strong>{redirectCount}</strong>s
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {currentStep < 5 && (
                <div className={styles.formFooter}>
                  <div className={styles.formFooterLinks}>
                    <Link to="#">Centre d'aide</Link>
                    <Link to="#">Support</Link>
                    <Link to="#">Confidentialité</Link>
                  </div>
                  <p style={{ marginTop: 'var(--space-sm)' }}>
                    © 2027 NDARA Afrique • Made with ❤️ in Africa
                  </p>
                </div>
              )}
              
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
};
