import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Download, Star, ExternalLink, ChevronRight, DownloadCloud, FileCode2, LayoutTemplate, PenTool } from "lucide-react";

export function ToolsView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  
  const categories = [
    { id: "all", label: "Tout", icon: "🛠️" },
    { id: "templates", label: "Templates UI", icon: "🎨" },
    { id: "code", label: "Snippets & Code", icon: "💻" },
    { id: "notion", label: "Notion", icon: "📝" },
    { id: "excel", label: "Excel/Sheets", icon: "📊" },
    { id: "marketing", label: "Marketing", icon: "📢" }
  ];

  const featuredTools = [
    {
      id: "saas-dashboard",
      title: "SaaS Dashboard UI Kit",
      author: "DesignPro",
      price: "15 000 F",
      rating: 4.9,
      badge: "HOT",
      badgeClass: "bg-rose-500/80 text-white",
      icon: "🎨",
      gradient: "from-[#6c5ce7] to-[#a29bfe]",
      downloads: "1.2k"
    },
    {
      id: "startup-notion",
      title: "Startup OS - Notion Template",
      author: "NotionExpert",
      price: "10 000 F",
      rating: 4.8,
      badge: "BESTSELLER",
      badgeClass: "bg-orange-500/80 text-white",
      icon: "📝",
      gradient: "from-[#1e272e] to-[#485460]",
      downloads: "3.4k"
    },
    {
      id: "react-auth",
      title: "React Auth Boilerplate",
      author: "CodeMaster",
      price: "Gratuit",
      rating: 4.7,
      badge: "FREE",
      badgeClass: "bg-emerald-500/80 text-white",
      icon: "💻",
      gradient: "from-[#0984e3] to-[#74b9ff]",
      downloads: "5.1k"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight flex items-center gap-2">🛠️ Outils & Templates</h1>
            <div className="text-[11px] font-semibold text-emerald-500">+150 ressources numériques</div>
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      <section className="px-1">
        <div className="relative p-5 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] border border-cyan-500/30 rounded-[18px] overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-cyan-500/15"></div>
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-cyan-500/10"></div>
          
          <div className="relative z-10">
            <div className="inline-block px-2.5 py-1 rounded-md bg-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-wide mb-2">⭐ TOP RESSOURCES</div>
            <h2 className="text-base font-black text-white mb-1">Boostez votre productivité</h2>
            <p className="text-xs text-white/60 mb-3 max-w-[220px]">Découvrez nos meilleurs templates Notion et kits UI pour démarrer plus vite.</p>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 text-white text-xs font-bold active:scale-95 transition-transform">
              Explorer la sélection <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-5xl opacity-70 z-10 drop-shadow-2xl">
            🚀
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="px-1 search-section">
        <div className="flex items-center gap-2.5 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher un template, script..." className="bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-slate-500 flex-1" />
        </div>
      </section>

      {/* Categories */}
      <section className="flex gap-2 overflow-x-auto hide-scrollbar px-1 pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
              filter === cat.id
                ? 'bg-gradient-to-br from-cyan-500/25 to-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-sm">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </section>

      {/* Featured Tools */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-1">🔥 Populaires en ce moment</h2>
          <button className="text-xs font-semibold text-cyan-500 flex items-center gap-1 active:scale-95 transition-transform">
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
          {featuredTools.map(tool => (
            <div key={tool.id} className="min-w-[150px] shrink-0 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] overflow-hidden snap-start cursor-pointer active:scale-95 transition-transform">
              <div className="w-full h-[120px] relative overflow-hidden flex items-center justify-center">
                 <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} flex flex-col items-center justify-center gap-1.5 p-4 text-center`}>
                   <div className="text-4xl opacity-90 drop-shadow-md">{tool.icon}</div>
                 </div>
                 <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold ${tool.badgeClass}`}>
                    {tool.badge}
                 </div>
              </div>
              <div className="p-3 bg-black/20">
                 <div className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">{tool.title}</div>
                 <div className="text-[10px] text-slate-400 mb-2">{tool.author}</div>
                 <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                       <span className={`text-[12px] font-bold ${tool.price === 'Gratuit' ? 'text-emerald-500' : 'text-cyan-400'}`}>{tool.price}</span>
                       <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                         <Download className="w-3 h-3 text-slate-500" /> {tool.downloads}
                       </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-400">
                      <Star className="w-3 h-3 fill-orange-400 stroke-none" /> {tool.rating}
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* List Tools */}
      <section className="px-1">
        <h2 className="text-base font-bold text-white mb-3 mt-2">🔍 Toutes les ressources</h2>
        <div className="space-y-3">
           <div className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
              <div className="w-[72px] h-[72px] shrink-0 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2f3542] to-[#57606f] flex items-center justify-center text-3xl opacity-90">📝</div>
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                 <div className="flex justify-between items-start mb-0.5">
                    <div className="bg-orange-500/20 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit">BESTSELLER</div>
                    <span className="text-xs font-bold text-cyan-400">10 000 F</span>
                 </div>
                 <div className="text-[13px] font-bold text-white mb-1 truncate">Startup OS - Notion Template</div>
                 <div className="text-[10px] text-slate-400 mb-1.5">NotionExpert</div>
                 <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-medium text-slate-400">Workspace</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                      <Star className="w-3 h-3 fill-orange-400 stroke-none" /> 4.8
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
              <div className="w-[72px] h-[72px] shrink-0 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#27ae60] to-[#2ecc71] flex items-center justify-center text-3xl opacity-90">📊</div>
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                 <div className="flex justify-between items-start mb-0.5">
                    <div className="bg-emerald-500/20 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit">GRATUIT</div>
                    <span className="text-xs font-bold text-emerald-500">Gratuit</span>
                 </div>
                 <div className="text-[13px] font-bold text-white mb-1 truncate">Excel Finance Tracker Pro</div>
                 <div className="text-[10px] text-slate-400 mb-1.5">FinanceTips</div>
                 <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-medium text-slate-400">Tableau Excel</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                      <Star className="w-3 h-3 fill-orange-400 stroke-none" /> 4.6
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex gap-3 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
              <div className="w-[72px] h-[72px] shrink-0 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8e44ad] to-[#9b59b6] flex items-center justify-center text-3xl opacity-90">📢</div>
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                 <div className="flex justify-between items-start mb-0.5">
                    <div className="bg-cyan-500/20 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit">NOUVEAU</div>
                    <span className="text-xs font-bold text-cyan-400">5 000 F</span>
                 </div>
                 <div className="text-[13px] font-bold text-white mb-1 truncate">30 Jours de Posts LinkedIn</div>
                 <div className="text-[10px] text-slate-400 mb-1.5">SocialGuru</div>
                 <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-medium text-slate-400">Templates Texte</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-400 text-[10px]">
                       <DownloadCloud className="w-3 h-3 text-slate-500 inline" /> N/A
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}
