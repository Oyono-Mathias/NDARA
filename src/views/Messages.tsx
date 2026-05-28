import { MessageCircle, Send, Plus, Search } from "lucide-react";

export function MessagesView() {
  return (
    <div className="h-[calc(100vh-160px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="font-serif text-3xl text-white">Messagerie</h1>
        <button className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center text-white transition">
           <Plus className="w-5 h-5" />
        </button>
      </div>

       <div className="relative mb-6 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-500 w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher une discussion..." 
            className="w-full bg-card border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2">
        <div className="glass-light rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm">Emmanuel (Expert)</h3>
                    <span className="text-xs text-primary font-bold">14:02</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-1">Excellent travail sur ton dernier devoir. Continue comme ça !</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-background text-[10px] font-bold">1</div>
        </div>

        <div className="glass rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm group-hover:text-primary">Promo #4 - FinTech</h3>
                    <span className="text-xs text-gray-500 font-bold">Hier</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-1">Sylvie: Est-ce que quelqu'un a compris le concept de Merkle Tree ?</p>
            </div>
        </div>
        
         <div className="glass rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?img=59" alt="Avatar" className="w-full h-full object-cover opacity-50 grayscale" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-400 text-sm">Support Technique</h3>
                    <span className="text-xs text-gray-600 font-bold">22/05</span>
                </div>
                <p className="text-gray-500 text-xs line-clamp-1">Ticket #849 fermé.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
