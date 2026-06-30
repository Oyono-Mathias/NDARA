import { 
    Users, 
    ArrowUpRight, 
    Copy, 
    Check, 
    MousePointer2, 
    ShoppingCart, 
    Medal,
    Wallet,
    MessageCircle,
    Facebook,
    Twitter,
    Linkedin,
    Sparkles,
    Crown,
    Lightbulb,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from "../firebase";
import { useRole } from '../context/RoleContext';

import { TopAppBar } from "../components/ui/TopAppBar";

export function AmbassadorView() {
    const { currentUser } = useRole();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawMethod, setWithdrawMethod] = useState<'orange' | 'mtn' | 'wave'>('orange');
    const [phoneValue, setPhoneValue] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
            if (snap.exists()) {
                setUserProfile(snap.data());
            }
        });
        return () => unsubUser();
    }, [currentUser?.uid]);

    useEffect(() => {
        if (!currentUser?.uid) {
            setLoadingData(false);
            return;
        }
        
        // Fetch actual leaderboard
        const unsubLeader = onSnapshot(
            query(
                collection(db, 'users'),
                where('affiliateBalance', '>', 0), // Adjust query
                orderBy('affiliateBalance', 'desc'),
                limit(5)
            ), 
            (snap) => {
                if (!snap.empty) {
                    setLeaderboard(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
                } else {
                    setLeaderboard([]);
                }
                setLoadingData(false);
            }
        );
        return () => unsubLeader();
    }, [currentUser?.uid]);

    const activeProfile = userProfile || currentUser;
    const shareUrl = `${window.location.origin}/invite-short/${activeProfile?.username || currentUser?.uid || ''}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const balance = activeProfile?.affiliateBalance || 0;

    const handleWithdraw = async () => {
        if (!currentUser?.uid) return;
        if (balance < 5000) {
            alert("Le retrait minimum est de 5 000 XOF.");
            return;
        }
        if (!phoneValue || phoneValue.length < 8) {
            alert("Veuillez saisir votre numéro Mobile Money.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/wallet/request-payout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    amount: balance, // complete withdraw of affiliate balance
                    provider: withdrawMethod,
                    phone: phoneValue,
                    method: 'mobile_money'
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Échec de l'envoi de la demande.");
            }

            alert("Demande envoyée ! Votre virement sera traité sous 48h par nos vérificateurs.");
            setIsWithdrawModalOpen(false);
            setPhoneValue("");
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Erreur technique lors du retrait.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = activeProfile?.affiliateStats || { clicks: 0, registrations: 0, sales: 0, earnings: 0 };

    return (
        <div className="flex flex-col gap-8 pb-32 min-h-screen relative overflow-hidden bg-black max-w-3xl mx-auto w-full">
            <TopAppBar title="Ambassadeur" showBack={true} transparent rightAction={
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1">
                    <Medal className="h-4 w-4 text-primary" />
                 </div>
            } />

            <main className="flex-1 px-4 pt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- NEO-BANK CARD --- */}
                <div 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="bg-gradient-to-br from-[#10b981] via-[#047857] to-[#065f46] rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] group active:scale-[0.98] transition-all cursor-pointer"
                >
                    <div className="absolute -right-6 -top-6 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Gains Disponibles</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl font-black text-white leading-none">{(activeProfile?.affiliateBalance || 0).toLocaleString('fr-FR')}</h2>
                                    <span className="text-sm font-bold text-white/70 uppercase">XAF</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Wallet className="h-7 w-7 text-white" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-emerald-100 text-[9px] font-bold uppercase tracking-widest opacity-60">Ce mois</p>
                                <p className="text-white text-base font-black">+{stats.earnings?.toLocaleString('fr-FR')} XAF</p>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-100 text-[9px] font-bold uppercase tracking-widest opacity-60">En sécurisation</p>
                                <p className="text-white text-sm font-bold">{(currentUser?.pendingAffiliateBalance || 0).toLocaleString('fr-FR')} XAF</p>
                            </div>
                        </div>

                        <button className="w-full h-14 flex items-center justify-center rounded-3xl bg-white text-[#047857] hover:bg-slate-50 font-black uppercase text-[11px] tracking-widest shadow-xl border-none transition-colors">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Virement Mobile Money
                        </button>
                    </div>
                </div>

                <div className="bg-[#111111] rounded-[2.5rem] p-6 border border-white/5 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-white text-xs uppercase tracking-widest">Mon Lien Viral</h3>
                        <span className="bg-primary/10 text-primary rounded-sm text-[8px] font-black uppercase px-2 py-0.5">Actif</span>
                    </div>

                    <div className="bg-black rounded-2xl p-3 border border-white/10 flex items-center justify-between group active:scale-95 transition-all cursor-pointer" onClick={handleCopyLink}>
                        <span className="text-[11px] font-mono text-slate-500 truncate flex-1 pr-4">{shareUrl}</span>
                        <div className="h-10 px-4 rounded-xl bg-primary text-black flex items-center justify-center text-[10px] font-black uppercase tracking-widest shrink-0">
                            {isCopied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                            Copier
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        <ShareCircle icon={MessageCircle} color="bg-[#25D366]" href={`https://wa.me/?text=${encodeURIComponent("Rejoins-moi sur Ndara Afrique ! 🚀 " + shareUrl)}`} />
                        <ShareCircle icon={Facebook} color="bg-[#1877F2]" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} />
                        <ShareCircle icon={Twitter} color="bg-white text-black" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Ma quête du savoir commence ici.")}&url=${encodeURIComponent(shareUrl)}`} />
                        <ShareCircle icon={Linkedin} color="bg-[#0A66C2]" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} />
                    </div>
                </div>

                <section className="grid grid-cols-3 gap-3">
                    <StatPill icon={MousePointer2} label="Clics" value={stats.clicks} color="text-blue-400" bgColor="bg-blue-500/10 border-blue-500/20" />
                    <StatPill icon={Users} label="Inscrits" value={stats.registrations} color="text-primary" bgColor="bg-primary/10 border-primary/20" />
                    <StatPill icon={ShoppingCart} label="Ventes" value={stats.sales} color="text-orange-400" bgColor="bg-orange-500/10 border-orange-500/20" />
                </section>

                <div className="bg-[#111111] rounded-[2.5rem] p-6 border border-white/5 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            Booster mes Revenus
                        </h3>
                        <span className="text-primary text-[10px] font-black">Niveau 1/3</span>
                    </div>

                    <div className="space-y-5">
                        <BonusTier label="5 ventes → +2%" target={5} current={stats.sales} />
                        <BonusTier label="20 ventes → +5%" target={20} current={stats.sales} />
                        <BonusTier label="50 ventes → +10%" target={50} current={stats.sales} />
                    </div>
                </div>

                <div className="bg-[#111111] rounded-[2.5rem] p-6 border border-white/5 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                            <Crown size={14} className="text-yellow-500" />
                            Top Ambassadeurs
                        </h3>
                        <button className="text-primary text-[10px] font-black uppercase tracking-widest">Voir tout</button>
                    </div>

                    <div className="space-y-3">
                        {loadingData ? (
                            <div className="text-center text-sm font-bold text-gray-500 py-4">Chargement...</div>
                        ) : leaderboard.map((user, idx) => (
                            <div key={user.uid} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${idx === 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-black/50 border-white/5"}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-500"}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{user.fullName}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? "text-yellow-500" : "text-primary"}`}>
                                        {user.affiliateStats?.earnings?.toLocaleString('fr-FR')} XAF
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-600 text-[8px] font-black uppercase">Ventes</p>
                                    <p className="text-sm font-black text-white">{user.affiliateStats?.sales}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-[2.5rem] p-6 flex items-start gap-4">
                    <div className="p-2 bg-orange-500/20 rounded-xl shrink-0">
                        <Lightbulb className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Astuce du Jour</h4>
                        <p className="text-xs text-slate-400 leading-relaxed italic">"Partagez votre lien dans les groupes WhatsApp d'étudiants. Les taux de conversion sont 3x plus élevés !"</p>
                    </div>
                </div>

            </main>

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsWithdrawModalOpen(false)} />
                    <div className="relative bg-[#111111] border border-white/5 rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Retrait Mobile Money</h2>
                            <p className="text-slate-400 font-medium italic text-xs">Recevez vos gains instantanément.</p>
                        </div>
                        
                        <div className="p-8 pt-4 space-y-6">
                            <div className="bg-black rounded-3xl p-5 border border-white/5 text-center">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Montant transférable</p>
                                <p className="text-3xl font-black text-primary">{(activeProfile?.affiliateBalance || 0).toLocaleString('fr-FR')} XAF</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Méthode de versement</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <ProviderBtn active={withdrawMethod === 'orange'} onClick={() => setWithdrawMethod('orange')} label="Orange" color="bg-orange-500 text-white" />
                                    <ProviderBtn active={withdrawMethod === 'mtn'} onClick={() => setWithdrawMethod('mtn')} label="MTN" color="bg-yellow-500 text-black" />
                                    <ProviderBtn active={withdrawMethod === 'wave'} onClick={() => setWithdrawMethod('wave')} label="Wave" color="bg-blue-500 text-white" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Numéro de téléphone</label>
                                <input 
                                    type="tel" 
                                    placeholder="+237 ..." 
                                    value={phoneValue}
                                    onChange={(e) => setPhoneValue(e.target.value)}
                                    className="w-full h-14 bg-black border border-white/5 focus:border-primary/50 outline-none rounded-2xl px-4 text-white font-mono text-base transition-colors" 
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-black/50 border-t border-white/5 flex gap-3">
                            <button 
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="flex-1 h-14 rounded-[2rem] bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-widest transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleWithdraw}
                                disabled={isSubmitting || (activeProfile?.affiliateBalance || 0) < 5000}
                                className="flex-[2] h-14 rounded-[2rem] bg-primary hover:bg-primary/90 text-black font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Check className="mr-2 h-4 w-4" />}
                                Valider le retrait
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatPill({ icon: Icon, label, value, color, bgColor }: any) {
    return (
        <div className={`p-4 rounded-3xl text-center space-y-2 border shadow-xl ${bgColor}`}>
            <Icon className={`h-5 w-5 mx-auto ${color}`} />
            <p className="text-xl font-black text-white leading-none">{value}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function ShareCircle({ icon: Icon, color, href }: any) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform ${color}`}>
            <Icon size={20} />
        </a>
    );
}

function BonusTier({ label, target, current }: any) {
    const progress = Math.min(100, (current / target) * 100);
    const reached = current >= target;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className={reached ? "text-primary" : "text-slate-500"}>{label}</span>
                <span className="text-white">{current}/{target}</span>
            </div>
            <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className={`h-full rounded-full transition-all duration-1000 ${reached ? "bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-primary/30"}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

function ProviderBtn({ active, onClick, label, color }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 gap-2
                ${active ? "border-primary bg-primary/10" : "border-transparent bg-gray-900 grayscale opacity-60 hover:opacity-100"}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] ${color}`}>
                {label.charAt(0)}
            </div>
            <span className="text-[8px] font-black text-white uppercase">{label}</span>
        </button>
    );
}

