import { ArrowUpRight, ArrowDownRight, Activity, Smartphone, Server } from "lucide-react";

export function InstructorWealth() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2 leading-none">Finances</h1>
          <p className="text-secondary text-sm font-bold uppercase tracking-wider">Wealth Management</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all">
          <ArrowDownRight className="w-5 h-5 text-secondary" />
          Demander un décaissement
        </button>
      </div>

      {/* Triple Solde Container */}
      <div className="glass rounded-4xl p-1 overflow-hidden relative border border-secondary/20 shadow-[0_0_30px_rgba(204,119,34,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent"></div>
        
        <div className="bg-background/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
              <div>
                  <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">Caisse Ndara (Disponible)</p>
                  <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-2">1.2M <span className="text-2xl text-gray-500">XAF</span></h2>
              </div>
              <div className="w-12 h-12 rounded-full glass border border-secondary/30 flex items-center justify-center text-secondary shadow-[0_0_15px_rgba(204,119,34,0.2)]">
                  <Activity className="w-6 h-6" />
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-light rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-primary text-[10px] font-black tracking-widest uppercase mb-2">Ventes Directes</p>
              <p className="font-serif text-2xl font-bold text-white">850,000 <span className="text-sm text-gray-500">XAF</span></p>
            </div>
            
            <div className="glass-light rounded-2xl p-5 border border-blue-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-2">Revenus Parrainage</p>
              <p className="font-serif text-2xl font-bold text-white">350,000 <span className="text-sm text-gray-500">XAF</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ledger */}
        <div className="glass rounded-3xl p-6">
            <h3 className="font-serif text-xl text-white mb-6">Grand Livre (Ventes)</h3>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                                <ArrowUpRight className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-bold">Licence Trading</p>
                                <p className="text-gray-500 text-xs">Achat par Thomas K.</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-white text-sm font-bold">+25,000 XAF</p>
                             <p className="text-gray-500 text-xs">Il y a {i}h</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Withdrawal Options Simulator */}
         <div className="glass rounded-3xl p-6">
            <h3 className="font-serif text-xl text-white mb-6">Méthodes de Décaissement</h3>
            <div className="space-y-3">
                 <button className="w-full glass-light p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition group text-left">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0 font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]">OM</div>
                         <div>
                             <p className="text-white font-bold text-sm">Orange Money</p>
                             <p className="text-gray-400 text-xs">Instantané • Frais 1%</p>
                         </div>
                     </div>
                     <Smartphone className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
                 </button>
                 <button className="w-full glass-light p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition group text-left">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-black shrink-0 font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]">MTN</div>
                         <div>
                             <p className="text-white font-bold text-sm">MTN Mobile Money</p>
                             <p className="text-gray-400 text-xs">Instantané • Frais 1%</p>
                         </div>
                     </div>
                     <Smartphone className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
                 </button>
                 <button className="w-full glass-light p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition group text-left">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white shrink-0 font-bold">
                             <Server className="w-5 h-5"/>
                         </div>
                         <div>
                             <p className="text-white font-bold text-sm">Virement Bancaire</p>
                             <p className="text-gray-400 text-xs">48-72h • Sans plafond</p>
                         </div>
                     </div>
                     <Smartphone className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
}
