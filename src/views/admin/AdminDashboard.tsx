import { Activity, Users, Banknote, ShieldAlert, TrendingUp, TerminalSquare, AlertTriangle, ArrowUpRight } from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#10B981]/20 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1 flex items-center gap-3">
              <TerminalSquare className="text-[#10B981] w-8 h-8" /> ROOT_DASHBOARD
          </h1>
          <p className="text-[#10B981]/70 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
             System Online // Latency: 42ms
          </p>
        </div>
        <div className="bg-black border border-red-500/50 p-3 rounded-sm flex items-center gap-4">
            <div className="flex flex-col">
                <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Master Kill Switch</span>
                <span className="text-gray-500 text-[9px]">Global suspend</span>
            </div>
            <div className="w-12 h-6 bg-red-500/20 border border-red-500 rounded-full flex items-center p-1 cursor-not-allowed">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <AdminMetric title="Revenus Nets (M)" value="4.2M XAF" trend="+12.5%" icon={Banknote} color="text-[#10B981]" border="border-[#10B981]/30" />
         <AdminMetric title="Utilisateurs Actifs" value="12,482" trend="+84" icon={Users} color="text-blue-400" border="border-blue-400/30" />
         <AdminMetric title="Taux de Conversion" value="8.4%" trend="+1.2%" icon={TrendingUp} color="text-purple-400" border="border-purple-400/30" />
         <AdminMetric title="Alertes Sécurité" value="3" trend="Action Req." icon={ShieldAlert} color="text-red-500" border="border-red-500/30" bg="bg-red-500/5" animate />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area placeholder */}
          <div className="lg:col-span-2 bg-[#050505] border border-[#10B981]/20 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                 <span className="text-[#10B981] text-[10px] font-bold tracking-widest uppercase">Live_Telemetry</span>
             </div>
             <h2 className="text-[#10B981] font-bold tracking-widest uppercase mb-6 text-sm border-b border-[#10B981]/20 pb-2 inline-block">Flux d'Acquisition (7j)</h2>
             
             <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#10B981]/20 bg-[#10B981]/5">
                 <Activity className="w-12 h-12 text-[#10B981]/50 mb-4" />
                 <p className="text-[#10B981]/50 text-xs font-mono uppercase tracking-widest">[ Graph_Rendering_Engine_Active ]</p>
             </div>
          </div>

          {/* System Logs / Urgent Actions */}
          <div className="bg-[#050505] border border-[#10B981]/20 p-6 flex flex-col">
              <h2 className="text-[#10B981] font-bold tracking-widest uppercase mb-4 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Requêtes Critiques
              </h2>
              <div className="flex-1 space-y-3 overflow-y-auto">
                  <ActionItem 
                      type="PAYOUT" 
                      message="Demande retrait suspecte: 2.5M XAF" 
                      user="Expert_094" 
                      urgency="HIGH" 
                  />
                  <ActionItem 
                      type="MODERATION" 
                      message="5 cours en attente d'approbation" 
                      user="System" 
                      urgency="MEDIUM" 
                  />
                  <ActionItem 
                      type="SECURITY" 
                      message="3 tentatives bruteforce bloquées (IP: 192...)" 
                      user="Firewall" 
                      urgency="LOW" 
                  />
              </div>
          </div>
      </div>
    </div>
  );
}

function AdminMetric({ title, value, trend, icon: Icon, color, border, bg = "bg-black", animate }: any) {
    return (
        <div className={`${bg} border ${border} p-5 relative overflow-hidden group`}>
            <div className="absolute right-0 top-0 w-16 h-16 bg-current opacity-5 blur-xl group-hover:opacity-10 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">{title}</p>
                <Icon className={`w-5 h-5 ${color} ${animate ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-wider mb-2">{value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${color}`}>
                <ArrowUpRight className="w-3 h-3" /> {trend}
            </p>
        </div>
    )
}

function ActionItem({ type, message, user, urgency }: any) {
    const urgencyColors = {
        HIGH: 'text-red-500 border-red-500/30',
        MEDIUM: 'text-amber-500 border-amber-500/30',
        LOW: 'text-blue-400 border-blue-400/30'
    };
    
    return (
        <div className={`border-l-2 pl-3 py-1 ${urgencyColors[urgency as keyof typeof urgencyColors]}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest bg-white/5 px-1.5 py-0.5 ${urgencyColors[urgency as keyof typeof urgencyColors].split(' ')[0]}`}>
                    {type}
                </span>
                <span className="text-gray-600 text-[9px]">{user}</span>
            </div>
            <p className="text-gray-300 text-xs font-medium">{message}</p>
        </div>
    )
}
