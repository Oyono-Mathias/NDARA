import { ArrowUpRight, ArrowDownRight, Users, BookOpen, GraduationCap, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function InstructorDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2 leading-none">Cockpit</h1>
          <p className="text-secondary text-sm font-bold uppercase tracking-wider">Radar de Croissance</p>
        </div>
        <div className="hidden md:flex gap-3 text-right">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Revenus Mois</p>
                <p className="font-serif text-2xl text-white font-bold">1.2M <span className="text-sm text-gray-500">XAF</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <MetricCard title="Revenus Live" value="+15%" icon={ArrowUpRight} trend="up" subtitle="vs Mois dernier" color="emerald" />
         <MetricCard title="Étudiants Actifs" value="482" icon={Users} trend="up" subtitle="+12 cette semaine" color="secondary" />
         <MetricCard title="Devoirs en attente" value="15" icon={GraduationCap} trend="down" subtitle="Action requise" color="destructive" />
         <MetricCard title="Cours Actifs" value="4" icon={BookOpen} trend="neutral" subtitle="2 en révision" color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass rounded-4xl p-6 relative overflow-hidden group border border-secondary/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-white">Performances des Ventes</h2>
            <button className="text-gray-400 hover:text-white transition bg-white/5 p-2 rounded-xl"><BarChart3 className="w-5 h-5"/></button>
          </div>
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <TrendingUp className="w-8 h-8" />
             </div>
             <p className="text-gray-400 text-sm max-w-sm">
               Visualisation des courbes de revenus et de conversion des tunnels de vente via le processeur transactionnel.
             </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-white">File de Correction</h2>
          
          <div className="glass-light rounded-3xl p-4 card-hover relative overflow-hidden group border-l-4 border-l-destructive/50">
             <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <p className="text-white font-bold text-sm mb-1 relative z-10">Projet Final - FinTech</p>
             <p className="text-gray-400 text-xs mb-3 relative z-10">Par Emmanuel D. • Soumis il y a 2h</p>
             <div className="flex items-center justify-between relative z-10">
                 <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded-md border border-destructive/20 uppercase">Urgent</span>
                 <Link to="/instructor/devoirs" className="text-secondary text-xs font-bold hover:underline transition">Corriger →</Link>
             </div>
          </div>
          
           <div className="glass-light rounded-3xl p-4 card-hover relative overflow-hidden group border-l-4 border-l-primary/50">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <p className="text-white font-bold text-sm mb-1 relative z-10">Quiz Analyse Crypto</p>
             <p className="text-gray-400 text-xs mb-3 relative z-10">Par Aminata S. • Soumis il y a 5h</p>
             <div className="flex items-center justify-between relative z-10">
                 <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md border border-primary/20 uppercase">Nouveau</span>
                 <Link to="/instructor/devoirs" className="text-secondary text-xs font-bold hover:underline transition">Voir →</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, subtitle, color }: any) {
    const colorClasses = {
        emerald: "text-primary bg-primary/10",
        secondary: "text-secondary bg-secondary/10",
        destructive: "text-destructive bg-destructive/10",
        blue: "text-blue-400 bg-blue-500/10"
    };
    return (
        <div className="glass rounded-3xl p-5 card-hover">
            <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">{title}</p>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="font-serif text-3xl font-bold text-white mb-2 leading-none">{value}</p>
            <p className="text-gray-500 text-xs font-medium">{subtitle}</p>
        </div>
    )
}
