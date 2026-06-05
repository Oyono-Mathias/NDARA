import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Search, BookOpen, Star, 
  Info, Loader2, CreditCard, CheckCircle2 
} from "lucide-react";
import { 
  collection, query, where, onSnapshot, 
  runTransaction, doc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";

interface MarketEbook {
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

export function EbookMarket() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [filter, setFilter] = useState("all");
  
  const [ebooks, setEbooks] = useState<MarketEbook[]>([]);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  
  const [selectedEbook, setSelectedEbook] = useState<MarketEbook | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Ebooks
  useEffect(() => {
    const q = query(collection(db, "market_ebooks"), where("status", "==", "active"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketEbook));
      setEbooks(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Load User's Owned Items
  useEffect(() => {
    if (!currentUser?.uid) return;
    const userRef = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOwnedItems(data.ownedItems || []);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleOpenModal = (ebook: MarketEbook) => {
    setSelectedEbook(ebook);
    setIsBuyModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!currentUser?.uid || !selectedEbook) return;
    setIsSubmitting(true);

    try {
      await runTransaction(db, async (transaction) => {
        const buyerRef = doc(db, "users", currentUser.uid);
        const sellerRef = doc(db, "users", selectedEbook.authorId);
        
        const buyerDoc = await transaction.get(buyerRef);
        const sellerDoc = await transaction.get(sellerRef);

        if (!buyerDoc.exists()) throw new Error("Acheteur introuvable.");
        
        const buyerData = buyerDoc.data();
        const price = selectedEbook.price;

        if ((buyerData.walletBalance || 0) < price) {
          throw new Error("Solde XAF insuffisant.");
        }

        if ((buyerData.ownedItems || []).includes(selectedEbook.id)) {
          throw new Error("Vous possédez déjà cet E-book.");
        }

        // Débit Acheteur
        transaction.update(buyerRef, {
          walletBalance: (buyerData.walletBalance || 0) - price,
          ownedItems: [...(buyerData.ownedItems || []), selectedEbook.id]
        });

        // Crédit Vendeur (ex: on retire 15% de frais plateforme pour les ebooks)
        const netRevenue = Math.floor(price * 0.85);
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          transaction.update(sellerRef, {
            walletBalance: (sellerData.walletBalance || 0) + netRevenue
          });
        }

        // Création transaction d'historique
        const txRef = doc(collection(db, "transactions"));
        transaction.set(txRef, {
          userId: currentUser.uid,
          amount: price,
          currency: 'XAF',
          type: 'purchase_ebook',
          itemId: selectedEbook.id,
          title: selectedEbook.title,
          sellerId: selectedEbook.authorId,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      });

      setIsBuyModalOpen(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur de transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "all", label: "Tout", icon: "📚" },
    { id: "code", label: "Programmation", icon: "💻" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "design", label: "Design", icon: "🎨" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black animate-in fade-in pb-28 relative">
      <header className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">E-books Market</h1>
            <div className="text-[11px] font-semibold text-emerald-400">Bibliothèque Numérique</div>
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
              filter === cat.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400'
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
                <div className="w-16 h-20 rounded-xl bg-white/10 shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                   <div className="h-4 bg-white/10 rounded w-3/4"></div>
                   <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
             </div>
          ))
        ) : ebooks.length === 0 ? (
           <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
              <BookOpen className="w-8 h-8 text-slate-500 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Aucun e-book disponible.</p>
           </div>
        ) : (
          ebooks.map(ebook => {
            const isOwned = ownedItems.includes(ebook.id);
            return (
              <div key={ebook.id} onClick={() => handleOpenModal(ebook)} className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
                <div className="w-16 h-20 shrink-0 rounded-xl relative overflow-hidden bg-slate-800 flex items-center justify-center">
                  <div className="text-3xl opacity-90">{ebook.icon || '📚'}</div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-sm font-bold text-white mb-0.5 truncate">{ebook.title}</div>
                  <div className="text-[11px] text-slate-400 mb-2 truncate">Par {ebook.authorName || 'Auteur NDARA'}</div>
                  <div className="flex items-center justify-between mt-auto">
                    {isOwned ? (
                       <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Possédé</span>
                    ) : (
                       <span className="text-sm font-black text-emerald-400">{ebook.price.toLocaleString('fr-FR')} XAF</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {isBuyModalOpen && selectedEbook && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200" onClick={() => !isSubmitting && setIsBuyModalOpen(false)}>
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] p-6 rounded-t-[32px] animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1.5 rounded-full bg-white/20 mx-auto mb-6"></div>
            
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">
                   {selectedEbook.icon || '📚'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">{selectedEbook.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Par {selectedEbook.authorName}</p>
                </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {selectedEbook.description}
            </p>

            {ownedItems.includes(selectedEbook.id) ? (
               <button 
                 onClick={() => {
                    setIsBuyModalOpen(false);
                    // Navigation logic to ebook reader
                 }}
                 className="w-full p-4 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-[15px] flex items-center justify-center gap-2"
               >
                 <BookOpen className="w-5 h-5" />
                 Lire l'E-book
               </button>
            ) : (
              <button 
                onClick={handlePurchase}
                disabled={isSubmitting}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin"/> Sécurisation de la transaction...</>
                ) : (
                  <><CreditCard className="w-5 h-5"/> Payer {selectedEbook.price.toLocaleString('fr-FR')} XAF</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
