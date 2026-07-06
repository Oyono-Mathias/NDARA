import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

refund_logic = """
  const handleRefundPayment = async (txRef: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rembourser cette transaction ?")) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` },
        body: JSON.stringify({ txRef, reason: 'Demande utilisateur' })
      });
      const data = await response.json();
      if (response.ok && data.success) {
         setPayments(prev => prev.map(p => p.id === txRef ? { ...p, status: 'refunded' } : p));
      } else {
         alert(data.error || 'Erreur lors du remboursement');
      }
    } catch (e: any) {
      alert(e.message || "Erreur réseau");
    } finally {
      setProcessing(false);
    }
  };
"""

# Insert logic just before useEffect
if "handleRefundPayment" not in content:
    content = content.replace("useEffect(() => {", refund_logic + "\n  useEffect(() => {")

# Replace the HTML for success
replacement = """                             ) : isSuccess ? (
                               <div className="flex flex-col items-end gap-2">
                                 <span className="text-[10px] font-bold text-slate-500">{formatDate(p.createdAt)}</span>
                                 <button
                                   onClick={() => handleRefundPayment(p.id)}
                                   disabled={processing}
                                   className="flex items-center gap-1.5 h-6 px-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 font-black uppercase tracking-widest text-[9px] hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
                                 >
                                   <RefreshCw className="w-3 h-3" /> Rembourser
                                 </button>
                               </div>
                             ) : p.status === 'refunded' ? (
                                <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">Remboursé</span>
                             ) : ("""

content = re.sub(
    r"\) : \(\s*<span className=\"text-\[10px\] font-bold text-slate-500\">\{formatDate\(p\.createdAt\)\}</span\>\s*\)",
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
