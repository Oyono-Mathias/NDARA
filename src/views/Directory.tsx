import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    MessageSquare, 
    Loader2, 
    Users, 
    Filter, 
    Mic, 
    Globe,
    Leaf,
    ChartLine,
    Coins,
    Cpu,
    Code
} from 'lucide-react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CATEGORIES = [
    { id: 'all', name: "Tous", icon: Users },
    { id: 'FinTech', name: "FinTech", icon: ChartLine, color: 'text-blue-400 bg-blue-400/10' },
    { id: 'AgriTech', name: "AgriTech", icon: Leaf, color: 'text-emerald-400 bg-emerald-400/10' },
    { id: 'Trading', name: "Trading", icon: Coins, color: 'text-orange-400 bg-orange-400/10' },
    { id: 'Mécatronique', name: "MécaTech", icon: Cpu, color: 'text-purple-400 bg-purple-400/10' },
    { id: 'Développement Web', name: "Dév Web", icon: Code, color: 'text-pink-400 bg-pink-400/10' }
];

export function DirectoryView() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('all');
    const [isContacting, setIsContacting] = useState<string | null>(null);
    const [classmates, setClassmates] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        setIsLoadingData(true);
        const q = query(collection(db, 'users'), limit(50));
        const unsubscribe = onSnapshot(q, (snap) => {
            setClassmates(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
            setIsLoadingData(false);
        }, (err) => {
            console.error("Error fetching users:", err);
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredClassmates = useMemo(() => {
        return classmates.filter(m => {
            const matchesSearch = m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 m.interestDomain?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDomain = selectedDomain === 'all' || m.interestDomain === selectedDomain;
            return matchesSearch && matchesDomain;
        }).sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    }, [classmates, searchTerm, selectedDomain]);

    const stats = useMemo(() => {
        const onlineCount = classmates.filter(c => c.isOnline).length;
        const countries = new Set(classmates.map(c => c.countryName).filter(Boolean));
        return {
            total: classmates.length,
            online: onlineCount,
            countries: countries.size || 1
        };
    }, [classmates]);

    const handleContact = async (memberId: string) => {
        setIsContacting(memberId);
        setTimeout(() => {
            setIsContacting(null);
            navigate(`/student/messages?chatId=${memberId}`);
        }, 800);
    };

    const getFlagEmoji = (code?: string) => {
        if (!code) return "🌍";
        const codePoints = code
            .toUpperCase()
            .split('')
            .map(char =>  127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    return (
        <div className="flex flex-col gap-0 pb-24 bg-[#050505] min-h-screen relative -mt-32 max-w-md mx-auto z-10 w-full pt-32">
            
            <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/5 safe-area-pt">
                <div className="px-6 py-6 pt-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-black text-3xl text-white mb-1 uppercase tracking-tight">Communauté</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stats.total} Ndara connectés</p>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full bg-[#111111] text-slate-400 transition hover:bg-white/5 border border-white/5">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 pb-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Search className="h-4 w-4 text-primary" />
                        </div>
                        <input 
                            placeholder="Chercher un membre, un domaine..." 
                            className="w-full h-14 pl-14 pr-12 bg-[#111111] border border-white/5 rounded-full text-white placeholder:text-slate-600 focus:border-primary/50 outline-none transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary active:scale-90 transition-transform">
                            <Mic className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-4 overflow-hidden border-b border-white/5">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedDomain(cat.id)}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2
                                        ${selectedDomain === cat.id 
                                            ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                            : "bg-[#111111] border-white/5 text-slate-500 hover:text-white"
                                        }`}
                                >
                                    {Icon && <Icon className="h-3 w-3" />}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8">
                <section className="grid grid-cols-3 gap-3">
                    <div className="bg-[#111111] rounded-3xl p-4 border border-white/5 text-center shadow-xl">
                        <p className="text-2xl font-black text-primary leading-none">{stats.total}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Membres</p>
                    </div>
                    <div className="bg-[#111111] rounded-3xl p-4 border border-white/5 text-center shadow-xl">
                        <p className="text-2xl font-black text-blue-400 leading-none">{stats.online}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">En Ligne</p>
                    </div>
                    <div className="bg-[#111111] rounded-3xl p-4 border border-white/5 text-center shadow-xl">
                        <p className="text-2xl font-black text-purple-400 leading-none">{stats.countries}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Pays</p>
                    </div>
                </section>

                <div className="space-y-4">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-1">Membres Récents</h2>
                    
                    {isLoadingData ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-5 flex items-center gap-4 bg-[#111111]/50 rounded-[2.5rem] border border-white/5">
                                    <div className="h-14 w-14 rounded-full bg-slate-900 border border-white/5 animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/2 bg-slate-900 rounded animate-pulse" />
                                        <div className="h-3 w-1/3 bg-slate-900 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredClassmates.length > 0 ? (
                        <div className="grid gap-4 animate-in fade-in duration-700">
                            {filteredClassmates.map((member, i) => {
                                const domainInfo = CATEGORIES.find(c => c.id === member.interestDomain) || CATEGORIES[0];
                                
                                return (
                                    <div key={member.uid} className="bg-[#111111] rounded-[2.5rem] p-4 border border-white/5 flex items-center gap-4 shadow-xl active:scale-[0.97] transition-all group">
                                        <div className="relative flex-shrink-0">
                                            <div className="h-14 w-14 rounded-full border-2 border-white/10 shadow-2xl overflow-hidden bg-slate-900">
                                                <img src={`https://i.pravatar.cc/150?img=${i + 15}`} alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            {member.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-black shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-white text-base truncate group-hover:text-primary transition-colors">{member.fullName}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className={`border px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${domainInfo.color || 'bg-slate-900 text-slate-400 border-white/10'}`}>
                                                    {member.interestDomain || 'Apprenant'}
                                                </span>
                                                <span className="text-[11px] flex items-center gap-1 font-bold text-slate-500">
                                                    <span>{getFlagEmoji(member.countryCode)}</span>
                                                    <span className="uppercase tracking-tighter truncate max-w-[80px]">{member.countryName || 'Afrique'}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 hover:bg-primary text-primary hover:text-black transition-all shadow-lg border border-primary/20 shrink-0"
                                            onClick={() => handleContact(member.uid)}
                                            disabled={isContacting === member.uid}
                                        >
                                            {isContacting === member.uid ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center flex flex-col items-center opacity-30 animate-in zoom-in duration-500">
                            <Users className="h-16 w-16 mb-4 text-slate-600" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Aucun membre</h3>
                            <p className="text-sm font-medium text-slate-500 mt-2 max-w-[220px] mx-auto">
                                Aucun camarade ne correspond à vos critères de recherche.
                            </p>
                        </div>
                    )}
                </div>

                <section className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-4">
                    <Globe className="h-10 w-10 text-primary mx-auto opacity-50" />
                    <h3 className="text-lg font-black text-primary uppercase tracking-tight">Le Savoir se partage</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                        N'hésitez pas à contacter vos collègues pour échanger sur vos cours ou collaborer sur des projets réels.
                    </p>
                </section>
            </main>
        </div>
    );
}
