import { ArrowDownRight, ArrowUpRight, Clock, ShieldCheck, CreditCard } from "lucide-react";

export function WalletView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-3xl text-white">Ndara Wallet</h1>
        <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ShieldCheck className="text-primary w-5 h-5" />
        </div>
      </div>

      {/* Triple Solde Container */}
      <div className="glass rounded-4xl p-1 overflow-hidden relative glow-green">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        
        <div className="bg-background/80 backdrop-blur-xl rounded-[2rem] p-6 relative z-10 border border-white/5">
          <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">Balance Principale</p>
          <h2 className="font-serif text-5xl font-bold text-white mb-6">0 <span className="text-2xl text-gray-500">XAF</span></h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-light rounded-2xl p-4 border border-secondary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full blur-xl -mr-8 -mt-8"></div>
              <p className="text-secondary text-[10px] font-black tracking-widest uppercase mb-1">Affilié (Gains)</p>
              <p className="font-serif text-xl font-bold text-white">0 <span className="text-xs text-gray-500">XAF</span></p>
            </div>
            
            <div className="glass-light rounded-2xl p-4 border border-destructive/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-full blur-xl -mr-8 -mt-8"></div>
              <p className="text-destructive text-[10px] font-black tracking-widest uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Séquestre (14j)</p>
              <p className="font-serif text-xl font-bold text-white">0 <span className="text-xs text-gray-500">XAF</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button className="flex-1 glass text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          Recharger
        </button>
        <button className="flex-1 glass text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          Retirer
        </button>
      </div>

      <div>
        <h3 className="font-serif text-xl text-white mb-4">Dernières Transactions</h3>
        <div className="space-y-3">
          <div className="glass rounded-2xl p-4 flex items-center justify-between card-hover">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Aucune transaction</p>
                <p className="text-xs text-gray-500">Historique vide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
