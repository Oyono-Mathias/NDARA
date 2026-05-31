import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, BookOpen, Globe, CreditCard, Lock, FileText, Smartphone, Tablet, Loader2 } from "lucide-react";

export function EbookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isFav, setIsFav] = useState(false);
  const [showDescComplete, setShowDescComplete] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBuy = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowBuyModal(false);
      setShowSuccessModal(true);
    }, 1500);
  };
  
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
              <div className="text-3xl mb-2">📖</div>
              <div className="text-[13px] font-black text-white leading-tight drop-shadow-md">Marketing Digital<br/>Mastery</div>
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
            <h1 className="text-lg font-black text-white mb-1.5 leading-tight">Marketing Digital Mastery</h1>
            <div className="text-xs text-slate-400 mb-3">Par <span className="text-emerald-500 font-semibold">Prof. Sarah Ngono</span> • Publié le 15 Mai 2026</div>
            
            <div className="flex gap-3 pb-3 border-b border-white/[0.06] mb-3">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[13px] font-bold text-orange-400">4.8</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[13px] font-bold text-white">285 pages</span>
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
              <span className="text-xs text-slate-400 line-through mb-0.5">12 000 XOF</span>
              <div className="text-[26px] font-black text-white leading-none">8 000 <span className="text-base text-emerald-500 font-bold">XOF</span></div>
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
              Maîtrisez les stratégies de marketing digital qui fonctionnent réellement en Afrique. De la création de contenu à l'acquisition de clients, ce guide pratique vous donne les outils concrets pour développer votre présence en ligne
              {!showDescComplete && (
                <>... <button onClick={() => setShowDescComplete(true)} className="text-emerald-500 font-semibold block mt-1 hover:underline">Lire la suite</button></>
              )}
              
              {showDescComplete && (
                <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                  <div className="font-semibold text-emerald-500">Ce que vous apprendrez :</div>
                  <ul className="space-y-1.5">
                    <li className="flex gap-2"><span>✅</span> <span>Les bases du marketing digital adaptées au marché africain</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>Création de personas et ciblage d'audience</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>Stratégies Facebook, Instagram & TikTok Ads</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>SEO local et référencement naturel</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>Email marketing et automation</span></li>
                    <li className="flex gap-2"><span>✅</span> <span>Études de cas réelles d'entrepreneurs africains</span></li>
                  </ul>
                  <div className="pt-2 border-t border-white/5 text-slate-300 font-medium">Inclus : 3 templates de campagnes prêts à l'emploi + Checklist mensuelle de marketing.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] font-bold text-white">📑 Sommaire</h2>
            <span className="text-xs font-semibold text-emerald-500">12 chapitres</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-colors" onClick={() => setShowSampleModal(true)}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-base shrink-0">📄</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">Introduction au Marketing Digital</div>
                <div className="text-[10px] text-slate-400">12 pages • Lecture: 8 min</div>
              </div>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-colors" onClick={() => setShowSampleModal(true)}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-base shrink-0">📄</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">Comprendre votre Audience Cible</div>
                <div className="text-[10px] text-slate-400">18 pages • Lecture: 12 min</div>
              </div>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.02] rounded-xl opacity-60">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0"><Lock className="w-4 h-4 text-slate-400"/></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">Stratégies Facebook & Instagram Ads</div>
                <div className="text-[10px] text-slate-500">24 pages • Lecture: 15 min</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.02] rounded-xl opacity-60">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0"><Lock className="w-4 h-4 text-slate-400"/></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">SEO & Référencement Naturel</div>
                <div className="text-[10px] text-slate-500">22 pages • Lecture: 14 min</div>
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

        {/* Reviews */}
        <div className="px-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] font-bold text-white">⭐ Avis des lecteurs (48)</h2>
            <button className="text-xs font-semibold text-emerald-500">Tout voir</button>
          </div>
          <div className="space-y-2">
            <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white">JT</div>
                <div>
                  <div className="text-[13px] font-bold text-white leading-tight">Jean Talla</div>
                  <div className="text-[10px] text-slate-400">Il y a 3 jours</div>
                </div>
                <div className="ml-auto flex">
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Excellent ebook ! Très pratique et adapté au marché africain. Les stratégies Facebook Ads m'ont permis de doubler mon trafic en 2 semaines.</p>
            </div>
            
            <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-[10px] font-bold text-white">AK</div>
                <div>
                  <div className="text-[13px] font-bold text-white leading-tight">Amina Konaté</div>
                  <div className="text-[10px] text-slate-400">Il y a 1 semaine</div>
                </div>
                <div className="ml-auto flex">
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 fill-orange-400 stroke-none" />
                  <Star className="w-3 h-3 text-slate-600 stroke-none" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Contenu très complet. J'aurais aimé plus d'exemples sur le TikTok marketing, mais globalement c'est une mine d'or pour les entrepreneurs digitaux.</p>
            </div>
          </div>
        </div>
        
        <div className="h-20"></div> {/* padding for bottom bar */}
      </div>

      {/* Bottom Buy Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#0a0a0f]/95 border-t border-white/5 backdrop-blur-xl z-40">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 mb-0.5">Prix de l'ebook</div>
            <div className="text-[22px] font-black text-white">8 000 <span className="text-sm text-emerald-500">XOF</span></div>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-lg">
            <div className="text-[10px] text-slate-400">Wallet</div>
            <div className="text-[13px] font-bold text-emerald-500">485 000 F</div>
          </div>
        </div>
        <button 
          onClick={() => setShowBuyModal(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
        >
          <CreditCard className="w-5 h-5" />
          Acheter & Télécharger
        </button>
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
                  <div className="text-[10px] text-slate-400">Format standard • 4.2 MB</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'pdf' ? 'border-emerald-500' : 'border-white/20'}`}>
                  {selectedFormat === 'pdf' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                </div>
              </div>
              
              <div 
                onClick={() => setSelectedFormat('epub')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer active:scale-95 transition-all ${selectedFormat === 'epub' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-transparent border-white/10'}`}
              >
                <div className="text-2xl">📘</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">EPUB</div>
                  <div className="text-[10px] text-slate-400">Pour liseuses & tablettes • 3.8 MB</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'epub' ? 'border-emerald-500' : 'border-white/20'}`}>
                  {selectedFormat === 'epub' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                </div>
              </div>
              
              <div 
                onClick={() => setSelectedFormat('mobi')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer active:scale-95 transition-all ${selectedFormat === 'mobi' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-transparent border-white/10'}`}
              >
                <div className="text-2xl">📗</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">MOBI</div>
                  <div className="text-[10px] text-slate-400">Pour Kindle • 4.0 MB</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'mobi' ? 'border-emerald-500' : 'border-white/20'}`}>
                  {selectedFormat === 'mobi' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white/[0.04] rounded-xl mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">E-book</span>
                <span className="font-bold text-white">Marketing Digital Mastery</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Auteur</span>
                <span className="font-bold text-white">Prof. Sarah Ngono</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Prix</span>
                <span className="font-bold text-white">8 000 XOF</span>
              </div>
              <div className="flex justify-between pt-2.5 mt-1 border-t border-white/10">
                <span className="text-xs text-slate-400">Total</span>
                <span className="font-black text-emerald-500">8 000 XOF</span>
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
                <Lock className="w-4 h-4 text-slate-400" /> {/* Should be an X but reusing lock icon slot */}
              </button>
            </div>
            
            <div className="px-4 py-3 shrink-0">
               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 rounded-full w-[15%]"></div>
               </div>
            </div>

            <div className="p-4 overflow-y-auto hide-scrollbar space-y-4">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <h3 className="text-[15px] font-bold text-white mb-3">Chapitre 1 : Introduction au Marketing Digital</h3>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-3">Le marketing digital a radicalement transformé la façon dont les entreprises interagissent avec leurs clients. En Afrique, où la pénétration mobile dépasse désormais les 50%, les opportunités sont immenses pour ceux qui savent exploiter ces nouveaux canaux.</p>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-3">Contrairement au marketing traditionnel, le digital permet un ciblage précis, une mesure en temps réel des résultats et un ajustement continu des campagnes. Que vous soyez entrepreneur, commercial ou étudiant, maîtriser ces outils est devenu indispensable.</p>
                <p className="text-[13px] text-slate-300 leading-relaxed">Dans ce chapitre, nous explorerons les fondamentaux du marketing digital, les différents canaux disponibles, et comment construire une stratégie cohérente adaptée au contexte africain...</p>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center">
                <div className="text-2xl mb-1 mt-1">🔒</div>
                <div className="text-[14px] font-bold text-orange-400 mb-1">Contenu verrouillé</div>
                <div className="text-[11px] text-slate-400 mb-2">Achetez l'ebook pour accéder aux 10 chapitres restants et aux bonus exclusifs.</div>
              </div>
            </div>

            <div className="p-4 shrink-0 bg-[#0a0a0f]/80 backdrop-blur-md rounded-t-3xl">
              <button onClick={() => { setShowSampleModal(false); setShowBuyModal(true); }} className="w-full p-3.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold text-[14px] active:scale-95 transition-all">
                Acheter maintenant - 8 000 XOF
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
          <div className="text-3xl font-black text-emerald-500 mb-8">-8 000 XOF</div>
          
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
              navigate('/student/ebooks');
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
