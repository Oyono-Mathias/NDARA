import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getFirestore, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  ArrowLeft, 
  Lock, 
  Loader2, 
  Smartphone, 
  ShieldCheck, 
  GraduationCap, 
  Check, 
  Zap, 
  Wallet,
  X,
  PhoneCall,
  XCircle,
  RefreshCw,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export function CheckoutView() {
  const params = useParams();
  const slug = params.slug as string;
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingUssd, setIsAwaitingUssd] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { currentUser: ctxUser, role } = useRole();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string; title: string }>({
    isOpen: false,
    message: '',
    title: 'Échec de la commande'
  });

  const [countryData, setCountryData] = useState<any | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('wallet');
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  
  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    if (ctxUser) {
        setCurrentUser(ctxUser);
        setIsLoadingCountry(false);
    } else {
        setCurrentUser({ balance: 0, countryCode: 'SN', certifiedMobileNumbers: { 'SN_ORANGE': '+221770000000' } });
        setIsLoadingCountry(false);
    }

    if (slug) {
        const q = query(collection(db, 'courses'), where('slug', '==', slug), where('status', '==', 'Published'));
        const unsubscribe = onSnapshot(q, (snap) => {
            if (!snap.empty) {
                setCourse({ id: snap.docs[0].id, ...snap.docs[0].data() });
            } else {
                setCourse({ id: slug, title: 'Formation ' + slug, price: 25000 });
            }
            setCourseLoading(false);
        }, (e) => {
            console.error("Error fetching course", e);
            setCourseLoading(false);
        });
        return () => unsubscribe();
    }
  }, [slug, ctxUser]);

  useEffect(() => {
      // Local payment methods configuration
      setCountryData({
          currency: 'XAF',
          flagEmoji: '🇨🇲',
          paymentMethods: [
              { id: 'orange', provider: 'mesomb', name: 'Orange Money', active: true, logo: 'OM' },
              { id: 'mtn', provider: 'mesomb', name: 'MTN MoMo', active: true, logo: 'MTN' }
          ]
      });
  }, []);

  const activeMethod = useMemo(() => 
    selectedMethodId === 'wallet' ? { provider: 'wallet', name: 'Solde Ndara' } :
    selectedMethodId === 'virtual' ? { provider: 'virtual', name: 'Crédit Virtuel' } :
    countryData?.paymentMethods.find((m: any) => m.id === selectedMethodId),
  [countryData, selectedMethodId]);

  const certifiedNumber = useMemo(() => {
    if (!currentUser || !currentUser.countryCode || !activeMethod || activeMethod.provider !== 'mesomb') return null;
    
    const opKey = activeMethod.name.toLowerCase().includes('mtn') ? 'MTN' : 
                  activeMethod.name.toLowerCase().includes('orange') ? 'ORANGE' : 
                  activeMethod.name.toLowerCase().includes('wave') ? 'WAVE' : 
                  activeMethod.name.toLowerCase().includes('mpesa') ? 'MPESA' : 'DEFAULT';

    return currentUser.certifiedMobileNumbers?.[`${currentUser.countryCode}_${opKey}`] || null;
  }, [currentUser, activeMethod]);

  const ussdInstruction = useMemo(() => {
    if (!activeMethod || activeMethod.provider !== 'mesomb') return "Veuillez valider le paiement sur votre téléphone";
    const op = activeMethod.name.toUpperCase();
    if (op.includes('MTN')) return "Composez *126# puis validez le paiement sur votre téléphone";
    if (op.includes('ORANGE')) return "Composez #150*50# puis validez le paiement";
    return "Veuillez valider le paiement sur votre téléphone";
  }, [activeMethod]);

  const handlePayment = async () => {
    if (!course || !activeMethod) return;

    if (activeMethod.provider === 'wallet') {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/wallet/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: currentUser.uid,
                    price: course.price || 0,
                    courseId: course.id,
                    courseTitle: course.title,
                    sellerId: course.instructorId || 'admin'
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Enregistrer formellement l'enrollment côté client (ou le backend devrait le faire)
                const { setDoc, doc, collection } = await import("firebase/firestore");
                await setDoc(doc(collection(db, 'enrollments')), {
                    studentId: currentUser.uid,
                    courseId: course.id,
                    enrolledAt: new Date(),
                    progress: 0,
                    instructorId: course.instructorId || 'admin'
                });
                setIsSuccess(true);
            } else {
                setErrorModal({ isOpen: true, title: 'Erreur', message: data.error || "Erreur lors de l'achat" });
            }
        } catch(e: any) {
             setErrorModal({ isOpen: true, title: 'Erreur Réseau', message: e.message || 'Impossible de joindre le serveur' });
        } finally {
             setIsProcessing(false);
        }

    } else if (activeMethod.provider === 'mesomb') {
        if (!certifiedNumber) {
            alert(`Veuillez enregistrer votre numéro ${activeMethod.name} dans votre profil.`);
            return;
        }

        setIsAwaitingUssd(true);
        setIsProcessing(true);
        
        setTimeout(async () => {
            const { setDoc, doc, collection } = await import("firebase/firestore");
            await setDoc(doc(collection(db, 'enrollments')), {
                studentId: currentUser.uid,
                courseId: course.id,
                enrolledAt: new Date(),
                progress: 0,
                instructorId: course.instructorId || 'admin'
            });

            setIsAwaitingUssd(false);
            setIsProcessing(false);
            setIsSuccess(true);
        }, 3000);
    } else if (selectedMethodId === 'virtual') {
        setIsProcessing(true);
        const { setDoc, doc, collection } = await import("firebase/firestore");
        await setDoc(doc(collection(db, 'enrollments')), {
            studentId: currentUser.uid,
            courseId: course.id,
            enrolledAt: new Date(),
            progress: 0,
            instructorId: course.instructorId || 'admin'
        });
        setIsProcessing(false);
        setIsSuccess(true);
    }
  };

  if (courseLoading || isLoadingCountry) return <div className="p-8 pt-24 bg-slate-950 min-h-screen"><div className="h-64 w-full rounded-[2.5rem] bg-slate-900 animate-pulse" /></div>;

  const currencySymbol = countryData?.currency || 'XOF';

  return (
    <div className="flex flex-col gap-0 pb-40 min-h-screen relative overflow-hidden bg-slate-950 -mt-32 max-w-md mx-auto z-10 w-full pt-20">
      
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-white/5 safe-area-pt">
        <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 transition active:scale-90"><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="font-black text-xl text-white uppercase tracking-tight">Finaliser l'achat</h1>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{countryData?.flagEmoji || '🌍'}</div>
        </div>
      </header>

      <main className="pt-6 px-6 space-y-8 animate-in fade-in duration-700">
        <div className="bg-[#FEF3C7] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><GraduationCap size={80} className="text-[#D97706]" /></div>
            <div className="flex justify-between items-center border-b-2 border-dashed border-[#D97706]/20 pb-4 mb-4">
                <h2 className="font-black text-[#D97706] text-sm uppercase truncate pr-4">{course?.title}</h2>
            </div>
            <div className="flex justify-between items-end">
                <span className="text-[#D97706]/60 text-[10px] font-black uppercase tracking-widest">Total à payer</span>
                <span className="font-mono font-black text-[#D97706] text-3xl">{(course?.price || 0).toLocaleString()} {currencySymbol}</span>
            </div>
        </div>

        <section className="space-y-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] ml-1">MOYEN DE PAIEMENT</h3>
            <div className="grid grid-cols-4 gap-2">
                <button onClick={() => setSelectedMethodId('wallet')} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 ${selectedMethodId === 'wallet' ? "border-primary bg-primary/10" : "border-white/5 bg-slate-900 opacity-40"}`}><Wallet className="h-5 w-5 text-primary mb-1"/><span className="text-[8px] font-black uppercase text-white">Wallet</span></button>
                {countryData?.paymentMethods.filter((m: any) => m.active).map((m: any) => (
                    <button key={m.id} onClick={() => setSelectedMethodId(m.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 ${selectedMethodId === m.id ? "border-primary bg-primary/10" : "border-white/5 bg-slate-900 opacity-40"}`}>
                        <div className="h-6 mb-1 font-black text-xs flex items-center justify-center text-white">{m.logo}</div>
                        <span className="text-[8px] font-black uppercase text-white truncate w-full text-center">{m.name}</span>
                    </button>
                ))}
                <button onClick={() => setSelectedMethodId('virtual')} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 ${selectedMethodId === 'virtual' ? "border-primary bg-primary/10" : "border-white/5 bg-slate-900 opacity-40"}`}><Zap className="h-5 w-5 text-primary mb-1"/><span className="text-[8px] font-black uppercase text-white">Virtuel</span></button>
            </div>
        </section>

        <section className="space-y-6">
            {selectedMethodId === 'wallet' ? (
                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl text-center shadow-inner relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Votre solde Ndara</p>
                    <p className="text-2xl font-black text-primary">{(currentUser?.balance || 0).toLocaleString()} {currencySymbol}</p>
                </div>
            ) : (selectedMethodId !== 'virtual') && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Compte de débit certifié</label>
                    
                    {certifiedNumber ? (
                        <div className="p-4 bg-[#10b981]/5 border border-[#10b981]/20 rounded-3xl flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="font-mono text-lg font-black text-white tracking-widest">{certifiedNumber}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <ShieldCheck size={12} className="text-[#10b981]" />
                                        <span className="text-[8px] font-black text-[#10b981] uppercase tracking-widest">{activeMethod?.name} Certifié</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg text-slate-700">
                                <Lock size={16} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl flex flex-col items-center text-center space-y-4">
                            <ShieldAlert className="h-10 w-10 text-red-500" />
                            <div className="space-y-1">
                                <p className="text-white font-bold text-sm uppercase">Numéro {activeMethod?.name} non certifié</p>
                                <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">
                                    Vous devez enregistrer votre numéro {activeMethod?.name} dans votre profil pour acheter cette formation.
                                </p>
                            </div>
                            <Link to="/student/account" className="flex items-center h-11 px-4 rounded-xl bg-slate-900 border border-white/5 text-xs font-black uppercase text-white tracking-widest">
                                Certifier ce numéro <ExternalLink size={12} className="ml-2" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </section>

        <button 
            onClick={handlePayment} 
            disabled={isProcessing || isSuccess || !certifiedNumber && selectedMethodId !== 'wallet' && selectedMethodId !== 'virtual' || (selectedMethodId === 'wallet' && (currentUser?.balance || 0) < (course?.price || 0))} 
            className="w-full flex items-center justify-center h-16 rounded-[2rem] bg-primary text-slate-950 font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-50"
        >
            {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Lock className="h-4 w-4 mr-2" />}
            <span>CONFIRMER LE PAIEMENT</span>
        </button>
      </main>

      {/* 🔥 MODAL USSD */}
      {isAwaitingUssd && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAwaitingUssd(false)} />
             <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in slide-up-modal pb-8">
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
                  <div className="p-8 pb-10 flex flex-col items-center text-center space-y-8">
                      <div className="w-full flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ndara Secure</span>
                          </div>
                      </div>
                      <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                          <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-primary/30 flex items-center justify-center relative z-10 shadow-2xl">
                              <Loader2 className="h-14 w-14 animate-spin text-primary opacity-20 absolute" />
                              <PhoneCall className="h-8 w-8 text-primary animate-bounce" />
                          </div>
                      </div>
                      <div className="space-y-3">
                          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Validation USSD</h2>
                          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                              <p className="text-primary text-sm font-bold leading-relaxed italic">
                                  "{ussdInstruction}"
                              </p>
                          </div>
                      </div>
                      <div className="w-full pt-4">
                          <button 
                              onClick={() => setIsAwaitingUssd(false)} 
                              className="w-full flex items-center justify-center h-14 rounded-2xl text-slate-500 bg-transparent font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all"
                          >
                              <X className="mr-2 h-4 w-4" /> Annuler l'achat
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ❌ MODAL D'ERREUR FINTECH */}
      {errorModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))} />
             <div className="relative bg-[#0f172a] border border-white/5 rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in slide-up-modal pb-4">
                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-2xl">
                        <XCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{errorModal.title}</h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{errorModal.message}"</p>
                    </div>
                </div>
                <div className="p-8 pt-0 flex flex-col gap-3">
                    <button 
                        onClick={() => { setErrorModal(prev => ({ ...prev, isOpen: false })); handlePayment(); }}
                        className="w-full flex items-center justify-center h-16 rounded-2xl bg-white text-slate-950 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
                    </button>
                    <button 
                        onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                        className="w-full flex items-center justify-center h-12 rounded-xl text-slate-500 bg-transparent font-bold uppercase text-[10px] tracking-widest hover:text-white"
                    >
                        Fermer
                    </button>
                </div>
            </div>
          </div>
      )}

      {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-center space-y-8 max-w-sm shadow-2xl border border-primary/20 w-full">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce shadow-primary/40">
                      <Check className="h-14 w-14 text-slate-950" strokeWidth={4} />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">C'est validé !</h3>
                  <button onClick={() => navigate(`/student/courses/${course?.id}`)} className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black uppercase text-xs tracking-widest shadow-xl">
                      Accéder à mes leçons
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}
