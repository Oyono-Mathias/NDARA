import { useState, useEffect, useMemo } from 'react';
import { useRole } from '../../context/RoleContext';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    Wallet, 
    ArrowUpRight, 
    History, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Landmark,
    Smartphone,
    CreditCard,
    Loader2,
    ShoppingCart,
    Download,
    Wifi,
    Check,
    AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';

export function InstructorWealth() {
    const { currentUser: instructor, isUserLoading } = useRole();
    
    // Fallback locale if needed
    const tActions = (key: string) => key;

    const [payments, setPayments] = useState<any[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawMethod, setWithdrawMethod] = useState<'orange' | 'mtn' | 'wave'>('orange');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [phoneValue, setPhoneValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [loadingStates, setLoadingStates] = useState({ payments: true, payouts: true });

    useEffect(() => {
        if (!instructor?.uid) return;
        const instructorId = instructor.uid;

        const unsubPayments = onSnapshot(
            query(collection(db, 'payments'), where('instructorId', '==', instructorId), where('status', '==', 'Completed')),
            (snap) => {
                setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoadingStates(prev => ({ ...prev, payments: false }));
            }
        );

        const unsubPayouts = onSnapshot(
            query(collection(db, 'payout_requests'), where('instructorId', '==', instructorId), orderBy('createdAt', 'desc'), limit(50)),
            (snap) => {
                setPayoutRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoadingStates(prev => ({ ...prev, payouts: false }));
            }
        );

        return () => { unsubPayments(); unsubPayouts(); };
    }, [instructor?.uid]);

    const stats = useMemo(() => {
        const totalSalesEarned = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        const ambassadorAvailable = instructor?.affiliateBalance || 0;
        const totalPayouts = payoutRequests.filter(p => p.status !== 'rejected').reduce((acc, p) => acc + (p.amount || 0), 0);
        const availableBalance = (totalSalesEarned + ambassadorAvailable) - totalPayouts;
        return { totalSalesEarned, ambassadorAvailable, availableBalance: Math.max(0, availableBalance) };
    }, [payments, payoutRequests, instructor]);

    const handleRequestWithdrawal = async () => {
        if (!instructor) return;
        const amountNum = parseFloat(withdrawAmount);
        
        if (isNaN(amountNum) || amountNum < 5000) {
            alert('error.payout_min_amount');
            return;
        }
        
        if (amountNum > stats.availableBalance) {
            alert('error.insufficient_balance');
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'payout_requests'), {
                instructorId: instructor.uid,
                amount: amountNum,
                method: 'mobile_money',
                provider: withdrawMethod,
                phone: phoneValue,
                requesterId: instructor.uid,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            alert('success.payout_requested');
            setIsWithdrawModalOpen(false);
            setWithdrawAmount('');
        } catch (e) {
            console.error(e);
            alert('error.generic');
        } finally {
            setIsSubmitting(false);
        }
    };

    const historyItems = useMemo(() => {
        const p = payments.map(item => ({ 
            id: item.id, type: 'sale', title: `Vente: ${item.courseTitle || 'Formation'}`, 
            amount: item.amount, date: item.date?.toDate ? item.date.toDate() : new Date(), status: 'Completed' 
        }));
        const pr = payoutRequests.map(item => ({ 
            id: item.id, type: 'payout', title: `Retrait Mobile Money`, 
            amount: -item.amount, date: item.createdAt?.toDate ? item.createdAt.toDate() : new Date(), status: item.status 
        }));
        return [...p, ...pr].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [payments, payoutRequests]);

    if (isUserLoading) return <RevenueSkeleton />;

    return (
        <div className="flex flex-col gap-8 pb-32 bg-[#0f172a] min-h-screen relative overflow-hidden font-sans -m-4 md:-m-8 p-4 md:p-8">
            <div className="grain-overlay opacity-[0.04] pointer-events-none" />

            <header className="z-50 bg-[#0f172a]/95 backdrop-blur-md safe-area-pt border border-white/5 rounded-3xl -mx-4 mt-2 mb-2 p-6 md:mx-0">
                <div className="flex items-center justify-between">
                    <h1 className="font-black text-2xl text-white tracking-wide uppercase">Trésorerie</h1>
                    <button className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-gray-400 hover:text-white transition shadow-xl border border-white/5">
                        <Download size={18} />
                    </button>
                </div>
            </header>

            <main className="flex-1 space-y-8 animate-in fade-in duration-700">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-black text-white text-[10px] uppercase tracking-[0.3em]">Mon Portefeuille</h2>
                        <span className="text-[#10b981] text-[10px] font-black uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" /> Actif
                        </span>
                    </div>

                    <div 
                        className="bg-gradient-to-br from-[#1e293b] to-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative z-10 active:scale-[0.98] transition-all cursor-pointer group hover:border-primary/50"
                        onClick={() => setIsWithdrawModalOpen(true)}
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Solde Disponible</p>
                                    <h2 className="text-white font-black text-4xl tracking-tight">
                                        {stats.availableBalance.toLocaleString('fr-FR')} <span className="text-lg font-bold">FCFA</span>
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Ndara Elite</p>
                                    <Wifi className="text-white/70 h-8 w-8 mt-2 rotate-90" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">Expert Titulaire</p>
                                    <p className="text-white font-black text-sm uppercase tracking-widest">{instructor?.fullName || '---'}</p>
                                </div>
                                <div className="flex items-center gap-3"><CreditCard className="text-white h-8 w-8 opacity-90" /></div>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setIsWithdrawModalOpen(true)} className="flex items-center justify-center w-full h-16 rounded-[2.5rem] bg-[#10b981] hover:bg-[#34d399] text-[#0f172a] font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 animate-pulse-glow border-none">
                        <Landmark className="mr-2 h-5 w-5" />
                        Effectuer un Retrait
                    </button>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-white text-[10px] uppercase tracking-[0.3em]">Journal des flux</h3>
                        <History size={14} className="text-slate-600" />
                    </div>
                    <div className="space-y-4">
                        {loadingStates.payments || loadingStates.payouts ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-16 w-full rounded-2xl bg-[#1e293b] animate-pulse" />)
                        ) : historyItems.length > 0 ? historyItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                                        item.amount > 0 ? "bg-emerald-500/10 text-[#10b981]" : "bg-red-500/10 text-red-400"
                                    }`}>
                                        {item.type === 'sale' ? <ShoppingCart size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-sm truncate uppercase tracking-tight">{item.title}</p>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-0.5">{item.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`font-black text-sm mb-1 ${item.amount > 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                                        {item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()} F
                                    </p>
                                    <span className={`text-[8px] font-black uppercase border-none px-2 py-0.5 h-4 rounded-full ${
                                        item.status === 'Completed' || item.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                                        item.status === 'pending' || item.status === 'approved' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-500"
                                    }`}>
                                        {item.status === 'Completed' || item.status === 'paid' ? 'Succès' : item.status === 'pending' ? 'Audit' : item.status === 'approved' ? 'Prêt' : 'Rejeté'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center opacity-40">
                                <AlertCircle size={40} className="mx-auto mb-3 text-slate-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucun mouvement</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-white/5 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
                        <div className="p-8 pb-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Retrait Mobile Money</h2>
                            <p className="text-gray-400 font-medium italic text-sm mt-2">Retirez vos gains vers votre compte personnel.</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-950 rounded-3xl p-5 border border-white/5 text-center shadow-inner">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Disponible pour virement</p>
                                <p className="text-3xl font-black text-[#10b981]">{stats.availableBalance.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fournisseur</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <ProviderBtn active={withdrawMethod === 'orange'} onClick={() => setWithdrawMethod('orange')} label="Orange" color="bg-orange-500" />
                                    <ProviderBtn active={withdrawMethod === 'mtn'} onClick={() => setWithdrawMethod('mtn')} label="MTN" color="bg-yellow-500" />
                                    <ProviderBtn active={withdrawMethod === 'wave'} onClick={() => setWithdrawMethod('wave')} label="Wave" color="bg-blue-500" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Numéro de téléphone</label>
                                <input 
                                    type="tel" 
                                    placeholder="+236 ..." 
                                    value={phoneValue} 
                                    onChange={(e) => setPhoneValue(e.target.value)} 
                                    className="w-full h-14 px-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-mono text-lg focus:outline-none focus:ring-1 focus:ring-primary/50" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Montant à retirer</label>
                                <input 
                                    type="number" 
                                    placeholder="5000" 
                                    value={withdrawAmount} 
                                    onChange={(e) => setWithdrawAmount(e.target.value)} 
                                    className="w-full h-14 px-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-black text-xl focus:outline-none focus:ring-1 focus:ring-primary/50" 
                                />
                            </div>
                        </div>
                        <div className="p-8 bg-slate-950/50 border-t border-white/5 flex gap-3 rounded-b-[2.5rem]">
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:text-white hover:bg-white/5 transition uppercase text-[10px] tracking-widest">
                                Annuler
                            </button>
                            <button 
                                onClick={handleRequestWithdrawal} 
                                disabled={isSubmitting || !phoneValue || !withdrawAmount || stats.availableBalance < 5000} 
                                className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-[#10b981] hover:bg-[#34d399] text-[#0f172a] font-black uppercase text-[10px] tracking-widest shadow-xl transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Check size={16} className="mr-2" />} Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProviderBtn({ active, onClick, label, color }: any) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 gap-1 ${active ? "border-[#10b981] bg-[#10b981]/5" : "border-transparent bg-slate-950 grayscale opacity-50 hover:opacity-80"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[10px] ${color}`}>{label.charAt(0)}</div>
            <span className="text-[8px] font-black text-white uppercase">{label}</span>
        </button>
    );
}

function RevenueSkeleton() {
    return (
        <div className="p-6 space-y-8 min-h-screen bg-[#0f172a] -m-4 md:-m-8 md:p-8">
            <div className="h-10 w-1/2 bg-slate-800 rounded animate-pulse" />
            <div className="h-56 w-full rounded-[2.5rem] bg-slate-800 animate-pulse" />
            <div className="space-y-4">
                <div className="h-24 w-full rounded-[2.5rem] bg-slate-800 animate-pulse" />
                <div className="h-24 w-full rounded-[2.5rem] bg-slate-800 animate-pulse" />
            </div>
        </div>
    );
}
