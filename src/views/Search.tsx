import { useState } from "react";
import { SearchIcon, Filter, Star } from "lucide-react";

export function SearchAndCatalog() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  
  const categories = ["Tous", "AgriTech", "FinTech", "Dev Web", "MecaTech"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-white">Catalogue</h1>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-500 w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher un cours..." 
            className="w-full bg-card border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
        <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-300 hover:text-white transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-6 px-6">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat 
                ? "bg-primary text-background shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                : "glass-light text-gray-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-3xl p-4 card-hover flex gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-card shrink-0">
              <img src={`https://images.unsplash.com/photo-${1581091226825 + i}?auto=format&fit=crop&q=80&w=200&h=200`} alt="Course" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 py-1 flex flex-col">
              <span className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">FinTech</span>
              <h3 className="font-bold text-white text-sm line-clamp-2 mb-2">Maîtriser les paiements Mobile Money en Afrique</h3>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-gray-400 text-xs font-medium">4.8</span>
                </div>
                <span className="text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">25 000 XAF</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
