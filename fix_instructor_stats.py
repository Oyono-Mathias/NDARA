import re

with open('src/views/instructor/InstructorWealth.tsx', 'r') as f:
    content = f.read()

replacement = """        <div className="space-y-4">
          <h2 className="font-black text-white text-[10px] uppercase tracking-[0.3em] px-1 mt-8">
              Statistiques de Ventes
          </h2>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Total Ventes</p>
                  <p className="text-xl font-black text-white">{payments.length}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Revenus Numériques</p>
                  <p className="text-xl font-black text-[#10b981]">{stats.totalSalesEarned.toLocaleString('fr-FR')} F</p>
              </div>
          </div>
          <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden mt-4">
              <div className="p-4 border-b border-white/5">
                 <h3 className="text-white text-xs font-black uppercase tracking-widest">Dernières ventes</h3>
              </div>
              <div className="divide-y divide-white/5">
                 {payments.length > 0 ? payments.slice(0, 10).map(tx => (
                     <div key={tx.id} className="p-4 flex items-center justify-between">
                         <div>
                             <p className="text-sm font-bold text-white truncate">{tx.description || tx.type}</p>
                             <p className="text-[10px] font-medium text-slate-500">{new Date(tx.timestamp || tx.createdAt).toLocaleDateString('fr-FR')} - ID: {tx.userId?.substring(0,6)}</p>
                         </div>
                         <div className="text-emerald-400 font-black text-sm">+{tx.amount.toLocaleString('fr-FR')} F</div>
                     </div>
                 )) : (
                     <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Aucune vente enregistrée</div>
                 )}
              </div>
          </div>
        </div>

        {/* Existing Historique Retraits */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between px-1">
"""

content = content.replace(
    """        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">""",
    replacement,
    1 # replace only the second occurence which is "Historique des Retraits", wait let me check the file structure
)

with open('src/views/instructor/InstructorWealth.tsx', 'w') as f:
    f.write(content)
