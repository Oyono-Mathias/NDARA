import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Search, Bell, Eye, EyeOff,
  Send, Download, Plus, Clock, ShoppingCart, TrendingUp, RefreshCw, ChevronRight, X
} from "lucide-react";

export function WalletView() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeModal, setActiveModal] = useState<"none" | "send" | "receive" | "detail">("none");
  const [amount, setAmount] = useState("");

  const balanceBreakdown = [
    { id: 1, title: "Revenus Bourse", desc: "Licences achetées", amount: "+32 500 F", type: "positive", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/15" },
    { id: 2, title: "Cours achetés", desc: "16 cours actifs", amount: "-128 000 F", type: "negative", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/15" },
    { id: 3, title: "Rechargements", desc: "5 rechargements", amount: "+580 500 F", type: "positive", icon: Plus, color: "text-orange-500", bg: "bg-orange-500/15" },
    { id: 4, title: "Envoyés", desc: "3 transferts", amount: "-45 000 F", type: "negative", icon: Send, color: "text-rose-500", bg: "bg-rose-500/15" }
  ];

  const transactions = [
    { date: "Aujourd'hui, 29 Mai", items: [
      { id: "t1", title: "Revenu Bourse", desc: "Trading Pro • 3 nouvelles inscriptions", amount: "+31 500 F", type: "bourse", isPositive: true, time: "14:32", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/15" },
      { id: "t2", title: "Achat cours", desc: "Web3 & DeFi - Développement Blockchain", amount: "-15 000 F", type: "course", isPositive: false, time: "11:15", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/15" },
    ]},
    { date: "Hier, 28 Mai", items: [
      { id: "t3", title: "Revenu Bourse", desc: "Python & IA • 2 nouvelles inscriptions", amount: "+16 800 F", type: "bourse", isPositive: true, time: "18:45", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/15" },
      { id: "t4", title: "Envoyé à Jean Talla", desc: "Remboursement cours React", amount: "-25 000 F", type: "transfer", isPositive: false, time: "15:20", icon: Send, color: "text-rose-500", bg: "bg-rose-500/15" },
      { id: "t5", title: "Achat licence Bourse", desc: "Cybersécurité - Ethical Hacking", amount: "-250 000 F", type: "course", isPositive: false, time: "10:00", icon: ShoppingCart, color: "text-orange-500", bg: "bg-orange-500/15" },
    ]},
    { date: "27 Mai", items: [
      { id: "t6", title: "Rechargement", desc: "Orange Money • ****4521", amount: "+200 000 F", type: "income", isPositive: true, time: "09:30", icon: Plus, color: "text-emerald-500", bg: "bg-emerald-500/15" },
      { id: "t7", title: "Revenu Bourse", desc: "React Native Pro • 5 inscriptions", amount: "+42 000 F", type: "bourse", isPositive: true, time: "08:15", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/15" },
      { id: "t8", title: "Achat cours", desc: "UI/UX Design Masterclass", amount: "-12 000 F", type: "course", isPositive: false, time: "07:45", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/15" },
    ]}
  ];

  const filters = [
    { id: "all", label: "Tout" },
    { id: "income", label: "Entrées" },
    { id: "expense", label: "Sorties" },
    { id: "course", label: "Cours" },
    { id: "bourse", label: "Bourse" },
    { id: "transfer", label: "Transferts" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">Mon Wallet</h1>
            <div className="text-[11px] font-semibold text-slate-400">Ndara Wallet • Mathias Oyono</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 text-slate-400" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Wallet Card */}
      <section className="px-1">
        <div className="w-full h-48 rounded-[22px] bg-gradient-to-br from-[#0d3d28] via-[#1b714f] to-[#1b714f] relative overflow-hidden p-6 flex flex-col justify-between shadow-[0_8px_32px_rgba(27,113,79,0.3)]">
          {/* Background circles */}
          <div className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-white/5"></div>
          <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] rounded-full bg-white/5"></div>
          
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center z-10 hover:bg-white/20 transition-colors"
          >
            {showBalance ? <Eye className="w-4 h-4 text-white/80" /> : <EyeOff className="w-4 h-4 text-white/80" />}
          </button>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white">N</div>
              <span className="text-sm font-bold text-white/90 tracking-wide">NDARA WALLET</span>
            </div>
            <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-80"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-[11px] font-semibold text-white/60 mb-1">Solde disponible</div>
            <div className="text-[32px] font-black text-white tracking-tight flex items-baseline gap-1">
              {showBalance ? "485 000" : "••••••"} <span className="text-lg font-semibold opacity-70">XOF</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end relative z-10">
            <div className="text-[13px] font-semibold text-white/70 tracking-[2px]">•••• •••• •••• 4827</div>
            <div className="text-right">
              <div className="text-[9px] font-semibold text-white/50 uppercase tracking-widest">Titulaire</div>
              <div className="text-[13px] font-bold text-white/90">MATHIAS OYONO</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex gap-3 px-1">
        <button onClick={() => setActiveModal('send')} className="flex-1 flex flex-col items-center gap-2 p-3.5 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all hover:bg-white/10">
          <div className="w-11 h-11 rounded-[14px] bg-emerald-500/20 flex items-center justify-center">
            <Send className="w-5 h-5 text-emerald-500 -ml-1 -mb-1 transform rotate-[-45deg]" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Envoyer</span>
        </button>
        <button onClick={() => setActiveModal('receive')} className="flex-1 flex flex-col items-center gap-2 p-3.5 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all hover:bg-white/10">
          <div className="w-11 h-11 rounded-[14px] bg-blue-500/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Recevoir</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-2 p-3.5 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all hover:bg-white/10">
          <div className="w-11 h-11 rounded-[14px] bg-orange-500/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Recharger</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-2 p-3.5 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all hover:bg-white/10">
          <div className="w-11 h-11 rounded-[14px] bg-purple-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Historique</span>
        </button>
      </section>

      {/* Balance Breakdown */}
      <section className="px-1">
        <div className="p-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/5 rounded-[18px]">
          <h2 className="text-sm font-bold text-white mb-3.5">Répartition du solde</h2>
          <div className="space-y-0">
            {balanceBreakdown.map((item, index) => (
              <div key={item.id} className={`flex justify-between items-center py-2.5 ${index !== balanceBreakdown.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${item.type === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white">Transactions</h2>
          <button className="text-xs font-semibold text-emerald-500 flex items-center gap-1 active:scale-95 transition-transform">
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-3.5">
          {transactions.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="text-[11px] font-bold text-slate-500 mb-2 pl-1">{group.date}</div>
              <div className="space-y-1.5">
                {group.items.filter(i => filter === 'all' || 
                  (filter === 'income' && i.isPositive) || 
                  (filter === 'expense' && !i.isPositive) || 
                  i.type === filter
                ).map((item) => (
                  <div key={item.id} onClick={() => setActiveModal('detail')} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer hover:bg-white/[0.06]">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-white truncate mb-0.5">{item.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold mb-0.5 ${item.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.amount}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals overlay */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center animate-in fade-in duration-200" onClick={() => setActiveModal('none')}>
          <div 
            className="w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#0f1225] rounded-t-3xl p-5 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4"></div>
            
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">
                {activeModal === 'send' ? 'Envoyer de l\'argent' : 
                 activeModal === 'receive' ? 'Recevoir de l\'argent' : 
                 'Détail transaction'}
              </h2>
              <button onClick={() => setActiveModal('none')} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* SEND MODAL CONTENT */}
            {activeModal === 'send' && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 mx-auto flex items-center justify-center text-[22px] font-bold text-white mb-4">
                  JT
                </div>
                
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">Destinataire (ID ou Tél)</div>
                  <input type="text" placeholder="ex: ND-8472 ou +237..." className="w-full p-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-primary/50 placeholder:text-slate-500" />
                </div>
                
                <div className="py-5 text-center">
                  <div className="text-sm font-semibold text-slate-400">Montant</div>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-center bg-transparent border-none text-[42px] font-black text-white focus:outline-none placeholder:text-slate-700 my-1" 
                  />
                  <div className="text-sm font-semibold text-slate-400">XOF</div>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  {['5000', '10000', '25000'].map(val => (
                    <button key={val} onClick={() => setAmount(val)} className="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all">
                      {val}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 bg-white/5 rounded-2xl mb-4">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-slate-400">Frais d'envoi</span>
                    <span className="text-[13px] font-bold text-white">0 XOF</span>
                  </div>
                  <div className="flex justify-between items-center py-2 mt-1.5 border-t border-white/10">
                    <span className="text-xs text-slate-400">Total à payer</span>
                    <span className="text-base font-black text-primary">{(parseInt(amount || "0") + 0).toLocaleString()} XOF</span>
                  </div>
                </div>
                
                <button className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white font-bold text-[15px] active:scale-95 transition-transform" onClick={() => setActiveModal('none')}>
                  Confirmer l'envoi
                </button>
              </div>
            )}

            {/* RECEIVE MODAL CONTENT */}
            {activeModal === 'receive' && (
              <div className="space-y-4">
                 <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center mb-4">
                   {/* Fake QR for demo */}
                   <div className="w-full h-full bg-slate-900 border-4 border-white flex flex-wrap" style={{backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px'}}></div>
                 </div>
                 
                 <div className="text-center p-3.5 bg-white/5 rounded-2xl">
                   <div className="text-[11px] text-slate-400 mb-1">Votre ID Ndara</div>
                   <div className="text-base font-black text-primary tracking-wide">ND-8842-XF</div>
                 </div>
                 
                 <button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-primary/15 border border-primary/20 text-primary font-bold text-sm active:scale-95 transition-all">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                   Copier l'ID
                 </button>
              </div>
            )}

            {/* DETAIL DEMO CONTENT */}
            {activeModal === 'detail' && (
              <div>
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-full mx-auto bg-emerald-500/15 flex items-center justify-center mb-3">
                    <TrendingUp className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-white">+31 500 F</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-500 rounded-lg text-[11px] font-bold mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Succès
                  </div>
                </div>
                
                <div className="p-3.5 bg-white/5 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 mt-1">Détails</div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[13px] text-slate-400">Type</span>
                    <span className="text-[13px] font-semibold text-white">Revenu Bourse</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[13px] text-slate-400">Source</span>
                    <span className="text-[13px] font-semibold text-white">Cours: Trading Pro</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[13px] text-slate-400">Date</span>
                    <span className="text-[13px] font-semibold text-white">29 Mai 2026, 14:32</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[13px] text-slate-400">ID Tx</span>
                    <span className="text-[13px] font-semibold text-white">#TRX-88219</span>
                  </div>
                </div>
                
                <button className="w-full p-4 mt-4 rounded-2xl bg-white/10 text-white font-bold text-sm active:scale-95 transition-transform" onClick={() => setActiveModal('none')}>
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

