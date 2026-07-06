import re

with open('src/views/Ambassador.tsx', 'r') as f:
    content = f.read()

history_state = """    const [userProfile, setUserProfile] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);"""

if 'const [transactions, setTransactions]' not in content:
    content = content.replace('    const [userProfile, setUserProfile] = useState<any>(null);', history_state)

history_effect = """            if (snap.exists()) {
                setUserProfile(snap.data());
            }
        });

        const q = query(collection(db, "users", currentUser.uid, "transactions"), orderBy("timestamp", "desc"), limit(20));
        const unsubTx = onSnapshot(q, (snap) => {
            const txs: any[] = [];
            snap.forEach(doc => txs.push({ id: doc.id, ...doc.data() }));
            setTransactions(txs.filter(t => t.type === 'affiliate_payout'));
        });

        return () => { unsubUser(); unsubTx(); };
    }, [currentUser?.uid]);"""

if 'const unsubTx = onSnapshot' not in content:
    content = content.replace(
        """            if (snap.exists()) {
                setUserProfile(snap.data());
            }
        });

        return () => unsubUser();
    }, [currentUser?.uid]);""",
        history_effect
    )

history_ui = """
                <div className="bg-[#111111] rounded-[2.5rem] p-6 border border-white/5 shadow-xl space-y-6">
                    <h3 className="font-black text-white text-xs uppercase tracking-widest mb-4">Historique Détaillé</h3>
                    {transactions.length === 0 ? (
                        <p className="text-slate-500 text-xs text-center">Aucune transaction trouvée.</p>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl bg-black border border-white/5">
                                    <div className="flex-1">
                                        <p className="text-white text-[11px] font-bold">{tx.description || 'Gains affilié'}</p>
                                        <p className="text-slate-500 text-[9px] uppercase tracking-wider">{new Date(tx.timestamp).toLocaleDateString()} • {tx.status === 'pending' ? 'En attente' : tx.status === 'completed' ? 'Validé' : 'Échoué'}</p>
                                    </div>
                                    <div className={`text-sm font-black ${tx.amount > 0 ? 'text-primary' : 'text-white'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount} XAF
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
"""

if 'Historique Détaillé' not in content:
    content = content.replace(
        '            </main>',
        history_ui
    )

with open('src/views/Ambassador.tsx', 'w') as f:
    f.write(content)

