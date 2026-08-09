const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorDashboard.tsx', 'utf8');

const replacement = `
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Real-time Dashboard Widgets */}
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Revenus du Jour</p>
          <p className="text-2xl lg:text-3xl font-black text-white">{realtimeStats?.revenueToday?.toLocaleString() || 0} XAF</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Revenus (Semaine)</p>
          <p className="text-2xl lg:text-3xl font-black text-white">{realtimeStats?.revenueWeek?.toLocaleString() || 0} XAF</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Revenus (Mois)</p>
          <p className="text-2xl lg:text-3xl font-black text-white">{realtimeStats?.revenueMonth?.toLocaleString() || 0} XAF</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Revenus Totaux</p>
          <p className="text-2xl lg:text-3xl font-black text-emerald-400">{realtimeStats?.totalRevenue?.toLocaleString() || 0} XAF</p>
        </div>

        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Solde Disponible</p>
          <p className="text-2xl font-black text-white">{realtimeStats?.availableBalance?.toLocaleString() || 0} XAF</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Solde en Attente</p>
          <p className="text-2xl font-black text-orange-400">{realtimeStats?.pendingBalance?.toLocaleString() || 0} XAF</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Solde Retiré</p>
          <p className="text-2xl font-black text-slate-300">{realtimeStats?.withdrawnBalance?.toLocaleString() || 0} XAF</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Taux de Conversion</p>
          <p className="text-2xl font-black text-white">{realtimeStats?.conversionRate?.toFixed(1) || 0}%</p>
        </div>

        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Clics</p>
          <p className="text-xl font-black text-white">{realtimeStats?.clicksCount || 0}</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Users className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Inscriptions</p>
          <p className="text-xl font-black text-white">{realtimeStats?.signupsCount || 0}</p>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <DollarSign className="w-8 h-8 text-pink-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Achats</p>
          <p className="text-xl font-black text-white">{realtimeStats?.purchasesCount || 0}</p>
        </div>
        
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -bottom-4 opacity-10">
              <Trophy className="w-24 h-24 text-yellow-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Classement</p>
          <p className="text-2xl lg:text-3xl font-black text-white relative z-10">{realtimeStats?.rank ? '#' + realtimeStats.rank : '-'}</p>
          <p className="text-xs text-slate-400 relative z-10">Global</p>
        </div>
      </div>
      
      {/* Niveaux et Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
          <Medal className="w-16 h-16 text-pink-500 shrink-0" />
          <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Niveau Actuel</p>
              <p className="text-2xl font-black text-white capitalize">{realtimeStats?.level || 'Bronze'}</p>
          </div>
        </div>
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
          <Star className="w-16 h-16 text-yellow-500 shrink-0" />
          <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Dernier Badge</p>
              <p className="text-2xl font-black text-white">{realtimeStats?.badge ? realtimeStats.badge.name : 'Aucun'}</p>
          </div>
        </div>
      </div>
`;

code = code.replace(/<div className="grid grid-cols-2 md:grid-cols-4 gap-4">[\s\S]*?(?=<div className="grid grid-cols-1 md:grid-cols-3 gap-6">)/, replacement);

fs.writeFileSync('src/views/ambassador/AmbassadorDashboard.tsx', code);
