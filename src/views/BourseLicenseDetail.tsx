import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, Users, Award, Briefcase, TrendingUp, CheckCircle, Wallet, Phone, CircleDollarSign, Loader2, RefreshCw } from "lucide-react";
import { doc, onSnapshot, runTransaction, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";

export function BourseLicenseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get('orderId');

  const { currentUser } = useRole();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data());
      }
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Fetch optional order data if we arrived from an order link
  useEffect(() => {
    if (orderId) {
      const unsubOrder = onSnapshot(doc(db, "market_orders", orderId), (snap) => {
        if (snap.exists()) {
          setOrderData({ id: snap.id, ...snap.data() });
        }
      });
      return () => unsubOrder();
    }
  }, [orderId]);

  const userBalance = userProfile?.balance || 0;
  
  const priceToPay = orderData ? (orderData.price || 200000) : 200000;
  const platformFee = priceToPay * 0.02; // 2% fee
  const totalCost = priceToPay + platformFee;
  const sellerContent = orderData ? orderData.sellerName : "Plateforme (Marché Primaire)";
  
  const handlePurchase = async () => {
    if (!currentUser?.uid) {
      alert("Veuillez vous connecter pour acheter cette licence.");
      return;
    }
    
    if (userBalance < totalCost) {
      alert("Solde insuffisant dans votre portefeuille.");
      return;
    }

    if (!id) {
       alert("Aucun cours sélectionné.");
       return;
    }

    setIsProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const buyerRef = doc(db, "users", currentUser.uid);
        const buyerDoc = await transaction.get(buyerRef);
        
        if (!buyerDoc.exists()) throw new Error("Acheteur introuvable.");
        
        const currentBalance = buyerDoc.data()?.balance || 0;
        if (currentBalance < totalCost) {
          throw new Error("Solde insuffisant durant l'exécution.");
        }

        // 1. Débiter l'acheteur
        transaction.update(buyerRef, {
          balance: currentBalance - totalCost
        });

        // 2. Transférer la licence et créditer le vendeur (if secondary market)
        if (orderId) {
          const orderRef = doc(db, "market_orders", orderId);
          const orderDoc = await transaction.get(orderRef);
          
          if (!orderDoc.exists() || orderDoc.data()?.status !== "active") {
            throw new Error("L'offre n'est plus disponible.");
          }

          const sellerId = orderDoc.data()?.sellerId;
          const licenseId = orderDoc.data()?.licenseId; // original license to transfer
          
          if (sellerId) {
             const sellerRef = doc(db, "users", sellerId);
             const sellerDoc = await transaction.get(sellerRef);
             if (sellerDoc.exists()) {
               const sellerBalance = sellerDoc.data()?.balance || 0;
               // Créditer le vendeur du prix de vente (NDARA keep 2% platform fee already paid dynamically)
               transaction.update(sellerRef, {
                 balance: sellerBalance + priceToPay
               });
             }
          }
          
          if (licenseId) {
             const licenseRef = doc(db, "licenses", licenseId);
             // Transfer ownership
             transaction.update(licenseRef, {
               userId: currentUser.uid,
               updatedAt: serverTimestamp()
             });
          }

          // Mark order as executed
          transaction.update(orderRef, {
            status: "executed",
            executedAt: serverTimestamp(),
            buyerId: currentUser.uid
          });

        } else {
          // Primary Market: Create a new license document explicitly
          const newLicenseRef = doc(collection(db, "licenses"));
          transaction.set(newLicenseRef, {
            courseId: id,
            userId: currentUser.uid,
            purchasePrice: priceToPay,
            createdAt: serverTimestamp(),
            status: "active"
          });
        }

        // 3. Enregistrer l'historique dans transactions (Buyer tx)
        const txBuyerRef = doc(collection(db, "transactions"));
        transaction.set(txBuyerRef, {
           userId: currentUser.uid,
           amount: totalCost,
           currency: 'XAF',
           type: 'license_purchase',
           status: 'completed',
           createdAt: serverTimestamp(),
           courseId: id,
           orderId: orderId || null,
           description: `Achat Licence: ${priceToPay}F + Frais: ${platformFee}F`
        });

        // if seller, register seller tx
        if (orderId && orderData?.sellerId) {
           const txSellerRef = doc(collection(db, "transactions"));
           transaction.set(txSellerRef, {
              userId: orderData.sellerId,
              amount: priceToPay,
              currency: 'XAF',
              type: 'license_sale',
              status: 'completed',
              createdAt: serverTimestamp(),
              courseId: id,
              orderId: orderId,
              description: `Vente Licence sur le marché`
           });
        }
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Une erreur est survenue lors de la transaction.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col -mx-6 -mt-32 -mb-28 pt-32 pb-28">
      {/* Header overlayed on banner */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-sm">
            <Heart className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Hero Banner */}
        <div className="w-full h-[260px] relative overflow-hidden shrink-0">
          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600&h=400" alt="Trading Pro" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent"></div>
          
          <div className="absolute top-14 right-4 px-3 py-1 bg-gradient-to-br from-rose-500 to-rose-700 text-white text-[11px] font-bold rounded-lg z-10 shadow-lg shadow-rose-500/20">
            🔥 HOT
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Finance & Trading</div>
            <h1 className="text-2xl font-black text-white leading-tight mb-2 text-balance">
              {orderData ? orderData.courseTitle : "Trading Pro - Analyse Technique & Crypto"}
            </h1>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-white/80">
                <Star className="w-3.5 h-3.5 fill-orange-400 stroke-none" /> 4.9
              </div>
              <div className="flex items-center gap-1 text-xs text-white/80">
                <Users className="w-3.5 h-3.5" /> 342 élèves
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-500/40">
                <Award className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-500">94/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* Creator */}
          <div className="flex items-center gap-3 p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl mb-4 mt-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${orderData ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gradient-to-br from-rose-500 to-rose-700"}`}>
              {orderData ? <RefreshCw className="w-5 h-5" /> : "AM"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {orderData ? `Offre P2P de ${orderData.sellerName}` : "Dr. Alain Mbarga"}
              </div>
              <div className="text-[11px] text-slate-400">
                {orderData ? "Marché Secondaire (Licence de revente)" : "Expert Finance • 12 cours créés"}
              </div>
            </div>
            {!orderData && (
              <button className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30 transition-colors">
                Suivre
              </button>
            )}
          </div>

          <h2 className="text-base font-bold text-white mb-2 ml-1">📖 Description</h2>
          <div className="p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl mb-4">
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Maîtrisez l'analyse technique et le trading de crypto-monnaies avec ce cours complet. 
              Apprenez les stratégies professionnelles utilisées par les traders expérimentés, 
              la gestion des risques, et comment identifier les opportunités de marché...
              <button className="text-emerald-500 font-semibold ml-1 hover:underline">Lire plus</button>
            </p>
          </div>

          <h2 className="text-base font-bold text-white mb-2 ml-1">Détails du cours</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-center">
              <div className="text-xl mb-1.5">📚</div>
              <div className="text-base font-black text-white">48</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Leçons</div>
            </div>
            <div className="p-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-center">
              <div className="text-xl mb-1.5">⏱️</div>
              <div className="text-base font-black text-white">24h</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Durée totale</div>
            </div>
            <div className="p-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-center">
              <div className="text-xl mb-1.5">🗂️</div>
              <div className="text-base font-black text-white">12</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Chapitres</div>
            </div>
            <div className="p-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-center">
              <div className="text-xl mb-1.5">🏆</div>
              <div className="text-base font-black text-white">Oui</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Certificat</div>
            </div>
          </div>

          {/* Financial Section */}
          <h2 className="text-base font-bold text-white mb-2 ml-1 mt-4">💰 Informations financières</h2>
          <div className="p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25 rounded-[18px] relative overflow-hidden mb-4">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl"></div>
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="text-[15px] font-bold text-white">Détails de la licence</div>
              <div className="px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                ROI estim: {orderData ? "Immédiat P2P" : "1,650%"}
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500"/> Prix de la licence
                </div>
                <div className="text-[13px] font-bold text-orange-400">{priceToPay.toLocaleString('fr-FR')} XOF</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500"/> Élèves inscrits
                </div>
                <div className="text-[13px] font-bold text-white">342</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-slate-500"/> Prix du cours
                </div>
                <div className="text-[13px] font-bold text-white">15 000 XOF</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500"/> Votre part (70%)
                </div>
                <div className="text-[13px] font-bold text-emerald-500">10 500 XOF / élève</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500"/> Rentabilité estimée
                </div>
                <div className="text-[13px] font-bold text-emerald-500">12 mois</div>
              </div>
            </div>

            <div className="mt-3 p-3.5 bg-white/5 rounded-xl flex justify-between items-center relative z-10">
              <div className="text-[13px] font-semibold text-slate-400">Revenu potentiel total</div>
              <div className="text-[19px] font-black text-emerald-500">3 591 000 F</div>
            </div>
          </div>

          {/* ROI Projection */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">Projection des revenus (8 mois)</span>
            </div>
            
            <div className="flex items-end gap-1.5 h-16 mb-2">
              <div className="flex-1 bg-emerald-500/40 rounded-t-sm h-[15%]"></div>
              <div className="flex-1 bg-emerald-500/50 rounded-t-sm h-[25%]"></div>
              <div className="flex-1 bg-emerald-500/60 rounded-t-sm h-[35%]"></div>
              <div className="flex-1 bg-emerald-500/70 rounded-t-sm h-[45%]"></div>
              <div className="flex-1 bg-emerald-500/80 rounded-t-sm h-[55%]"></div>
              <div className="flex-1 bg-emerald-500/90 rounded-t-sm h-[70%]"></div>
              <div className="flex-1 bg-emerald-500 rounded-t-sm h-[85%]"></div>
              <div className="flex-1 bg-emerald-500 rounded-t-sm h-full"></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
              <span>M1</span><span>M2</span><span>M3</span><span>M4</span><span>M5</span><span>M6</span><span>M7</span><span>M8</span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-orange-500/20 flex justify-between text-center">
              <div>
                <div className="text-sm font-black text-orange-400">+32 500 F</div>
                <div className="text-[9px] font-semibold text-slate-400">Revenus/mois</div>
              </div>
              <div>
                <div className="text-sm font-black text-orange-400">1,650%</div>
                <div className="text-[9px] font-semibold text-slate-400">ROI total</div>
              </div>
              <div>
                <div className="text-sm font-black text-orange-400">3.6M F</div>
                <div className="text-[9px] font-semibold text-slate-400">Potentiel annuel</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <h2 className="text-base font-bold text-white mb-3 ml-1">❓ Comment ça marche ?</h2>
          <div className="space-y-3 mb-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-500 shrink-0">1</div>
              <div>
                <div className="text-[13px] font-bold text-white mb-0.5">Achetez la licence</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">Payez le prix de la licence via votre Ndara Wallet. Le créateur reçoit le montant immédiatement.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-500 shrink-0">2</div>
              <div>
                <div className="text-[13px] font-bold text-white mb-0.5">Basculement des droits</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">Le champ ownerId du cours passe du créateur à vous. Vous devenez propriétaire de la licence de revente.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-500 shrink-0">3</div>
              <div>
                <div className="text-[13px] font-bold text-white mb-0.5">Gagnez des revenus passifs</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">Pour chaque nouvelle inscription d'élève, vous recevez 70% du prix du cours directement dans votre wallet.</div>
              </div>
            </div>
          </div>
          
          <div className="h-20"></div> {/* padding for bottom bar */}
        </div>
      </div>

      {/* Bottom Buy Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#0a0a0f]/95 border-t border-white/5 backdrop-blur-xl z-40">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 mb-0.5">Prix de la licence</div>
            <div className="text-[22px] font-black text-white">{priceToPay.toLocaleString('fr-FR')} <span className="text-sm text-emerald-500">XOF</span></div>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-lg">
            <div className="text-[10px] text-slate-400">Wallet</div>
            <div className="text-[13px] font-bold text-emerald-500">{userBalance.toLocaleString('fr-FR')} F</div>
          </div>
        </div>
        <button 
          onClick={() => setShowConfirmModal(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
        >
          <CreditCard className="w-5 h-5" />
          Acheter la licence - {totalCost.toLocaleString('fr-FR')} XOF (TTC)
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] p-6 rounded-3xl border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl mx-auto mb-3">💼</div>
            <div className="text-center font-bold text-lg text-white mb-1">Confirmer l'achat</div>
            <div className="text-center text-xs text-slate-400 mb-5">Vous achetez la licence de revente</div>

            <div className="p-4 bg-white/[0.04] rounded-2xl mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Cours</span>
                <span className="font-bold text-white">{orderData ? orderData.courseTitle : "Trading Pro"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Vendeur</span>
                <span className="font-bold text-white">{sellerContent}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Prix de la licence</span>
                <span className="font-bold text-white">{priceToPay.toLocaleString('fr-FR')} XOF</span>
              </div>
              <div className="flex justify-between text-xs text-orange-400/80">
                <span className="">Frais plateforme (2%)</span>
                <span className="font-bold">{platformFee.toLocaleString('fr-FR')} XOF</span>
              </div>
              <div className="flex justify-between pt-3 mt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-emerald-400">Total à payer</span>
                <span className="font-black text-emerald-400">{totalCost.toLocaleString('fr-FR')} XOF</span>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-2">Méthode de paiement</div>
            <div className="space-y-2 mb-5">
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer active:scale-95 transition-all ${paymentMethod === 'wallet' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-transparent border-white/10'}`}
              >
                <div className="text-2xl">💰</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">Ndara Wallet</div>
                  <div className="text-[10px] text-slate-400">Solde: {userBalance.toLocaleString('fr-FR')} XOF</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-emerald-500' : 'border-white/20'}`}>
                  {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                </div>
              </div>
              
              <div 
                onClick={() => setPaymentMethod('momo')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer active:scale-95 transition-all ${paymentMethod === 'momo' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-transparent border-white/10'}`}
              >
                <div className="text-2xl">📱</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">Mobile Money</div>
                  <div className="text-[10px] text-slate-400">MTN / Orange</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'momo' ? 'border-emerald-500' : 'border-white/20'}`}>
                  {paymentMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                </div>
              </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[14px] mb-2 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...</>
              ) : (
                `Confirmer l'achat - ${totalCost.toLocaleString('fr-FR')} XOF`
              )}
            </button>
            <button 
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
              className="w-full p-3.5 rounded-xl bg-white/5 text-slate-400 font-semibold text-[13px] active:scale-95 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f]/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-5xl mb-6 animate-in zoom-in duration-500 delay-100">
            🎉
          </div>
          <h2 className="text-2xl font-black text-white mb-2 text-center">Licence acquise !</h2>
          <p className="text-sm text-slate-400 text-center leading-relaxed mb-8 max-w-[280px]">
            {orderData
              ? "Transaction effectuée sur le marché secondaire. Vous êtes le nouveau propriétaire !"
              : "Vous êtes maintenant propriétaire de la licence de revente."}
          </p>
          <div className="text-3xl font-black text-emerald-500 mb-8">-{totalCost.toLocaleString('fr-FR')} XOF</div>
          
          <button 
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/student/dashboard');
            }}
            className="w-full max-w-xs p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] mb-3 active:scale-95 transition-transform"
          >
            📊 Voir mes licences
          </button>
          <button 
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/student/bourse');
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

// Ensure simple icons exists or import them
function CreditCard(props: any) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
}
