import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store, BookOpen, Layers, ShieldX, CheckCircle, Trash2, Search, ArrowLeftRight, FileText, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

export function AdminMarketControl() {
  const [activeTab, setActiveTab] = useState<'pending' | 'bourse'>('pending');
  
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    // 1. Pending Market Items (Ebooks, Templates, etc.)
    const qItems = query(
      collection(db, 'market_items'),
      where('status', '==', 'pending')
    );
    const unsubItems = onSnapshot(qItems, (snap) => {
      setMarketItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    // 2. Bourse Orders
    const qOrders = query(collection(db, 'market_orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubItems();
      unsubOrders();
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'market_items', id), { status: newStatus });
      setStatusMsg({ type: 'success', text: `Élément ${newStatus === 'approved' ? 'approuvé' : 'rejeté'} avec succès.` });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: `Erreur lors de la modification du statut.` });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Annuler cet ordre de la Bourse P2P ? La licence restera chez son propriétaire.")) return;
    try {
      await deleteDoc(doc(db, 'market_orders', orderId));
      setStatusMsg({ type: 'success', text: `Ordre supprimé avec succès.` });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: `Erreur lors de l'annulation de l'ordre.` });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 font-sans">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
           <div className="h-14 w-full md:w-96 bg-slate-800/50 rounded-2xl animate-pulse"></div>
           <div className="h-14 flex-1 bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <NdaraSkeleton type="table" />
      </div>
    );
  }

  const renderDigitalAssets = () => {
    const filtered = marketItems.filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (marketItems.length === 0) {
       return (
          <div className="mt-8">
              <EmptyState title="Tout est propre" message="Aucun élément en attente de modération ou d'action." icon={CheckCircle} />
          </div>
       );
    }

    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                   <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ressource</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendeur</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                   <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
             </thead>
             <tbody className="text-sm divide-y divide-slate-800">
               {filtered.length > 0 ? filtered.map(item => (
                 <tr key={item.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white text-sm">{item.title || 'Sans titre'}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.id.substring(0,8)}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-300">{item.sellerName || 'Inconnu'}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white uppercase text-[10px] tracking-widest">{item.type || 'Inconnu'}</span>
                    </td>
                    <td className="p-4">
                       <span className="inline-flex items-center text-[9px] font-black uppercase border border-amber-500/50 px-2 py-0.5 rounded text-amber-500 bg-amber-500/10">En Attente</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleStatusChange(item.id, 'rejected')}
                           className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                           title="Rejeter"
                         >
                            <X className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleStatusChange(item.id, 'approved')}
                           className="p-2 flex items-center gap-2 rounded-lg transition-colors border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white uppercase tracking-widest font-bold text-[10px] h-8 px-4"
                           title="Approuver"
                         >
                            <Check className="w-3 h-3" /> APprouver
                         </button>
                       </div>
                    </td>
                 </tr>
               )) : (
                 <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                       <Store className="w-8 h-8 opacity-20 mx-auto mb-3" />
                       <div className="text-[10px] uppercase font-bold tracking-widest">Aucune ressource correspondante</div>
                    </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const filtered = orders.filter(item => 
      item.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (orders.length === 0) {
        return (
            <div className="mt-8">
                <EmptyState title="Aucun ordre" message="Aucun ordre sur la Bourse P2P." icon={ArrowLeftRight} />
            </div>
        );
    }

    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                   <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Cours/Licence</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendeur</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Prix demandé</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                   <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                </tr>
             </thead>
             <tbody className="text-sm divide-y divide-slate-800">
               {filtered.length > 0 ? filtered.map(item => {
                 const isCancelled = item.status === 'cancelled';
                 const isCompleted = item.status === 'completed';
                 return (
                 <tr key={item.id} className={clsx("hover:bg-slate-800/20 transition-colors group", (isCancelled || isCompleted) && "opacity-50 line-through")}>
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white text-sm">{item.courseTitle || 'Licence Inconnue'}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.id.substring(0,8)}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-300">{item.sellerName || 'Étudiant Anonyme'}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white">{(item.price || 0).toLocaleString()} <span className="opacity-50 text-[10px]">XOF</span></span>
                    </td>
                    <td className="p-4">
                       {item.status === 'active' ? (
                          <span className="inline-flex text-[9px] font-black uppercase border border-emerald-500/50 px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10">Actif</span>
                       ) : isCancelled ? (
                          <span className="inline-flex text-[9px] font-black uppercase border border-rose-500/50 px-2 py-0.5 rounded text-rose-400 bg-rose-500/10">Annulé</span>
                       ) : (
                          <span className="inline-flex text-[9px] font-black uppercase border border-slate-500/50 px-2 py-0.5 rounded text-slate-400 bg-slate-500/10">Terminé</span>
                       )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                       {item.status === 'active' && (
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => handleCancelOrder(item.id)}
                             className="h-8 px-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold uppercase tracking-widest text-[9px] hover:bg-rose-500 hover:text-white transition-colors"
                           >
                              Annuler l'Ordre
                           </button>
                         </div>
                       )}
                    </td>
                 </tr>
               )}) : (
                 <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                       <ArrowLeftRight className="w-8 h-8 opacity-20 mx-auto mb-3" />
                       <div className="text-[10px] uppercase font-bold tracking-widest">Aucun ordre en cours</div>
                    </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tight">Supervision des Marchés</h1>
           <p className="text-slate-400 text-sm font-medium mt-1">Validez les E-books/Templates en attente et contrôlez la Bourse P2P.</p>
        </div>
      </header>

      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{statusMsg.text}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex bg-slate-800/50 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={clsx(
              "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
              activeTab === 'pending' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ShieldX className="h-4 w-4" /> En Attente ({marketItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('bourse')}
            className={clsx(
              "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
              activeTab === 'bourse' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ArrowLeftRight className="h-4 w-4" /> Bourse Étudiante
          </button>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Rechercher par titre ou vendeur..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090E17] border border-slate-700/50 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {activeTab === 'pending' && renderDigitalAssets()}
      {activeTab === 'bourse' && renderOrders()}
      
    </div>
  );
}
