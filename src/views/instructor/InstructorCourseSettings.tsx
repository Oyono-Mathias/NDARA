import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "../../hooks/use-toast";
import { useRole } from "../../context/RoleContext";
import { Course } from "../../types/models";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { CouponFormModal } from "../../components/instructor/coupons/CouponFormModal";

export function InstructorCourseSettings() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useRole();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Realtime coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Form states
  const [isFree, setIsFree] = useState(false);
  const [basePrice, setBasePrice] = useState(15000);
  const [promoPrice, setPromoPrice] = useState<number | ''>('');
  const [promoStart, setPromoStart] = useState("");
  const [promoEnd, setPromoEnd] = useState("");
  const [salesProjection, setSalesProjection] = useState(100);

  // Access rules
  const [dripEnabled, setDripEnabled] = useState(false);
  const [dripInterval, setDripInterval] = useState(7);
  const [videoPercent, setVideoPercent] = useState(80);
  const [quizScore, setQuizScore] = useState(60);

  // Certificate
  const [certificateEnabled, setCertificateEnabled] = useState(true);
  const [certName, setCertName] = useState("");

  // Languages
  const [courseLanguage, setCourseLanguage] = useState("fr");

  useEffect(() => {
    if (!courseId) return;
    const unsub = onSnapshot(doc(db, "courses", courseId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Course;
        setCourse({ ...data, id: snap.id });
        
        // Initialize form
        setIsFree(data.isFree ?? false);
        setBasePrice(data.price || 500);
        setPromoPrice(data.promoPrice || '');
        setPromoStart(data.promoStart ? new Date(data.promoStart).toISOString().split('T')[0] : "");
        setPromoEnd(data.promoEnd ? new Date(data.promoEnd).toISOString().split('T')[0] : "");
        
        setDripEnabled(data.dripEnabled ?? false);
        setDripInterval(data.dripIntervalDays || 7);
        setVideoPercent(data.completionVideoPercent || 80);
        setQuizScore(data.completionQuizScore || 60);
        
        setCertificateEnabled(data.certificateEnabled ?? true);
        setCertName(data.certificateName || `Certificat - ${data.title}`);
        
        setCourseLanguage(data.language || "fr");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [courseId]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    // Get coupons specifically for this course (or global)
    const q = query(
      collection(db, "course_coupons"),
      where("instructorId", "==", currentUser.uid)
    );
    const unsubCoupons = onSnapshot(q, (snap) => {
      const cps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter those that apply to this course
      const courseCps = cps.filter((c: any) => !c.courses || c.courses.length === 0 || c.courses.includes(courseId));
      setCoupons(courseCps);
    });
    return () => unsubCoupons();
  }, [currentUser?.uid, courseId]);

  const handleSave = async (field: string, value: any) => {
    if (!courseId || !currentUser) return;
    try {
      await updateDoc(doc(db, "courses", courseId), {
        [field]: value
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: 'Vérifiez votre connexion' });
    }
  };
  
  const handleSaveMultiple = async (updates: Record<string, any>) => {
      if (!courseId || !currentUser) return;
      try {
        await updateDoc(doc(db, "courses", courseId), updates);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: 'Vérifiez votre connexion' });
      }
  };

  const netPrice = Math.round((basePrice || 0) * 0.7);
  const hasPromoWarning = typeof promoPrice === 'number' && promoPrice >= basePrice;
  const isPromoValid = typeof promoPrice === 'number' && promoPrice > 0 && promoPrice < basePrice;

  // Projection calc
  const totalRevenue = (isPromoValid ? promoPrice : basePrice) * salesProjection;
  const commission = Math.round(totalRevenue * 0.3);
  const netRevenue = totalRevenue - commission;

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Supprimer ce coupon ?")) return;
    try {
      await deleteDoc(doc(db, "course_coupons", id));
      toast({ description: "Coupon supprimé." });
    } catch (e) {
      toast({ variant: 'destructive', description: "Erreur lors de la suppression." });
    }
  };

  const handleContinue = () => {
    if (basePrice < 500 && !isFree) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le prix minimum est de 500 FCFA' });
      return;
    }
    navigate(`/instructor/courses/${courseId}/finalisation`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="pb-24 font-sans bg-[#06080F] min-h-screen text-[#F8FAFC]">
      {/* Top Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-[#06080F]/95 backdrop-blur-xl border-b border-[#30363D]/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/instructor/courses/${courseId}/media`)} className="p-2 rounded-lg hover:bg-[#161B22] transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-xs">N</div>
                <span className="text-sm font-bold text-white">NDARA</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg font-semibold">Étape 4/5</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-8">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-white">PARAMÈTRES DU COURS</h1>
          <p className="text-sm text-gray-400 mt-1">Configurez le prix, l'accès et les options avancées</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {/* Infos */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white border-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Infos</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          
          {/* Programme */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white border-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Programme</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          
          {/* Médias */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white border-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Médias</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          
          {/* Paramètres (Active) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white border-blue-500 shadow-[0_0_0_8px_rgba(59,130,246,0.2)] flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
            <span className="text-xs font-semibold text-blue-400 hidden sm:inline">Paramètres</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
          
          {/* Finalisation */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-transparent border border-[#30363D] text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Publier</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pricing Toggle */}
            <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Monétisation</h3>
                  <p className="text-xs text-gray-400 mt-1">Définissez le prix et les règles d'accès</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm text-gray-400">{isFree ? 'Gratuit' : 'Payant'}</span>
                  <input type="checkbox" className="hidden" checked={!isFree} onChange={(e) => {
                    const newIsFree = !e.target.checked;
                    setIsFree(newIsFree);
                    handleSave('isFree', newIsFree);
                    if (newIsFree) {
                      setBasePrice(0);
                      handleSave('price', 0);
                    }
                  }} />
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${!isFree ? 'bg-emerald-500' : 'bg-[#30363D]'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform shadow ${!isFree ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>

              {!isFree ? (
                <div className="space-y-4">
                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">PRIX DE BASE (XAF) <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type="number" placeholder="0" min="500" step="500" value={basePrice}
                            onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)}
                            onBlur={(e) => handleSave('price', parseInt(e.target.value) || 0)}
                            className={`w-full bg-[#0D1117] border ${basePrice > 0 && basePrice < 500 ? 'border-red-500' : 'border-[#30363D]'} text-[#F8FAFC] px-4 py-3 pr-16 rounded-xl text-lg font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all`} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">FCFA</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Minimum : 500 FCFA</p>
                  </div>

                  {/* Promo Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">PRIX PROMOTIONNEL (Optionnel)</label>
                    <div className="relative">
                      <input type="number" placeholder="Ex: 10000" min="0" step="500" value={promoPrice}
                            onChange={(e) => setPromoPrice(e.target.value === '' ? '' : parseInt(e.target.value))}
                            onBlur={(e) => handleSave('promoPrice', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="w-full bg-[#0D1117] border border-[#30363D] text-[#F8FAFC] px-4 py-3 pr-16 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">FCFA</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Le prix original sera barré sur la marketplace</p>
                    {hasPromoWarning && (
                      <div className="mt-2 p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400">⚠️ Le prix promo doit être inférieur au prix de base</p>
                      </div>
                    )}
                  </div>

                  {/* Promo Dates */}
                  {isPromoValid && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Début de la promo</label>
                        <input type="date" value={promoStart}
                               onChange={(e) => { setPromoStart(e.target.value); handleSave('promoStart', e.target.value); }}
                               className="w-full bg-[#0D1117] border border-[#30363D] text-[#F8FAFC] px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Fin de la promo</label>
                        <input type="date" value={promoEnd}
                               onChange={(e) => { setPromoEnd(e.target.value); handleSave('promoEnd', e.target.value); }}
                               className="w-full bg-[#0D1117] border border-[#30363D] text-[#F8FAFC] px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎁</span>
                    <div>
                      <p className="text-sm text-emerald-400 font-medium">Mode Gratuit activé</p>
                      <p className="text-xs text-gray-400 mt-1">Ce cours sera accessible gratuitement à tous les étudiants. Vous gagnerez des revenus via la Bourse du Savoir si des investisseurs achètent des parts.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Calculator */}
            {!isFree && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
                <h3 className="text-base font-bold text-white mb-4">📈 Calculateur de revenus</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-[#0D1117] rounded-xl border border-[#30363D]/50">
                    <p className="text-2xl font-black text-white">{(isPromoValid ? promoPrice : basePrice).toLocaleString('fr-FR')} F</p>
                    <p className="text-xs text-gray-500 mt-1">Prix de vente</p>
                  </div>
                  <div className="text-center p-3 bg-[#0D1117] rounded-xl border border-[#30363D]/50">
                    <p className="text-2xl font-black text-gray-400">30%</p>
                    <p className="text-xs text-gray-500 mt-1">Commission NDARA</p>
                  </div>
                  <div className="text-center p-3 bg-[#0D1117] rounded-xl col-span-2 sm:col-span-1 border border-[#30363D]/50">
                    <p className="text-2xl font-black text-emerald-400">{Math.round((isPromoValid ? promoPrice : basePrice) * 0.7).toLocaleString('fr-FR')} F</p>
                    <p className="text-xs text-gray-500 mt-1">Votre part nette</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-2">Projection de ventes</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="10" max="1000" value={salesProjection} step="10" 
                           onChange={(e) => setSalesProjection(parseInt(e.target.value))}
                           className="flex-1 h-1.5 bg-[#30363D] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                    <span className="text-sm font-bold text-white w-16 text-right">{salesProjection} ventes</span>
                  </div>
                </div>

                <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D]/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Revenus estimés</span>
                    <span className="text-lg font-bold text-emerald-400">{netRevenue.toLocaleString('fr-FR')} F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Commission NDARA</span>
                    <span className="text-sm text-gray-500">{commission.toLocaleString('fr-FR')} F</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#30363D]">
                    <span className="text-xs text-gray-300 font-medium">Chiffre d'affaires total</span>
                    <span className="text-sm font-bold text-white">{totalRevenue.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              </div>
            )}

            {/* Access Rules */}
            <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">🔐 Règles d'accès</h3>
              
              <div className="space-y-4">
                {/* Drip Content */}
                <div className="p-4 bg-[#111827] rounded-xl border border-[#30363D]/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Contenu progressif (Drip)</p>
                      <p className="text-xs text-gray-500">Débloquez les chapitres progressivement <br/><span className="text-[10px] text-blue-400 italic">INTERFACE PRÉSENTE — BACKEND NON EXISTANT</span></p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="hidden" checked={dripEnabled} onChange={(e) => {
                        setDripEnabled(e.target.checked);
                        handleSave('dripEnabled', e.target.checked);
                      }} />
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${dripEnabled ? 'bg-emerald-500' : 'bg-[#30363D]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${dripEnabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  {dripEnabled && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-gray-400">Débloquer tous les</span>
                        <select value={dripInterval} onChange={(e) => {
                          setDripInterval(parseInt(e.target.value));
                          handleSave('dripIntervalDays', parseInt(e.target.value));
                        }} className="bg-[#0D1117] border border-[#30363D] text-white px-3 py-2 rounded-lg text-sm w-32 outline-none focus:border-blue-500">
                          <option value="1">1 jour</option>
                          <option value="3">3 jours</option>
                          <option value="7">7 jours</option>
                          <option value="14">14 jours</option>
                          <option value="30">30 jours</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                          <span className="text-xs text-gray-400 w-16">Jour 0</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-white">Chapitre 1</span>
                          <span className="text-[10px] text-emerald-400 ml-auto">Disponible</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                          <span className="text-xs text-gray-400 w-16">Jour {dripInterval}</span>
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs text-gray-400">Chapitre 2</span>
                          <span className="text-[10px] text-blue-400 ml-auto">Verrouillé</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Requirements */}
                <div className="p-4 bg-[#111827] rounded-xl border border-[#30363D]/50">
                  <p className="text-sm font-semibold text-white mb-3">Exigences de complétion <br/><span className="text-[10px] text-blue-400 italic">INTERFACE PRÉSENTE — BACKEND NON EXISTANT</span></p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">% de vidéos à regarder</span>
                        <span className="text-sm font-bold text-white">{videoPercent}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={videoPercent} 
                             onChange={(e) => setVideoPercent(parseInt(e.target.value))}
                             onBlur={(e) => handleSave('completionVideoPercent', parseInt(e.target.value))}
                             className="w-full h-1.5 bg-[#30363D] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Note minimum aux quiz</span>
                        <span className="text-sm font-bold text-white">{quizScore}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={quizScore} 
                             onChange={(e) => setQuizScore(parseInt(e.target.value))}
                             onBlur={(e) => handleSave('completionQuizScore', parseInt(e.target.value))}
                             className="w-full h-1.5 bg-[#30363D] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate */}
            <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">🎓 Certificat de complétion</h3>
                  <p className="text-xs text-gray-400 mt-1">Généré automatiquement quand l'étudiant termine le cours</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="hidden" checked={certificateEnabled} onChange={(e) => {
                    setCertificateEnabled(e.target.checked);
                    handleSave('certificateEnabled', e.target.checked);
                  }} />
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${certificateEnabled ? 'bg-emerald-500' : 'bg-[#30363D]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${certificateEnabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>

              {certificateEnabled && (
                <div>
                  <div className="p-4 bg-[#111827] rounded-xl mb-4 border border-[#30363D]/50">
                    <label className="block text-xs text-gray-400 mb-1.5">Nom du certificat</label>
                    <input type="text" value={certName} 
                           onChange={(e) => setCertName(e.target.value)}
                           onBlur={(e) => handleSave('certificateName', e.target.value)}
                           className="w-full bg-[#0D1117] border border-[#30363D] text-[#F8FAFC] px-4 py-2.5 rounded-xl text-sm focus:border-blue-500 outline-none" />
                  </div>

                  {/* Certificate Preview */}
                  <div className="relative bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-[#30363D] rounded-xl p-6 text-center">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-t-xl"></div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-white">N</span>
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">NDARA Afrique</p>
                    <p className="text-lg font-bold text-white mb-1">{certName || 'Certificat'}</p>
                    <p className="text-xs text-gray-400 mb-4">Décerné à</p>
                    <p className="text-sm text-emerald-400 font-semibold mb-4">Nom de l'étudiant</p>
                    <p className="text-xs text-gray-500">Pour avoir complété avec succès la formation</p>
                    <p className="text-sm text-white font-semibold mt-1">{course?.title}</p>
                    <div className="mt-4 pt-4 border-t border-[#30363D] flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500">Date</p>
                        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="w-px h-6 bg-[#30363D]"></div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500">Signature</p>
                        <p className="text-xs text-gray-400">Administration NDARA</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language & Subtitles */}
            <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">🌍 Langue & Sous-titres</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Langue principale</label>
                  <select value={courseLanguage} onChange={(e) => {
                    setCourseLanguage(e.target.value);
                    handleSave('language', e.target.value);
                  }} className="w-full bg-[#0D1117] border border-[#30363D] text-white px-4 py-3 rounded-xl text-sm outline-none focus:border-blue-500">
                    <option value="fr">🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ar">🇸🇦 العربية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Sous-titres disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-[#111827] rounded-lg cursor-pointer border border-[#30363D]">
                      <input type="checkbox" checked readOnly className="w-4 h-4 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                      <span className="text-xs text-gray-300">Français</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic">D'autres sous-titres seront ajoutés automatiquement si l'IA est activée.</p>
                </div>
              </div>
            </div>

            {/* Promo Codes */}
            <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">🎟️ Codes promotionnels</h3>
                  <p className="text-xs text-gray-400 mt-1">Créez des coupons de réduction pour vos étudiants</p>
                </div>
                <button onClick={() => setIsCouponModalOpen(true)} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-500/20 transition-colors">
                  Créer
                </button>
              </div>

              <div className="space-y-2">
                {coupons.length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-4 text-center border border-[#30363D] border-dashed rounded-xl">Aucun coupon créé pour cette formation.</p>
                ) : (
                  coupons.map(coupon => (
                    <div key={coupon.id} className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#30363D]/50 hover:border-[#30363D] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <span className="text-blue-400 text-xs font-bold">%</span>
                        </div>
                        <div>
                          <p className="text-sm font-mono text-white font-semibold">{coupon.code}</p>
                          <p className="text-xs text-gray-500">-{coupon.discount}% • {coupon.uses || 0} utilisation(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {coupon.active ? (
                           <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Actif</span>
                        ) : (
                           <span className="text-xs text-gray-400 bg-gray-500/10 px-2 py-1 rounded-lg">Inactif</span>
                        )}
                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right: Summary & Quick Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              
              {/* Course Summary */}
              <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">📋 Résumé du cours</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Titre</p>
                    <p className="text-sm text-white font-medium truncate" title={course?.title}>{course?.title || 'Sans titre'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded-lg font-semibold">{course?.categoryId || 'Catégorie'}</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-lg font-semibold">{course?.level || 'Niveau'}</span>
                  </div>
                  <div className="pt-3 border-t border-[#30363D]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Total leçons</span>
                      <span className="text-sm font-bold text-white">{course?.totalLessons || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">💰 Résumé des prix</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Prix de base</span>
                    <span className="text-sm font-bold text-white">{basePrice.toLocaleString('fr-FR')} F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Prix promo</span>
                    <span className="text-sm font-bold text-emerald-400">{isPromoValid ? promoPrice.toLocaleString('fr-FR') + ' F' : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Votre part (70%)</span>
                    <span className="text-sm font-bold text-emerald-400">{(isPromoValid ? Math.round(promoPrice * 0.7) : Math.round(basePrice * 0.7)).toLocaleString('fr-FR')} F</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#30363D]">
                    <span className="text-xs text-gray-400">Codes promo actifs</span>
                    <span className="text-sm font-bold text-white">{coupons.filter(c => c.active).length}</span>
                  </div>
                </div>
              </div>

              {/* Completion Checklist */}
              <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">✅ Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Prix défini</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isPromoValid ? 'bg-emerald-500' : 'bg-[#30363D]'}`}>
                      {isPromoValid && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-gray-400">Promo configurée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${dripEnabled ? 'bg-emerald-500' : 'bg-[#30363D]'}`}>
                      {dripEnabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-gray-400">Drip content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${certificateEnabled ? 'bg-emerald-500' : 'bg-[#30363D]'}`}>
                      {certificateEnabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-gray-300">Certificat activé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Langue définie</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Sticky Bottom Action */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#06080F] via-[#06080F]/90 to-transparent pt-12 pb-6 mt-8 z-40 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-3 max-w-5xl mx-auto">
            <button onClick={() => navigate(`/instructor/courses/${courseId}/media`)} className="flex-1 py-3.5 bg-[#161B22] border border-[#30363D] text-white text-sm font-semibold rounded-xl hover:bg-[#1E2530] transition-colors">
              ← Médias
            </button>
            <button onClick={handleContinue} className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
              Vérifier & Soumettre
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
          </div>
        </div>

      </div>

      <CouponFormModal 
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        courses={[course]} 
      />
    </div>
  );
}
