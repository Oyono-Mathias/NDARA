import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

# Replace payouts with payout_requests
content = content.replace("collection(db, 'payouts')", "collection(db, 'payout_requests')")

# Fix handleValidatePayout to call the API
new_validate = """
  const handleValidatePayout = async (payout: any) => {
    if (!window.confirm(`Approuver ce retrait de ${payout.amount} XAF et déduire les fonds ?`)) return;
    setIsProcessing(payout.id);
    try {
      const auth = await import('../../firebase').then(m => m.auth);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/wallet/approve-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId: payout.id, status: 'completed' })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Retrait approuvé avec succès !');
    } catch (e: any) {
      console.error(e);
      alert('Erreur: ' + e.message);
    } finally {
      setIsProcessing(null);
    }
  };
"""

content = re.sub(r'const handleValidatePayout = async.*?};', new_validate, content, flags=re.DOTALL)

# Fix handleRejectPayout to call the API
new_reject = """
  const handleRejectPayout = async (payoutId: string) => {
    if (!window.confirm('Rejeter ce retrait ? Les fonds seront recrédités.')) return;
    setIsProcessing(payoutId);
    try {
      const auth = await import('../../firebase').then(m => m.auth);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/wallet/approve-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId: payoutId, status: 'rejected' })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Retrait rejeté et remboursé !');
    } catch (e: any) {
      console.error(e);
      alert('Erreur: ' + e.message);
    } finally {
      setIsProcessing(null);
    }
  };
"""

content = re.sub(r'const handleRejectPayout = async.*?};', new_reject, content, flags=re.DOTALL)

with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
