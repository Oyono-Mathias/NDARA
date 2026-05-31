import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Heart, ShoppingCart, ChevronRight, Star, BookOpen, X, Play, Edit, Trash2, PieChart, UploadCloud, Image as ImageIcon } from "lucide-react";

export function EbooksView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("market");
  const [filter, setFilter] = useState("all");
  const [activeModal, setActiveModal] = useState<"none" | "detail" | "reader" | "sales">("none");
  const [selectedSales, setSelectedSales] = useState<{title: string, sales: number, revenue: number} | null>(null);
  
  const categories = [
    { id: "all", label: "Tout", icon: "📚" },
    { id: "programming", label: "Programmation", icon: "💻" },
    { id: "finance", label: "Finance", icon: "💰" },
    { id: "design", label: "Design", icon: "🎨" },
    { id: "marketing", label: "Marketing", icon: "📢" },
    { id: "ia", label: "IA", icon: "🤖" },
    { id: "blockchain", label: "Blockchain", icon: "⛓️" }
  ];

  const featuredEbooks = [
    {
      id: "python-complete",
      title: "Python - Le Guide Complet",
      author: "Dr. Alain Mbarga",
      price: "8 000 F",
      rating: 4.9,
      badge: "BESTSELLER",
      badgeClass: "bg-orange-500/80 text-white",
      icon: "🐍",
      gradient: "from-[#306998] to-[#FFD43B]"
    },
    {
      id: "trading-secrets",
      title: "Trading - Les Secrets Revealed",
      author: "Prof. Jean Talla",
      price: "12 000 F",
      rating: 4.8,
      badge: "HOT",
      badgeClass: "bg-rose-500/80 text-white",
      icon: "📈",
      gradient: "from-[#1a472a] to-[#2ecc71]"
    },
    {
      id: "startup-101",
      title: "Startup 101 - Lancer son business",
      author: "Paul Fotso",
      price: "Gratuit",
      rating: 4.6,
      badge: "GRATUIT",
      badgeClass: "bg-emerald-500/80 text-white",
      icon: "🚀",
      gradient: "from-[#e17055] to-[#fdcb6e]"
    }
  ];

  const mySalesEbooks = [
    { id: 1, title: "Python pour Débutants", price: "8 000 F", sales: 12, revenue: 96000, rating: 4.9, icon: "🐍", gradient: "from-[#306998] to-[#FFD43B]" },
    { id: 2, title: "Trading Avancé", price: "12 000 F", sales: 7, revenue: 84000, rating: 4.7, icon: "📈", gradient: "from-[#1a472a] to-[#2ecc71]" },
    { id: 3, title: "Design UI/UX Moderne", price: "6 000 F", sales: 5, revenue: 30000, rating: 4.8, icon: "🎨", gradient: "from-[#6c5ce7] to-[#a29bfe]" },
  ];

  const openSalesDetail = (title: string, sales: number, revenue: number) => {
    setSelectedSales({title, sales, revenue});
    setActiveModal('sales');
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-2 pt-2 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">📚 Marché E-book</h1>
            <div className="text-[11px] font-semibold text-emerald-500">Achetez, Vendez & Partagez</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pr-1">
          <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Heart className="w-5 h-5 text-slate-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-[#0a0a0f] flex items-center justify-center text-[9px] font-bold text-white">5</div>
          </button>
          <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ShoppingCart className="w-5 h-5 text-slate-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-[#0a0a0f] flex items-center justify-center text-[9px] font-bold text-white">2</div>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-3 gap-2">
        <button 
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'market' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-transparent'
          }`}
        >
          🛒 Marché
        </button>
        <button 
          onClick={() => setActiveTab('publish')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'publish' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-transparent'
          }`}
        >
          ✍️ Vendre
        </button>
        <button 
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sales' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-transparent'
          }`}
        >
          📊 Mes Ventes
        </button>
      </div>

      <div className="mt-2">
        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="animate-in fade-in duration-300 space-y-5">
            {/* Promo Banner */}
            <section className="px-3">
              <div className="relative p-5 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#1a0a2e] border border-purple-500/30 rounded-[18px] overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-500/15"></div>
                <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-purple-500/10"></div>
                
                <div className="relative z-10">
                  <div className="inline-block px-2.5 py-1 rounded-md bg-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wide mb-2 uppercase">🎉 Offre Spéciale</div>
                  <h2 className="text-base font-black text-white mb-1">Semaine du Livre Gratuit</h2>
                  <p className="text-xs text-white/60 mb-3 max-w-[200px]">3 ebooks offerts cette semaine. Ne manquez pas cette occasion !</p>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-white text-xs font-bold active:scale-95 transition-transform">
                    Voir les offres <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl opacity-80 z-10 drop-shadow-2xl">
                  🎁
                </div>
              </div>
            </section>

            {/* Search */}
            <section className="px-3">
              <div className="flex items-center gap-2.5 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Rechercher un ebook, auteur..." className="bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-slate-500 flex-1" />
              </div>
            </section>

            {/* Categories */}
            <section className="flex gap-2 overflow-x-auto hide-scrollbar px-3 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                    filter === cat.id
                      ? 'bg-gradient-to-br from-emerald-500/25 to-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span> {cat.label}
                </button>
              ))}
            </section>

            {/* Featured Ebooks */}
            <section className="px-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-1">🔥 Ebooks populaires</h2>
                <button className="text-[11px] font-semibold text-emerald-500 active:scale-95 transition-transform">
                  Tout voir
                </button>
              </div>
              
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory -mx-3 px-3">
                {featuredEbooks.map(ebook => (
                  <div key={ebook.id} onClick={() => navigate(`/student/ebooks/${ebook.id}`)} className="min-w-[150px] shrink-0 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] overflow-hidden snap-start cursor-pointer active:scale-95 transition-transform">
                    <div className="w-full h-[160px] relative overflow-hidden flex items-center justify-center">
                       <div className={`absolute inset-0 bg-gradient-to-br ${ebook.gradient} flex flex-col items-center justify-center gap-1.5 p-4 text-center`}>
                         <div className="text-4xl opacity-90 drop-shadow-md">{ebook.icon}</div>
                       </div>
                       <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold ${ebook.badgeClass}`}>
                          {ebook.badge}
                       </div>
                    </div>
                    <div className="p-3 bg-black/20">
                       <div className="text-[11px] font-bold text-white mb-1 line-clamp-2 leading-tight">{ebook.title}</div>
                       <div className="text-[10px] text-slate-400 mb-2">{ebook.author}</div>
                       <div className="flex items-center justify-between">
                          <span className={`text-[13px] font-bold ${ebook.price === 'Gratuit' ? 'text-emerald-500' : 'text-emerald-400'}`}>{ebook.price}</span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400">
                            <Star className="w-3 h-3 fill-orange-400 stroke-none" /> {ebook.rating}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* List Ebooks (Owned / More) */}
            <section className="px-3">
              <h2 className="text-base font-bold text-white mb-3">📖 Tous les ebooks</h2>
              <div className="space-y-3">
                 <div className="flex gap-3 p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl cursor-pointer active:scale-[0.98] transition-all" onClick={() => setActiveModal('reader')}>
                    <div className="w-[64px] h-[84px] shrink-0 rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#306998] to-[#FFD43B] flex items-center justify-center text-2xl opacity-90">🐍</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                       <div className="bg-emerald-500/20 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit mb-1">✓ ACHETÉ</div>
                       <div className="text-[13px] font-bold text-white mb-0.5 truncate">Python - Le Guide Complet</div>
                       <div className="text-[10px] text-slate-400 mb-1">Dr. Alain Mbarga</div>
                       <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-500 font-bold"><Star className="w-3 h-3 fill-emerald-500 stroke-none"/> 4.9</span>
                          <span>320 pages</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all" onClick={() => navigate('/student/ebooks/trading-secrets')}>
                    <div className="w-[64px] h-[84px] shrink-0 rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a472a] to-[#2ecc71] flex items-center justify-center text-2xl opacity-90">📈</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                       <div className="bg-orange-500/20 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit mb-1">BESTSELLER</div>
                       <div className="text-[13px] font-bold text-white mb-0.5 truncate">Trading - Les Secrets Revealed</div>
                       <div className="text-[10px] text-slate-400 mb-1">Prof. Jean Talla</div>
                       <div className="flex items-center justify-between mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400"><Star className="w-3 h-3 fill-orange-400 stroke-none"/> 4.8</span>
                          <span className="text-xs font-bold text-orange-400">12 000 F</span>
                       </div>
                    </div>
                 </div>
              </div>
            </section>
          </div>
        )}

        {/* Publish Tab */}
        {activeTab === 'publish' && (
          <div className="animate-in fade-in duration-300 space-y-4 px-3 pb-24">
            <div className="space-y-1 mb-2">
              <label className="text-xs font-bold text-slate-400 block ml-1">Titre de l'ebook *</label>
              <input type="text" placeholder="Ex: Guide Complet du Marketing Digital" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-medium text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-500 transition-colors" />
            </div>

            <div className="space-y-1 mb-2">
              <label className="text-xs font-bold text-slate-400 block ml-1">Description *</label>
              <textarea placeholder="Décrivez le contenu, le public cible et les avantages..." className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-medium text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-500 transition-colors min-h-[100px] resize-none"></textarea>
            </div>

            <div className="space-y-1 mb-2">
              <label className="text-xs font-bold text-slate-400 block ml-1">Catégorie *</label>
              <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-medium text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none">
                  <option value="" className="bg-[#0f1225]">Sélectionner une catégorie</option>
                  <option value="programming" className="bg-[#0f1225]">Programmation</option>
                  <option value="finance" className="bg-[#0f1225]">Finance & Trading</option>
                  <option value="design" className="bg-[#0f1225]">Design & UI/UX</option>
                  <option value="marketing" className="bg-[#0f1225]">Marketing Digital</option>
                  <option value="business" className="bg-[#0f1225]">Business & Startup</option>
              </select>
            </div>

            <div className="space-y-1 mb-2">
              <label className="text-xs font-bold text-slate-400 block ml-1">Prix (XOF) *</label>
              <input type="number" placeholder="0 pour gratuit, ou ex: 5000" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-medium text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-500 transition-colors" />
            </div>

            <div className="space-y-1 mb-2">
              <label className="text-xs font-bold text-slate-400 block ml-1">Fichier PDF *</label>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all active:scale-[0.98]">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-[13px] font-semibold text-slate-300">Toucher pour sélectionner un fichier</div>
                <div className="text-[11px] text-slate-500 mt-1">PDF uniquement, max 50MB</div>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <label className="text-xs font-bold text-slate-400 block ml-1">Couverture (Image)</label>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all active:scale-[0.98]">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-[13px] font-semibold text-slate-300">Toucher pour ajouter une couverture</div>
                <div className="text-[11px] text-slate-500 mt-1">JPG/PNG, recommandé 600x900px</div>
              </div>
            </div>

             <button className="w-full p-4 rounded-2xl bg-gradient-to-br from-[#1b714f] to-emerald-500 text-white font-bold text-[15px] active:scale-[0.98] transition-transform">
                🚀 Publier sur le marché
             </button>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="animate-in fade-in duration-300 space-y-4 px-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-lg font-black text-white">42 500 F</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Revenus totaux</div>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                <div className="text-2xl mb-1">📚</div>
                <div className="text-lg font-black text-white">24</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Ventes réalisées</div>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                <div className="text-2xl mb-1">✨</div>
                <div className="text-lg font-black text-white">3</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Ebooks publiés</div>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-lg font-black text-white">4.8</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Note moyenne</div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">📊 Mes publications</h2>
              <button className="text-xs font-semibold text-slate-400 active:scale-95 flex items-center gap-1">
                📥 Exporter
              </button>
            </div>

            <div className="space-y-3">
              {mySalesEbooks.map(ebook => (
                <div key={ebook.id} className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
                   <div className="w-[56px] h-[72px] shrink-0 rounded-xl relative overflow-hidden">
                     <div className={`absolute inset-0 bg-gradient-to-br ${ebook.gradient} flex items-center justify-center text-2xl opacity-90`}>{ebook.icon}</div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-white mb-2 truncate">{ebook.title}</div>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                         <span>💰 {ebook.price}</span>
                         <span>📈 {ebook.sales} ventes</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                      <button onClick={() => openSalesDetail(ebook.title, ebook.sales, ebook.revenue)} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 font-bold text-[10px] active:scale-95">Stats</button>
                      <button className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/10 font-bold text-[10px] active:scale-95">Éditer</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals overlay */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center animate-in fade-in duration-200" onClick={() => setActiveModal('none')}>
          <div 
            className="w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] rounded-t-3xl p-5 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4"></div>

            {/* DETAIL MODAL */}
            {activeModal === 'detail' && (
              <div>
                 <div className="w-full h-[160px] rounded-2xl overflow-hidden relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#306998] to-[#FFD43B] flex flex-col justify-center items-center gap-2">
                       <span className="text-5xl drop-shadow-lg text-white">🐍</span>
                       <span className="text-lg flex justify-center text-center font-black text-white/95">Python Complet</span>
                    </div>
                 </div>

                 <h2 className="text-xl font-black text-white mb-1">Python - Le Guide Complet</h2>
                 <p className="text-sm text-slate-400 mb-4">Par <span className="text-emerald-500 font-semibold">Dr. Alain Mbarga</span></p>

                 <div className="flex gap-3 mb-4">
                    <div className="flex-1 p-3 bg-white/5 rounded-xl text-center">
                       <div className="text-base font-black text-white">4.9 <Star className="w-3 h-3 inline fill-orange-400 stroke-none"/></div>
                       <div className="text-[10px] font-semibold text-slate-400">Avis (128)</div>
                    </div>
                    <div className="flex-1 p-3 bg-white/5 rounded-xl text-center">
                       <div className="text-base font-black text-white">340</div>
                       <div className="text-[10px] font-semibold text-slate-400">Pages</div>
                    </div>
                    <div className="flex-1 p-3 bg-white/5 rounded-xl text-center">
                       <div className="text-base font-black text-white">Fr</div>
                       <div className="text-[10px] font-semibold text-slate-400">Langue</div>
                    </div>
                 </div>

                 <div className="p-4 bg-white/5 rounded-2xl mb-4">
                    <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Description</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                       Maîtrisez Python de Zéro à Expert. Ce guide complet vous apprendra les bases, la programmation orientée objet, le développement web avec Django, et l'analyse de données avec Pandas.
                    </p>
                 </div>

                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center mb-4 flex justify-center items-baseline gap-1.5">
                    <div className="text-3xl font-black text-emerald-500 tracking-tight">8 000</div>
                    <div className="text-sm font-bold text-emerald-500">XOF</div>
                 </div>

                 <div className="flex gap-2">
                    <button className="flex-1 p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white text-[15px] font-bold active:scale-95 transition-transform shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2" onClick={() => setActiveModal('none')}>
                       <ShoppingCart className="w-4 h-4"/> Ajouter au panier
                    </button>
                 </div>
              </div>
            )}

            {/* READER MODAL */}
            {activeModal === 'reader' && (
               <div>
                  <div className="flex justify-between items-center mb-5">
                     <h2 className="text-lg font-black text-white flex gap-2"><BookOpen className="w-5 h-5 text-emerald-500" /> Sommaire</h2>
                     <button onClick={() => setActiveModal('none')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400">
                        <X className="w-4 h-4"/>
                     </button>
                  </div>

                  <div className="mb-5">
                     <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-2">
                        <span>Progression</span>
                        <span className="text-emerald-500">32% complet</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }}></div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold shrink-0">1</div>
                        <div className="flex-1">
                           <div className="text-sm font-bold text-white mb-0.5">Chapitre 1: Introduction</div>
                           <div className="text-[10px] text-slate-400 font-semibold mt-0.5">14 pages • Terminé</div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">2</div>
                        <div className="flex-1">
                           <div className="text-sm font-bold text-white mb-0.5">Chapitre 2: Les fondations</div>
                           <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">En cours • Page 24/45</div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center pl-0.5">
                           <Play className="w-3 h-3 fill-white" />
                        </div>
                     </div>

                     <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl opacity-60">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">3</div>
                        <div className="flex-1">
                           <div className="text-sm font-bold text-white mb-0.5">Chapitre 3: Django</div>
                           <div className="text-[10px] text-slate-400 font-semibold mt-0.5">38 pages</div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* SALES DETAIL MODAL */}
            {activeModal === 'sales' && selectedSales && (
               <div>
                  <div className="flex justify-between items-center mb-5">
                     <h2 className="text-lg font-black text-white">Statistiques de Vente</h2>
                     <button onClick={() => setActiveModal('none')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400">
                        <X className="w-4 h-4"/>
                     </button>
                  </div>
                  
                  <div className="text-center mb-6">
                     <div className="text-sm font-bold text-white mb-1">{selectedSales.title}</div>
                     <div className="text-xs text-slate-400">Depuis publication</div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl space-y-3">
                     <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-[13px] text-slate-400">Ventes totales</span>
                        <span className="text-[14px] font-bold text-white">{selectedSales.sales} exemplaires</span>
                     </div>
                     <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-[13px] text-slate-400">Revenus bruts</span>
                        <span className="text-[14px] font-bold text-emerald-500">{selectedSales.revenue.toLocaleString('fr-FR')} F</span>
                     </div>
                     <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-[13px] text-slate-400">Frais de plateforme (10%)</span>
                        <span className="text-[14px] font-bold text-rose-500">-{Math.floor(selectedSales.revenue * 0.1).toLocaleString('fr-FR')} F</span>
                     </div>
                     <div className="flex justify-between items-center py-2.5 pt-3">
                        <span className="text-sm font-bold text-white">Revenus nets</span>
                        <span className="text-base font-black text-emerald-500">{Math.floor(selectedSales.revenue * 0.9).toLocaleString('fr-FR')} F</span>
                     </div>
                  </div>

                  <button className="w-full mt-4 p-4 rounded-xl bg-white/10 text-white text-[14px] font-bold active:scale-95 transition-transform" onClick={() => setActiveModal('none')}>
                     Fermer
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
