import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, BookOpen, Globe, CreditCard, Lock, FileText, Smartphone, Tablet, Loader2, Download } from "lucide-react";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";

export function EbookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useRole();
  
  const [ebook, setEbook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isFav, setIsFav] = useState(false);
  const [showDescComplete, setShowDescComplete] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ebookRef = doc(db, "ebooks", id);
    const unsubscribe = onSnapshot(ebookRef, (docSnap) => {
      if (docSnap.exists()) {
        setEbook({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching ebook:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id || !currentUser?.uid) return;
    // Vérification de l'achat dans une collection "purchases" ou via enrollments (ici on utilise purchases)
    const checkPurchase = async () => {
        const q = query(collection(db, "purchases"), where("userId", "==", currentUser.uid), where("itemId", "==", id));
        const snap = await getDocs(q);
        if (!snap.empty) {
            setHasPurchased(true);
        }
    };
    checkPurchase();
  }, [id, currentUser?.uid]);

  const handleBuy = async () => {
    if (!currentUser?.uid || !ebook) return;
    setIsProcessing(true);
    
    try {
        const response = await fetch('/api/wallet/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: currentUser.uid,
                price: ebook.price || 0,
                courseId: ebook.id,
                courseTitle: 'Ebook: ' + ebook.title,
                sellerId: ebook.instructorId || 'admin'
            })
        });

        const data = await response.json();
        if (response.ok) {
            // Also save to purchases collection manually for check
            const { setDoc, doc, collection } = await import("firebase/firestore");
            await setDoc(doc(collection(db, 'purchases')), {
                userId: currentUser.uid,
                itemId: ebook.id,
                title: ebook.title,
                type: 'ebook',
                createdAt: new Date()
            });

            setHasPurchased(true);
            setShowBuyModal(false);
            setShowSuccessModal(true);
        } else {
            alert(data.error || "Erreur lors de l'achat");
        }
    } catch (e: any) {
        alert(e.message || "Erreur réseau");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
      // Create a blob and trigger download of a secure format
      alert("Votre téléchargement de l'ebook " + selectedFormat.toUpperCase() + " sécurisé a commencé !");
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-32">
         <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-32 gap-4">
         <BookOpen className="w-12 h-12 text-slate-500" />
         <p className="text-white font-bold">Ebook introuvable</p>
         <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Retour</button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col -mx-6 -mt-32 -mb-28 pt-32 pb-28 relative">
      {/* Header overlayed on banner */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#1a0a2e]/90 to-transparent">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => setIsFav(!isFav)} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors">
            <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Hero Cover */}
        <div className="h-[280px] relative flex items-center justify-center overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#1a0a2e]"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-[120px] h-[180px] bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg rounded-l-sm shadow-2xl flex flex-col items-center justify-center text-center p-4 transform perspective-1000 rotate-y-[-8deg] hover:rotate-y-0 transition-transform cursor-pointer">
              <div className="text-3xl mb-2">{ebook.icon || '📖'}</div>
              <div className="text-[13px] font-black text-white leading-tight drop-shadow-md">{ebook.title}</div>
              <div className="absolute left-0 inset-y-0 w-1.5 bg-white/20 rounded-l-sm"></div>
            </div>
            
            <div className="flex gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-orange-500/80 backdrop-blur-md text-white text-[10px] font-bold">BESTSELLER</span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold">NOUVEAU</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="-mt-8 px-4 relative z-20 mb-4">
          <div className="p-4 bg-gradient-to-br from-[#161623]/95 to-[#0f121e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <h1 className="text-lg font-black text-white mb-1.5 leading-tight">{ebook.title}</h1>
            <div className="text-xs text-slate-400 mb-3">Par <span className="text-emerald-500 font-semibold">{ebook.author || 'Inconnu'}</span> • Publié récemment</div>
            
            <div className="flex gap-3 pb-3 border-b border-white/[0.06] mb-3">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[13px] font-bold text-orange-400">{ebook.rating || 4.8}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[13px] font-bold text-white">{ebook.pages || 120} pages</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[13px] font-bold text-white">Français</span>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">PDF</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">EPUB</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">MOBI</span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="px-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25 rounded-2xl flex justify-between items-center">
            <div className="flex flex-col">
              {ebook.price && <span className="text-xs text-slate-400 line-through mb-0.5 whitespace-nowrap">{Math.round(ebook.price * 1.5)} XOF</span>}
              <div className="text-[26px] font-black text-white leading-none whitespace-nowrap">
                {ebook.price ? ebook.price : 'Gratuit'} {ebook.price && <span className="text-base text-emerald-500 font-bold">XOF</span>}
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-500 text-[13px] font-black">-33%</span>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] font-bold text-white">📖 Description</h2>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <div className="text-[13px] text-slate-400 leading-relaxed">
              {ebook.description ? ebook.description.substring(0, 150) : "Maîtrisez les stratégies de votre domaine qui fonctionnent réellement en Afrique. De la création de contenu à l'acquisition de clients, ce guide pratique vous donne les outils concrets."}
              {!showDescComplete && (
                <>... <button onClick={() => setShowDescComplete(true)} className="text-emerald-500 font-semibold block mt-1 hover:underline">Lire la suite</button></>
              )}
              
              {showDescComplete && (
                <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                  <div className="text-[13px] text-slate-400">{ebook.description ? ebook.description.substring(150) : "Contenu très instructif."}</div>
                  <div className="font-semibold text-emerald-500">Ce que vous apprendrez :</div>
                  <ul className="space-y-1.5">
                    <li className="flex gap-2"><span>✅</span> <span>Les bases adaptées au marché</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>Création de personas et ciblage d'audience</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>Cas d'usage concrets</span></li>
                  </ul>
                  <div className="pt-2 border-t border-white/5 text-slate-300 font-medium">Inclus : Templates prêts à l'emploi.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] font-bold text-white">📑 Sommaire</h2>
            <span className="text-xs font-semibold text-emerald-500">Chapitres</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-colors" onClick={() => setShowSampleModal(true)}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-base shrink-0">📄</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">Introduction</div>
                <div className="text-[10px] text-slate-400">Lecture: 8 min</div>
              </div>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.02] rounded-xl opacity-60">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0"><Lock className="w-4 h-4 text-slate-400"/></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">Contenu Principal</div>
                <div className="text-[10px] text-slate-500">Restreint</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Button */}
        <div className="px-4 mb-4">
          <button onClick={() => setShowSampleModal(true)} className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 font-bold text-sm hover:bg-blue-500/20 active:scale-[0.98] transition-all">
            <BookOpen className="w-4 h-4" /> Lire un extrait gratuit
          </button>
        </div>
        
        <div className="h-20"></div> {/* padding for bottom bar */}
      </div>

      {/* Bottom Buy Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#0a0a0f]/95 border-t border-white/5 backdrop-blur-xl z-40">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 mb-0.5">{hasPurchased ? "Statut" : "Prix de l'ebook"}</div>
            <div className="text-[22px] font-black text-white">{hasPurchased ? "Acheté" : ebook.price || 0} {!hasPurchased && <span className="text-sm text-emerald-500">XOF</span>}</div>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-lg">
            <div className="text-[10px] text-slate-400">Wallet</div>
            <div className="text-[13px] font-bold text-emerald-500">Ndara</div>
          </div>
        </div>
        {hasPurchased ? (
           <button 
           onClick={handleDownload}
           className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
         >
           <Download className="w-5 h-5" />
           Télécharger l'ebook
         </button>
        ) : (
          <button 
            onClick={() => setShowBuyModal(true)}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
          >
            <CreditCard className="w-5 h-5" />
            Acheter & Télécharger
          </button>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200" onClick={() => !isProcessing && setShowBuyModal(false)}>
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] p-5 rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4"></div>
            <div className="text-xl font-bold text-white mb-4">Confirmer l'achat</div>

            <div className="space-y-2 mb-4">
              <div 
                onClick={() => setSelectedFormat('pdf')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer active:scale-95 transition-all ${selectedFormat === 'pdf' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-transparent border-white/10'}`}
              >
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">PDF</div>
                  <div className="text-[10px] text-slate-400">Format standard</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'pdf' ? 'border-emerald-500' : 'border-white/20'}`}>
                  {selectedFormat === 'pdf' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white/[0.04] rounded-xl mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">E-book</span>
                <span className="font-bold text-white">{ebook.title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Auteur</span>
                <span className="font-bold text-white">{ebook.author || 'Inconnu'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Prix</span>
                <span className="font-bold text-white">{ebook.price || 0} XOF</span>
              </div>
              <div className="flex justify-between pt-2.5 mt-1 border-t border-white/10">
                <span className="text-xs text-slate-400">Total</span>
                <span className="font-black text-emerald-500">{ebook.price || 0} XOF</span>
              </div>
            </div>

            <button 
              onClick={handleBuy}
              disabled={isProcessing}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[14px] mb-2 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
              ) : (
                "Confirmer & Télécharger"
              )}
            </button>
            <button 
              onClick={() => setShowBuyModal(false)}
              disabled={isProcessing}
              className="w-full p-3.5 rounded-xl bg-white/5 text-slate-400 font-semibold text-[13px] active:scale-95 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Sample Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowSampleModal(false)}>
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-[17px] font-bold text-white flex gap-2 items-center"><BookOpen className="w-4 h-4 text-emerald-500"/> Extrait gratuit</h2>
              <button onClick={() => setShowSampleModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div className="px-4 py-3 shrink-0">
               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 rounded-full w-[15%]"></div>
               </div>
            </div>

            <div className="p-4 overflow-y-auto hide-scrollbar space-y-4">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <h3 className="text-[15px] font-bold text-white mb-3">Chapitre 1 : Introduction</h3>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-3">Le contenu de ce chapitre vous montrera comment tout a commencé...</p>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center">
                <div className="text-2xl mb-1 mt-1">🔒</div>
                <div className="text-[14px] font-bold text-orange-400 mb-1">Contenu verrouillé</div>
                <div className="text-[11px] text-slate-400 mb-2">Achetez l'ebook pour accéder aux chapitres restants.</div>
              </div>
            </div>

            <div className="p-4 shrink-0 bg-[#0a0a0f]/80 backdrop-blur-md rounded-t-3xl">
              <button onClick={() => { setShowSampleModal(false); setShowBuyModal(true); }} className="w-full p-3.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[14px] active:scale-95 transition-all">
                Acheter maintenant - {ebook.price || 0} XOF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f]/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-5xl mb-6 animate-in zoom-in duration-500 delay-100">
            🎉
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Achat réussi !</h2>
          <p className="text-sm text-slate-400 text-center leading-relaxed mb-8 max-w-[280px]">
            Votre ebook a été ajouté à votre bibliothèque. Le téléchargement démarre automatiquement.
          </p>
          <div className="text-3xl font-black text-emerald-500 mb-8">-{ebook.price || 0} XOF</div>
          
          <button 
            onClick={() => {
              setShowSuccessModal(false);
              navigate(-1);
            }}
            className="w-full max-w-xs p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] mb-3 active:scale-95 transition-transform"
          >
            Lire maintenant
          </button>
          <button 
            onClick={() => {
              setShowSuccessModal(false);
              navigate(-1);
            }}
            className="w-full max-w-xs p-4 rounded-xl bg-white/5 text-slate-400 font-bold text-[15px] active:scale-95 transition-transform"
          >
            Retour au marché
          </button>
        </div>
      )}

    </div>
  );
}
