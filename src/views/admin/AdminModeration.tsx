import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  ShieldCheck, 
  Check, 
  Trash2, 
  UserX,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

export function AdminModeration() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'moderation_queue'),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const showMsg = (type: 'success'|'error', text: string) => {
      setStatusMsg({ type, text });
      setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleIgnore = async (id: string) => {
    try {
       await updateDoc(doc(db, 'moderation_queue', id), { status: 'ignored' });
       showMsg('success', 'Signalement ignoré (classé sans suite).');
    } catch (err) {
       console.error("Error updating", err);
       showMsg('error', 'Erreur lors de la mise à jour.');
    }
  };

  const handleDeleteContent = async (queueId: string, targetCollection: string, targetId: string) => {
     if (!window.confirm('Supprimer définitivement ce contenu offensant ?')) return;
     try {
         // Delete actual content if we have references
         if (targetCollection && targetId) {
             await deleteDoc(doc(db, targetCollection, targetId));
         }
         // Mark queue as resolved
         await updateDoc(doc(db, 'moderation_queue', queueId), { status: 'resolved_deleted' });
         showMsg('success', 'Contenu supprimé avec succès.');
     } catch (err) {
         console.error("Error deleting", err);
         showMsg('error', 'Erreur lors de la suppression.');
     }
  };

  const handleBanUser = async (queueId: string, userId: string) => {
    if (!window.confirm('Bannir définitivement cet utilisateur ? Cette action bloquera son accès.')) return;
    try {
        if (userId) {
            await updateDoc(doc(db, 'users', userId), { status: 'banned', role: 'banned' });
        }
        await updateDoc(doc(db, 'moderation_queue', queueId), { status: 'resolved_banned' });
        showMsg('success', 'Utilisateur banni de la plateforme.');
    } catch (err) {
        console.error("Error banning user", err);
        showMsg('error', 'Erreur lors du bannissement.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans p-6 max-w-6xl mx-auto">
        <div className="space-y-2 relative z-10">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4 relative z-10">
           <NdaraSkeleton type="table" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans p-6 max-w-6xl mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-red-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Salubrité & Urgences</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Signalements</h1>
          <p className="text-slate-400 text-sm font-medium">Gérez la file de traitement des comportements toxiques et du spam.</p>
        </div>
      </header>
      
      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{statusMsg.text}</span>
        </div>
      )}

      {/* Moderation Queue */}
      <div className="relative z-10 space-y-4">
        {items.length > 0 ? items.map((item) => (
          <div key={item.id} className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row gap-6 shadow-xl relative overflow-hidden transition-all hover:bg-slate-800/50">
            {/* Warning Icon */}
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center shrink-0">
               <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
               <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Toxique</span>
            </div>

            {/* Warning Info */}
            <div className="flex-1 flex flex-col justify-between gap-4">
               <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Plainte / Contenu Inapproprié
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                      Contenu suspecté : "{item.contentSnippet || '...'}"
                  </h3>
                  <p className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 font-mono">
                    Motif : {item.reason || "Non spécifié."}
                  </p>
               </div>

               {/* Meta Data */}
               <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auteur:</span>
                    <span className="text-xs font-bold text-white">{item.authorName || item.authorId || 'Inconnu'}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signalé par:</span>
                    <span className="text-xs font-bold text-amber-500">{item.reporterName || 'Automatique / IA'}</span>
                  </div>
               </div>
            </div>

            {/* Actions (Touch friendly) */}
            <div className="flex flex-col justify-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-700/50 md:pl-6 md:border-l">
               <button 
                  onClick={() => handleDeleteContent(item.id, item.targetCollection, item.targetId)} 
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-colors"
               >
                 <Trash2 className="w-4 h-4" /> Supprimer Contenu
               </button>
               <button 
                  onClick={() => handleBanUser(item.id, item.authorId)} 
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-colors shadow-lg shadow-red-500/5"
               >
                 <UserX className="w-4 h-4" /> Bannir Utilisateur
               </button>
               <div className="h-px bg-slate-700 my-1 w-full" />
               <button 
                  onClick={() => handleIgnore(item.id)} 
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-colors"
               >
                 <Check className="w-4 h-4" /> Classer sans suite
               </button>
            </div>
          </div>
        )) : (
          <div className="mt-8">
              <EmptyState title="Aucun signalement" message="La file de modération est propre." icon={ShieldCheck} />
          </div>
        )}
      </div>
    </div>
  );
}
