import { useMemo, useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useRole } from '../context/RoleContext';
import { 
    CreditCard, 
    CheckCircle2, 
    XCircle, 
    ArrowUpRight, 
    ShoppingBag, 
    BadgeEuro, 
    Clock,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
// Dummy OperatorLogo for now, fallback to simple initials
const OperatorLogo = ({ operatorName, size, className }: any) => (
    <div className={cn('rounded-full bg-slate-800 flex items-center justify-center font-bold text-white', className)} style={{ width: size, height: size, fontSize: size / 2.5 }}>
        {operatorName?.substring(0, 2).toUpperCase() || 'TX'}
    </div>
);

type Payment = {
    id: string;
    userId: string;
    date: any;
    status: string;
    type: string;
    metadata?: any;
    provider?: string;
    courseTitle?: string;
    amount: number;
    isSimulated?: boolean;
};

export function PaymentsView() {
  const { isUserLoading } = useRole();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [rawPayments, setRawPayments] = useState<Payment[]>([]);
  const [rawPayouts, setRawPayouts] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [payoutsLoading, setPayoutsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
        if (user) {
            setCurrentUser(user);
            
            const qPayments = query(collection(db, 'payments'), where('userId', '==', user.uid));
            const unsubPayments = onSnapshot(qPayments, (snap) => {
                setRawPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);
                setPaymentsLoading(false);
            }, () => setPaymentsLoading(false));

            const qPayouts = query(collection(db, 'payout_requests'), where('instructorId', '==', user.uid));
            const unsubPayouts = onSnapshot(qPayouts, (snap) => {
                setRawPayouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setPayoutsLoading(false);
            }, () => setPayoutsLoading(false));

            return () => {
                unsubPayments();
                unsubPayouts();
            };
        } else {
            setCurrentUser(null);
            setRawPayments([]);
            setRawPayouts([]);
            setPaymentsLoading(false);
            setPayoutsLoading(false);
        }
    });

    return () => unsubAuth();
  }, []);

  const payments = useMemo(() => {
    if (!rawPayments) return [];
    return [...rawPayments].sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date || 0);
        const dateB = b.date?.toDate?.() || new Date(b.date || 0);
        return dateB.getTime() - dateA.getTime();
    });
  }, [rawPayments]);

  const payouts = useMemo(() => {
    if (!rawPayouts) return [];
    return [...rawPayouts].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
    });
  }, [rawPayouts]);

  const isLoading = isUserLoading || paymentsLoading || payoutsLoading;

  return (
    <div className="flex flex-col gap-8 pb-24 bg-slate-950 min-h-screen relative overflow-hidden">
      <header className="px-6 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 text-amber-500 mb-2">
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mon Portefeuille</span>
        </div>
        <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">Registre <br/><span className="text-amber-500">Financier</span></h1>
      </header>

      <div className="w-full">
        <div className="flex w-full bg-transparent border-b border-slate-800 h-12 px-6 justify-start gap-8">
          <button 
            onClick={() => setActiveTab('all')}
            className={cn("border-b-2 h-full px-0 font-black text-[10px] uppercase tracking-widest transition-colors", activeTab === 'all' ? "text-amber-500 border-amber-500" : "text-slate-500 border-transparent")}
          >
            TOUT
          </button>
          <button 
            onClick={() => setActiveTab('purchases')}
            className={cn("border-b-2 h-full px-0 font-black text-[10px] uppercase tracking-widest transition-colors", activeTab === 'purchases' ? "text-amber-500 border-amber-500" : "text-slate-500 border-transparent")}
          >
            ACHATS
          </button>
          <button 
            onClick={() => setActiveTab('payouts')}
            className={cn("border-b-2 h-full px-0 font-black text-[10px] uppercase tracking-widest transition-colors", activeTab === 'payouts' ? "text-amber-500 border-amber-500" : "text-slate-500 border-transparent")}
          >
            RETRAITS
          </button>
        </div>

        <main className="px-6 mt-8">
          {activeTab === 'all' && (
             <div className="m-0 space-y-4">
                {isLoading ? <ListSkeleton /> : payments.length > 0 ? (
                    payments.map(p => <div key={p.id}><PaymentItem payment={p} /></div>)
                ) : <EmptyState icon={ShoppingBag} text="Aucun mouvement enregistré" />}
             </div>
          )}

          {activeTab === 'purchases' && (
             <div className="m-0 space-y-4">
                {isLoading ? <ListSkeleton /> : payments.filter(p => p.type === 'course_purchase').length > 0 ? (
                    payments.filter(p => p.type === 'course_purchase').map(p => <div key={p.id}><PaymentItem payment={p} /></div>)
                ) : <EmptyState icon={ShoppingBag} text="Aucune formation achetée" />}
             </div>
          )}

          {activeTab === 'payouts' && (
             <div className="m-0 space-y-4">
                 {isLoading ? <ListSkeleton /> : payouts.length > 0 ? (
                    payouts.map((p: any) => <div key={p.id}><PayoutItem payout={p} /></div>)
                ) : <EmptyState icon={BadgeEuro} text="Aucune demande de retrait" />}
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PaymentItem({ payment }: { payment: Payment }) {
  const date = payment.date?.toDate?.() || new Date(payment.date || 0);
  
  const statusConfig = (({
    completed: { label: 'Réussi', class: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
    pending: { label: 'En attente', class: 'bg-amber-500/10 text-amber-500 animate-pulse', icon: Clock },
    failed: { label: 'Échoué', class: 'bg-red-500/10 text-red-500', icon: XCircle },
    refunded: { label: 'Remboursé', class: 'bg-slate-800 text-slate-400', icon: AlertCircle },
  } as any)[payment.status?.toLowerCase() || 'pending'] || { label: payment.status, class: 'bg-slate-800', icon: Clock });

  const opName = payment.metadata?.operator || payment.provider;

  return (
    <div className={cn(
        "bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl active:scale-[0.98] transition-all",
        payment.isSimulated && "border-amber-500/20 bg-amber-500/[0.02]"
    )}>
      <div className="p-5 flex justify-between items-center">
        <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <OperatorLogo operatorName={opName} size={42} className="bg-slate-950 p-1" />
            </div>
            <div className="min-w-0">
                <h3 className="text-[13px] font-black text-white uppercase truncate tracking-tight">
                    {payment.courseTitle || (payment.type === 'wallet_topup' ? 'Recharge Wallet' : 'Transaction')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        {format(date, 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </span>
                </div>
            </div>
        </div>
        
        <div className="text-right shrink-0">
            <p className={cn("text-base font-black mb-1", payment.status?.toLowerCase() === 'completed' ? "text-emerald-400" : "text-white")}>
                {payment.amount.toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">F</span>
            </p>
            <span className={cn("text-[8px] font-black uppercase inline-flex items-center justify-center px-3 py-1 rounded-full", statusConfig.class)}>
                {statusConfig.label}
            </span>
        </div>
      </div>
    </div>
  );
}

function PayoutItem({ payout }: { payout: any }) {
    const date = payout.createdAt?.toDate?.() || new Date(payout.createdAt || 0);
    
    const statusConfig = (({
        pending: { label: 'En attente', class: 'bg-amber-500/10 text-amber-500 animate-pulse' },
        approved: { label: 'Validé', class: 'bg-blue-500/10 text-blue-400' },
        paid: { label: 'Versé', class: 'bg-emerald-500/10 text-emerald-500' },
        rejected: { label: 'Rejeté', class: 'bg-red-500/10 text-red-500' },
    } as any)[payout.status?.toLowerCase() || 'pending'] || { label: payout.status, class: 'bg-slate-800', textColor: 'text-white' } as any);

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                        <ArrowUpRight className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-black text-white text-[13px] uppercase tracking-tight">Retrait expert</p>
                        <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                            {format(date, 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base font-black text-red-400">-{payout.amount.toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">F</span></p>
                    <span className={cn("text-[8px] font-black uppercase inline-flex items-center justify-center px-3 py-1 rounded-full mt-1", statusConfig.class)}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, text }: any) {
    return (
        <div className="py-24 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30 mt-6">
            <Icon className="h-16 w-16 mx-auto mb-4 text-slate-700" />
            <p className="font-black uppercase tracking-widest text-xs text-slate-600">{text}</p>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 w-full rounded-[2rem] bg-slate-900 animate-pulse border border-slate-800" />)}
        </div>
    );
}
