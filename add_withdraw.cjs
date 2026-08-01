const fs = require('fs');
let content = fs.readFileSync('src/views/Wallet.tsx', 'utf-8');

const regex1 = /activeModal === 'recharge' \? 'Recharger mon Wallet' :/;
const replacement1 = `activeModal === 'recharge' ? 'Recharger mon Wallet' :\n          activeModal === 'withdraw' ? 'Retirer des fonds' :`;

content = content.replace(regex1, replacement1);

const regex2 = /const \[activeModal, setActiveModal\] = useState<"none" | "send" | "receive" | "recharge" | "sandbox" | "detail">/;
const replacement2 = `const [activeModal, setActiveModal] = useState<"none" | "send" | "receive" | "recharge" | "withdraw" | "sandbox" | "detail">`;

content = content.replace(regex2, replacement2);

const regex3 = /<span className="text-\[10px\] font-black uppercase text-slate-400 tracking-wider">Recharger<\/span>\s*<\/button>/;
const replacement3 = `<span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recharger</span>
        </button>
        
        <button 
          onClick={() => { setActiveModal('withdraw'); setActionStatus(null); }} 
          className="flex flex-col items-center gap-2 py-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl active:scale-95 transition-all hover:bg-white/5 hover:border-white/10 group"
        >
          <div className="w-12 h-12 rounded-[16px] bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Minus className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Retirer</span>
        </button>`;
        
content = content.replace(regex3, replacement3);

// add the handleWithdraw
const regex4 = /const handleRecharge = async \(e: React\.FormEvent\) => \{/;
const replacement4 = `const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !rechargeAmount || Number(rechargeAmount) <= 0) return;
    
    // Check if enough balance
    if (Number(rechargeAmount) > walletBalances.availableBalance) {
        setActionStatus({ type: "error", text: "Solde insuffisant" });
        return;
    }
    
    setSubmitting(true);
    setActionStatus(null);
    try {
      await addDoc(collection(db, 'payout_requests'), {
        userId,
        amount: Number(rechargeAmount),
        currency: 'XAF',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      // also create a wallet_holds
      await addDoc(collection(db, 'wallet_holds'), {
        userId,
        amount: Number(rechargeAmount),
        reason: 'Demande de retrait',
        status: 'active',
        createdAt: serverTimestamp()
      });
      // Update available balance via cloud function or transaction locally
      await updateDoc(doc(db, 'users', userId), {
          walletBalance: walletBalances.availableBalance - Number(rechargeAmount)
      });
      setActionStatus({ type: "success", text: \`Demande de retrait de \${Number(rechargeAmount).toLocaleString()} F envoyée !\` });
      setRechargeAmount("");
      setTimeout(() => setActiveModal("none"), 1500);
    } catch (err: any) {
      setActionStatus({ type: "error", text: err.message || "Erreur de retrait" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {`;
content = content.replace(regex4, replacement4);

// add the Withdraw form
const regex5 = /\{\/\* SEND FORM \*\/\}/;
const replacement5 = `{/* WITHDRAW FORM */}
            {activeModal === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="text-center py-4"> 
                   <p className="text-xs text-slate-400 font-medium">Montant à retirer (Max: {walletBalances.availableBalance.toLocaleString()} F)</p>
                   <div className="flex items-center justify-center gap-2 mt-2">
                     <input
                       type="number"
                       required
                       max={walletBalances.availableBalance}
                       placeholder="0"
                       value={rechargeAmount}
                       onChange={e => setRechargeAmount(e.target.value)}
                       className="w-48 text-center bg-transparent border-none text-4xl font-black text-white focus:outline-none placeholder:text-slate-800"
                     />
                     <span className="text-xl font-bold bg-red-500/20 text-red-500 px-3 py-1 rounded-xl">XOF</span>
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 rounded-2xl bg-red-500 text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4 cursor-pointer hover:bg-red-600"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Demander le retrait
                </button>
              </form>
            )}
            
            {/* SEND FORM */}`;
content = content.replace(regex5, replacement5);

fs.writeFileSync('src/views/Wallet.tsx', content);
