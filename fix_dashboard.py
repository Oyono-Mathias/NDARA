import re

with open('src/views/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add states for wallet and transactions
state_inject = """
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
"""

content = content.replace('  const [loading, setLoading] = useState(true);', '  const [loading, setLoading] = useState(true);\n' + state_inject)

# Add listener for wallet and transactions inside useEffect
wallet_logic = """
        // Wallet listener
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists() && isMounted) {
            setWalletBalance(docSnap.data().balance || 0);
          }
        });
        
        // Recent transactions listener
        const txQuery = query(
          collection(db, 'users', currentUser.uid, 'transactions'),
          orderBy('timestamp', 'desc'),
          limit(3)
        );
        const unsubTx = onSnapshot(txQuery, (querySnap) => {
          if (isMounted) {
            setRecentTransactions(querySnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
        });
"""

# inject inside useEffect after `let isMounted = true;`
content = content.replace('        let isMounted = true;', '        let isMounted = true;\n' + wallet_logic)

cleanup_logic = """
      unsubUser();
      unsubTx();
"""

content = content.replace('            isMounted = false;\n        };\n    }, [currentUser]);', '            isMounted = false;\n' + cleanup_logic + '\n        };\n    }, [currentUser]);')


# Rendering the wallet in the Dashboard
render_wallet = """
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TouchArea 
              onClick={() => navigate('/student/wallet')}
              className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-400 font-medium">Solde Ndara</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">{walletBalance.toLocaleString()} <span className="text-sm font-normal text-emerald-500">FCFA</span></div>
              </div>
            </TouchArea>
"""

content = content.replace('          <div className="grid grid-cols-2 gap-4">', render_wallet)


# Remove one grid-cols-2 so it fits 4 cols
content = content.replace('grid-cols-2 gap-4', 'grid-cols-2 md:grid-cols-4 gap-4', 1)

# Ensure icons are imported. I see Sparkles is already imported.
# Let's add recent transactions section.
render_tx = """
            </div>

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Dernières transactions</h2>
                  <button onClick={() => navigate('/student/wallet')} className="text-sm text-emerald-400 hover:text-emerald-300">
                    Voir tout
                  </button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div>
                        <div className="text-white font-medium text-sm">{tx.description || tx.type}</div>
                        <div className="text-xs text-slate-400 mt-1">{new Date(tx.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} F
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
"""

content = re.sub(r'(</div>\s*</div>\s*</main>)', render_tx + r'\1', content)

with open('src/views/Dashboard.tsx', 'w') as f:
    f.write(content)
