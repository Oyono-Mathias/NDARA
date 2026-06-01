import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Download, Star, ExternalLink, ChevronRight, DownloadCloud, FileCode2, LayoutTemplate, PenTool, Info, Loader2, CreditCard } from "lucide-react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";

export function ToolsView() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [filter, setFilter] = useState("all");
  const [featuredTools, setFeaturedTools] = useState<any[]>([]);

  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const pubQuery = query(collection(db, "tools"), where("status", "==", "Published"));
    const unsub = onSnapshot(pubQuery, (snap) => {
      setFeaturedTools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const openToolModal = async (tool: any) => {
      setSelectedTool(tool);
      setHasPurchased(false);
      setIsBuyModalOpen(true);

      if (currentUser?.uid) {
          const q = query(collection(db, "purchases"), where("userId", "==", currentUser.uid), where("itemId", "==", tool.id));
          const snap = await getDocs(q);
          if (!snap.empty) {
              setHasPurchased(true);
          }
      }
  };

  const handleBuy = async () => {
    if (!currentUser?.uid || !selectedTool) return;
    setIsProcessing(true);
    
    try {
        const response = await fetch('/api/wallet/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: currentUser.uid,
                price: selectedTool.price || 0,
                courseId: selectedTool.id,
                courseTitle: 'Outil: ' + selectedTool.title,
                sellerId: selectedTool.authorId || 'admin'
            })
        });

        const data = await response.json();
        if (response.ok) {
            const { setDoc, doc, collection } = await import("firebase/firestore");
            await setDoc(doc(collection(db, 'purchases')), {
                userId: currentUser.uid,
                itemId: selectedTool.id,
                title: selectedTool.title,
                type: 'tool',
                createdAt: new Date()
            });

            setHasPurchased(true);
            setIsBuyModalOpen(false);
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
      alert("Votre téléchargement du fichier a commencé !");
  };

  const categories = [
    { id: "all", label: "Tout", icon: "🛠️" },
    { id: "templates", label: "Templates UI", icon: "🎨" },
    { id: "code", label: "Snippets & Code", icon: "💻" },
    { id: "notion", label: "Notion", icon: "📝" },
    { id: "excel", label: "Excel/Sheets", icon: "📊" },
    { id: "marketing", label: "Marketing", icon: "📢" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight flex items-center gap-2">🛠️ Outils & Templates</h1>
            <div className="text-[11px] font-semibold text-emerald-500">+150 ressources numériques</div>
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      <section className="px-1">
        <div className="relative p-5 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] border border-cyan-500/30 rounded-[18px] overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-cyan-500/15"></div>
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-cyan-500/10"></div>
          
          <div className="relative z-10">
            <div className="inline-block px-2.5 py-1 rounded-md bg-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-wide mb-2">⭐ TOP RESSOURCES</div>
            <h2 className="text-base font-black text-white mb-1">Boostez votre productivité</h2>
            <p className="text-xs text-white/60 mb-3 max-w-[220px]">Découvrez nos meilleurs templates Notion et kits UI pour démarrer plus vite.</p>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 text-white text-xs font-bold active:scale-95 transition-transform">
              Explorer la sélection <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-5xl opacity-70 z-10 drop-shadow-2xl">
            🚀
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="px-1 search-section">
        <div className="flex items-center gap-2.5 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher un template, script..." className="bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-slate-500 flex-1" />
        </div>
      </section>

      {/* Categories */}
      <section className="flex gap-2 overflow-x-auto hide-scrollbar px-1 pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
              filter === cat.id
                ? 'bg-gradient-to-br from-cyan-500/25 to-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-sm">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </section>

      {/* Featured Tools */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-1">🔥 Populaires en ce moment</h2>
          <button className="text-xs font-semibold text-cyan-500 flex items-center gap-1 active:scale-95 transition-transform">
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
          {featuredTools.length > 0 ? featuredTools.map(tool => (
            <div onClick={() => openToolModal(tool)} key={tool.id} className="min-w-[150px] shrink-0 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] overflow-hidden snap-start cursor-pointer active:scale-95 transition-transform">
              <div className="w-full h-[120px] relative overflow-hidden flex items-center justify-center bg-slate-800">
                 <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center`}>
                     <div className="text-4xl opacity-90 drop-shadow-md">{tool.icon || '🛠️'}</div>
                 </div>
              </div>
              <div className="p-3 bg-black/20">
                 <div className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">{tool.title}</div>
                 <div className="text-[10px] text-slate-400 mb-2">{tool.author || 'Inconnu'}</div>
                 <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                       <span className={`text-[12px] font-bold text-cyan-400`}>{tool.price ? `${tool.price} F` : 'Gratuit'}</span>
                       <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                         <Download className="w-3 h-3 text-slate-500" /> {tool.downloads || 0}
                       </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-400">
                      <Star className="w-3 h-3 fill-orange-400 stroke-none" /> {tool.rating || 5.0}
                    </div>
                 </div>
              </div>
            </div>
          )) : (
            <div className="px-3 py-6 w-full text-center border rounded-2xl border-dashed border-white/10 opacity-70">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aucun outil disponible</p>
            </div>
          )}
        </div>
      </section>
      
      {/* List Tools */}
      <section className="px-1">
        <h2 className="text-base font-bold text-white mb-3 mt-2">🔍 Toutes les ressources</h2>
        <div className="space-y-3">
          {featuredTools.length > 0 ? featuredTools.map(tool => (
           <div onClick={() => openToolModal(tool)} key={tool.id} className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
              <div className="w-[72px] h-[72px] shrink-0 rounded-xl relative overflow-hidden bg-slate-800">
                <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-90">{tool.icon || '🛠️'}</div>
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                 <div className="flex justify-between items-start mb-0.5">
                    <div className="bg-orange-500/20 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit">TOOL</div>
                    <span className="text-xs font-bold text-cyan-400">{tool.price ? `${tool.price} F` : 'Gratuit'}</span>
                 </div>
                 <div className="text-[13px] font-bold text-white mb-1 truncate">{tool.title}</div>
                 <div className="text-[10px] text-slate-400 mb-1.5">{tool.author || 'Inconnu'}</div>
                 <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-medium text-slate-400">Outil</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                      <Star className="w-3 h-3 fill-orange-400 stroke-none" /> {tool.rating || 5.0}
                    </div>
                 </div>
              </div>
           </div>
          )) : (
            <div className="px-3 py-6 w-full text-center border rounded-2xl border-dashed border-white/10 opacity-70">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aucun outil disponible</p>
            </div>
          )}
        </div>
      </section>

      {/* Buy Modal */}
      {isBuyModalOpen && selectedTool && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200" onClick={() => !isProcessing && setIsBuyModalOpen(false)}>
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] p-5 rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4"></div>
            <div className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               {selectedTool.icon} {selectedTool.title}
            </div>

            <p className="text-sm text-slate-300 mb-4">{selectedTool.description || "Un outil fantastique pour booster votre productivité."}</p>

            <div className="p-3.5 bg-white/[0.04] rounded-xl mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Auteur</span>
                <span className="font-bold text-white">{selectedTool.author || 'Inconnu'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{hasPurchased ? "Statut" : "Prix"}</span>
                <span className="font-bold text-white">{hasPurchased ? "Acheté" : `${selectedTool.price || 0} XOF`}</span>
              </div>
            </div>

            {hasPurchased ? (
               <button 
               onClick={handleDownload}
               className="w-full p-4 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 text-white font-bold text-[14px] mb-2 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               <Download className="w-5 h-5" /> Télécharger ({selectedTool.format || 'ZIP'})
             </button>
            ) : (
                <button 
                onClick={handleBuy}
                disabled={isProcessing}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[14px] mb-2 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                ) : (
                  <><CreditCard className="w-5 h-5"/> Acheter {selectedTool.price || 0} XOF</>
                )}
              </button>
            )}

            <button 
              onClick={() => setIsBuyModalOpen(false)}
              disabled={isProcessing}
              className="w-full p-3.5 rounded-xl bg-white/5 text-slate-400 font-semibold text-[13px] active:scale-95 transition-all disabled:opacity-50"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedTool && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f]/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center text-5xl mb-6 animate-in zoom-in duration-500 delay-100">
            🎉
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Achat réussi !</h2>
          <p className="text-sm text-slate-400 text-center leading-relaxed mb-8 max-w-[280px]">
             Vous pouvez maintenant utiliser <strong>{selectedTool.title}</strong>.
          </p>
          
          <button 
            onClick={() => {
              setShowSuccessModal(false);
              handleDownload();
            }}
            className="w-full max-w-xs p-4 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 text-white font-bold text-[15px] mb-3 active:scale-95 transition-transform"
          >
            Télécharger
          </button>
          <button 
            onClick={() => {
              setShowSuccessModal(false);
            }}
            className="w-full max-w-xs p-4 rounded-xl bg-white/5 text-slate-400 font-bold text-[15px] active:scale-95 transition-transform"
          >
            Retour
          </button>
        </div>
      )}
    </div>
  );
}
