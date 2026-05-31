import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Medal, Users, TrendingUp, Star, Crown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { Navigation } from '../components/Navigation';

export function LeaderboardView() {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'recruiters'|'sellers'|'rated'>('recruiters');

    useEffect(() => {
        setIsLoading(true);
        const q = query(
            collection(db, 'users'),
            where('role', 'in', ['instructor', 'admin']),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
            setInstructors(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const topRecruiters = useMemo(() => {
        return [...instructors]
            .filter((u: any) => (u.affiliateStats?.registrations || 0) > 0)
            .sort((a, b) => (b.affiliateStats?.registrations || 0) - (a.affiliateStats?.registrations || 0))
            .slice(0, 10);
    }, [instructors]);

    const topSellers = useMemo(() => {
        return [...instructors]
            .filter((u: any) => (u.affiliateStats?.sales || 0) > 0)
            .sort((a, b) => (b.affiliateStats?.sales || 0) - (a.affiliateStats?.sales || 0))
            .slice(0, 10);
    }, [instructors]);

    const topRated = useMemo(() => {
        return [...instructors]
            .filter((u: any) => (u.rating || 0) > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 10);
    }, [instructors]);

    const getCurrentUsers = () => {
        switch(activeTab) {
            case 'recruiters': return topRecruiters;
            case 'sellers': return topSellers;
            case 'rated': return topRated;
        }
    }

    const getMetricLabel = () => {
        switch(activeTab) {
            case 'recruiters': return 'Filleuls';
            case 'sellers': return 'Ventes';
            case 'rated': return 'Note';
        }
    }

    const getMetricKey = () => {
        switch(activeTab) {
            case 'recruiters': return 'affiliateStats.registrations';
            case 'sellers': return 'affiliateStats.sales';
            case 'rated': return 'rating';
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans relative">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <Navigation />
            
            <main className="pt-24 pb-32 px-4 max-w-4xl mx-auto space-y-12 relative z-10">
                <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-block p-2 px-4 bg-primary/10 border border-primary/20 rounded-full mb-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Excellence & Mérite</p>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tight">
                        La Bourse des <br/>
                        <span className="text-primary">Experts Ndara</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium italic">
                        Célébrons les bâtisseurs du savoir qui propulsent l'Afrique vers le futur.
                    </p>
                </header>

                <div className="w-full">
                    <div className="grid w-full grid-cols-3 bg-[#111111] border border-white/10 h-14 p-1 rounded-2xl mb-8 shadow-2xl">
                        <button 
                            onClick={() => setActiveTab('recruiters')} 
                            className={cn("flex items-center justify-center rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all", activeTab === 'recruiters' ? "bg-primary text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5")}
                        >
                            <Users size={14} /> <span className="hidden sm:inline">Ambassadeurs</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('sellers')} 
                            className={cn("flex items-center justify-center rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all", activeTab === 'sellers' ? "bg-primary text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5")}
                        >
                            <TrendingUp size={14} /> <span className="hidden sm:inline">Vendeurs</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('rated')} 
                            className={cn("flex items-center justify-center rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all", activeTab === 'rated' ? "bg-primary text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5")}
                        >
                            <Star size={14} /> <span className="hidden sm:inline">Pédagogues</span>
                        </button>
                    </div>

                    <div className="mt-0 space-y-4 animate-in fade-in duration-500">
                        <LeaderboardGrid 
                            users={getCurrentUsers()} 
                            isLoading={isLoading} 
                            metricLabel={getMetricLabel()} 
                            metricKey={getMetricKey()} 
                        />
                    </div>
                </div>

                <section className="bg-primary/5 border border-primary/10 rounded-[3rem] p-12 text-center space-y-6 shadow-2xl glass">
                    <div className="p-4 bg-primary/10 rounded-full inline-block mx-auto border border-primary/20">
                        <Crown className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Rejoignez l'Élite</h2>
                    <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                        Chaque formation partagée, chaque étudiant inscrit vous rapproche du sommet. Devenez un pilier de la communauté Ndara.
                    </p>
                    <Link to="/instructor/dashboard" className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_4px_20px_rgba(16,185,129,0.3)] bg-primary hover:bg-emerald-400 text-black inline-flex items-center justify-center transition-all active:scale-95">
                        Commencer mon aventure
                    </Link>
                </section>
            </main>
        </div>
    );
}

function LeaderboardGrid({ users, isLoading, metricLabel, metricKey }: { users: any[], isLoading: boolean, metricLabel: string, metricKey: string }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-24 w-full rounded-[2rem] bg-[#111111] animate-pulse border border-white/5" />)}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="py-20 text-center bg-[#111111] rounded-[2.5rem] border-2 border-dashed border-white/5 opacity-70">
                <Medal className="h-12 w-12 mx-auto text-slate-700 mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Le classement se prépare...</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {users.map((user, index) => {
                const isGold = index === 0;
                const isSilver = index === 1;
                const isBronze = index === 2;
                
                let val: any = user;
                metricKey.split('.').forEach(k => { val = val?.[k]; });
                const displayVal = metricKey === 'rating' ? (val || 4.8).toFixed(1) : (val || 0);

                return (
                    <Link key={user.uid} to={`/invite/${user.uid}`}>
                        <div className={cn(
                            "bg-[#111111] rounded-[2rem] overflow-hidden transition-all active:scale-[0.98] group hover:border-primary/50 shadow-xl border relative",
                            isGold ? "border-primary/30" : "border-white/5",
                        )}>
                            {isGold && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />}
                            <div className="p-5 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                                        isGold ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]" :
                                        isSilver ? "bg-slate-300 text-slate-950" :
                                        isBronze ? "bg-orange-600 text-white" : "bg-black text-slate-500 border border-white/5"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-12 w-12 flex-shrink-0 rounded-full border border-white/10 overflow-hidden bg-black flex items-center justify-center text-slate-500 font-bold">
                                            {user.profilePictureURL ? (
                                                <img src={user.profilePictureURL} alt={user.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                user.fullName?.charAt(0) || 'E'
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-base truncate group-hover:text-primary transition-colors">{user.fullName}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user.careerGoals?.currentRole || 'Expert Ndara'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className={cn(
                                            "text-xl font-black leading-none",
                                            isGold ? "text-primary" : "text-white"
                                        )}>{displayVal}</p>
                                        <p className="text-[8px] font-black uppercase text-slate-600 tracking-tighter mt-1">{metricLabel}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-primary transition-all shrink-0" />
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
