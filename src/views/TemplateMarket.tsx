import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Search, Download, Star, LayoutTemplate, 
  Info, Loader2, CreditCard, CheckCircle2 
} from "lucide-react";
import { 
  collection, query, where, onSnapshot, 
  addDoc, runTransaction, doc, serverTimestamp, getFirestore 
} from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";

interface MarketTemplate {
  id: string;
  title: string;
  description: string;
  price: number;
  authorId: string;
  authorName: string;
  icon: string;
  status: string;
  downloads?: number;
  rating?: number;
}

export function TemplateMarket() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [filter, setFilter] = useState("all");
  
  const [templates, setTemplates] = useState<MarketTemplate[]>([]);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<MarketTemplate | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Templates
  useEffect(() => {
    const q = query(collection(db, "market_templates"), where("status", "==", "active"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketTemplate));
      setTemplates(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Load User's Owned Items
  useEffect(() => {
    if (!currentUser?.uid) return;
    const qPurchases = query(collection(db, "purchases"), where("userId", "==", currentUser.uid), where("type", "==", "template"));
    const unsub = onSnapshot(qPurchases, (snap) => {
        const items = snap.docs.map(d => d.data().itemId);
        setOwnedItems(items);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleOpenModal = (template: MarketTemplate) => {
    setSelectedTemplate(template);
    setIsBuyModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!currentUser?.uid || !selectedTemplate) return;
    setIsSubmitting(true);

    try {
        const response = await fetch('/api/wallet/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: currentUser.uid,
                price: selectedTemplate.price || 0,
                courseId: selectedTemplate.id,
                courseTitle: 'Template: ' + selectedTemplate.title,
                sellerId: selectedTemplate.authorId || 'admin'
            })
        });

        const data = await response.json();
        if (response.ok) {
            await addDoc(collection(db, 'purchases'), {
                userId: currentUser.uid,
                itemId: selectedTemplate.id,
                title: selectedTemplate.title,
                type: 'template',
                createdAt: serverTimestamp()
            });

            setIsBuyModalOpen(false);
            setSuccessToast(true);
            setTimeout(() => setSuccessToast(false), 4000);
        } else {
            alert(data.error || "Erreur lors de l'achat");
        }
    } catch (e: any) {
        alert(e.message || "Erreur réseau");
    } finally {
        setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "all", label: "Tout", icon: "🛠️" },
    { id: "ui", label: "Templates UI", icon: "🎨" },
    { id: "code", label: "Scripts", icon: "💻" },
    { id: "notion", label: "Notion", icon: "📝" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black animate-in fade-in pb-28 relative">
      <header className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Templates Market</h1>
            <div className="text-[11px] font-semibold text-cyan-400">Ressources & Outils XAF</div>
          </div>
        </div>
      </header>

      {successToast && (
         <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
            <div className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xl border bg-emerald-500/20 text-emerald-400 border-emerald-500/30`}>
              <CheckCircle2 className="w-5 h-5" />
              Ressource débloquée ! Retrouvez-la dans votre espace.
            </div>
         </div>
      )}

      {/* Tabs / Cats */}
      <section className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${
              filter === cat.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-slate-400'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </section>

      {/* Catalog */}
      <section className="px-4 mt-2 space-y-3">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
             <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-2xl animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-white/10 shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                   <div className="h-4 bg-white/10 rounded w-3/4"></div>
                   <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
             </div>
          ))
        ) : templates.length === 0 ? (
           <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
              <LayoutTemplate className="w-8 h-8 text-slate-500 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Marché vide pour le moment.</p>
           </div>
        ) : (
          templates.map(template => {
            const isOwned = ownedItems.includes(template.id);
            return (
              <div key={template.id} onClick={() => handleOpenModal(template)} className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
                <div className="w-16 h-16 shrink-0 rounded-xl relative overflow-hidden bg-slate-800 flex items-center justify-center">
                  <div className="text-3xl opacity-90">{template.icon || '🛠️'}</div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-sm font-bold text-white mb-0.5 truncate">{template.title}</div>
                  <div className="text-[11px] text-slate-400 mb-2 truncate">Par {template.authorName || 'Créateur NDARA'}</div>
                  <div className="flex items-center justify-between mt-auto">
                    {isOwned ? (
                       <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Possédé</span>
                    ) : (
                       <span className="text-sm font-black text-cyan-400">{template.price.toLocaleString('fr-FR')} XAF</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {isBuyModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200" onClick={() => !isSubmitting && setIsBuyModalOpen(false)}>
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] p-6 rounded-t-[32px] animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1.5 rounded-full bg-white/20 mx-auto mb-6"></div>
            
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">
                   {selectedTemplate.icon || '🛠️'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">{selectedTemplate.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Par {selectedTemplate.authorName}</p>
                </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {selectedTemplate.description}
            </p>

            {ownedItems.includes(selectedTemplate.id) ? (
               <button 
                 onClick={() => {
                    setIsBuyModalOpen(false);
                    alert("Téléchargement du template démarré.");
                 }}
                 className="w-full p-4 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-[15px] flex items-center justify-center gap-2"
               >
                 <Download className="w-5 h-5" />
                 Accéder à la ressource
               </button>
            ) : (
              <button 
                onClick={handlePurchase}
                disabled={isSubmitting}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 text-white font-bold text-[15px] active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin"/> Sécurisation de la transaction...</>
                ) : (
                  <><CreditCard className="w-5 h-5"/> Payer {selectedTemplate.price.toLocaleString('fr-FR')} XAF</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
