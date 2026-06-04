import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Zap, 
  ShieldCheck, 
  Clock, 
  MessageCircleQuestion, 
  Search, 
  Plus, 
  Edit3, 
  Trash2,
  Tag,
  Save,
  Loader2,
  LifeBuoy,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import clsx from 'clsx';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export function AdminSupport() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real datasets
  const [tickets, setTickets] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // FAQ state
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [faqForm, setFaqForm] = useState({ id: '', question_fr: '', answer_fr: '', tags: '', order: 0 });

  useEffect(() => {
    const unsubTickets = onSnapshot(collection(db, 'support_tickets'), (snap) => {
      const t: any[] = [];
      snap.forEach(d => t.push({ id: d.id, ...d.data() }));
      // Sort by creation date or priority if needed
      setTickets(t.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      setIsLoading(false);
    });

    const unsubFaq = onSnapshot(query(collection(db, 'faq_entries'), orderBy('order', 'asc')), (snap) => {
      const f: any[] = [];
      snap.forEach(d => {
        const data = d.data();
        f.push({ 
          id: d.id, 
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : data.tags?.split(',').map((t: string) => t.trim()) || []
        });
      });
      setFaqs(f);
    });

    return () => {
      unsubTickets();
      unsubFaq();
    };
  }, []);

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), { status });
    } catch (err) {
      console.error("Error updating ticket status: ", err);
    }
  };

  const handleSaveFaq = async () => {
    setIsSaving(true);
    try {
      const tagsArray = faqForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const dataToSave = {
        question_fr: faqForm.question_fr,
        answer_fr: faqForm.answer_fr,
        tags: tagsArray,
        order: faqForm.order
      };

      if (faqForm.id) {
        await updateDoc(doc(db, 'faq_entries', faqForm.id), dataToSave);
      } else {
        await setDoc(doc(collection(db, 'faq_entries')), dataToSave);
      }

      setIsAddingFaq(false);
      setFaqForm({ id: '', question_fr: '', answer_fr: '', tags: '', order: 0 });
    } catch (error) {
      console.error("Error saving FAQ:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'faq_entries', id));
    } catch (err) {
      console.error("Error deleting FAQ: ", err);
    }
  };

  const editFaq = (faq: any) => {
    setFaqForm({
      id: faq.id,
      question_fr: faq.question_fr || '',
      answer_fr: faq.answer_fr || '',
      tags: Array.isArray(faq.tags) ? faq.tags.join(', ') : (faq.tags || ''),
      order: faq.order || 0
    });
    setIsAddingFaq(true);
  };

  const filteredFaqs = faqs.filter(f => f.question_fr?.toLowerCase().includes(searchTerm.toLowerCase()));
  const openCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'Résolu').length;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#090E17]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Headphones className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Relation Ndara</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Support & SAV</h1>
          <p className="text-slate-400 text-sm font-medium">Arbitrez les demandes et maintenez la satisfaction communautaire.</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-4 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2 shadow-lg shrink-0">
                <Zap className="w-4 h-4 animate-pulse" />
                {openCount} DEMANDES ACTIVES
            </div>
        </div>
      </header>

      {/* SLA Status Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner shrink-0">
                  <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-white text-xs font-black uppercase tracking-tight">Qualité de Service</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">SLA : Réponse en &lt; 2h (Optimal)</p>
              </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                  <p className="text-white text-xs font-black uppercase tracking-tight">Charge Réseau</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Flux de messages : Stable</p>
              </div>
          </div>
      </section>

      {/* Tabs */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setActiveTab('tickets')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'tickets' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
              )}
            >
                <LifeBuoy className="h-4 w-4" /> Tickets Actifs ({tickets.length})
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'faq' ? "bg-slate-800 text-blue-400 shadow-sm" : "text-blue-500/50 hover:text-blue-400/80 hover:bg-slate-800/30"
              )}
            >
                <MessageCircleQuestion className="h-4 w-4" /> Base FAQ ({faqs.length})
            </button>
        </div>

        {/* Content Panels */}
        <div>
          {activeTab === 'tickets' && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID Demande</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sujet</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                      <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {tickets.length > 0 ? tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                           <span className="font-mono text-xs text-white">TKT-{t.id.substring(0, 6).toUpperCase()}</span>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-500">{(t.userName ? t.userName[0] : 'U').toUpperCase()}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">{t.userEmail || t.userId}</span>
                          </div>
                        </td>
                        <td className="p-4">
                           <span className="font-bold text-white line-clamp-1 max-w-[200px]">{t.subject || 'Demande de support'}</span>
                        </td>
                        <td className="p-4">
                           {t.status === 'resolved' || t.status === 'Résolu' ? (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">Résolu</span>
                           ) : t.status === 'urgent' ? (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-red-500/10 text-red-500 animate-pulse">Urgent</span>
                           ) : (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-amber-500/10 text-amber-500">Ouvert</span>
                           )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <div className="flex justify-end gap-2">
                             {(t.status === 'resolved' || t.status === 'Résolu') ? (
                               <button onClick={() => handleUpdateTicketStatus(t.id, 'open')} className="h-8 px-3 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center justify-center border border-amber-500/20 shadow-lg text-[9px] font-black uppercase tracking-wider">
                                 Réouvrir
                               </button>
                             ) : (
                               <button onClick={() => handleUpdateTicketStatus(t.id, 'resolved')} className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:text-slate-950 hover:bg-emerald-500 transition-colors flex items-center justify-center border border-emerald-500/20 shadow-lg" title="Marquer Résolu">
                                 <CheckCircle className="w-4 h-4" />
                               </button>
                             )}
                           </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5}>
                          <div className="py-12 flex flex-col items-center justify-center text-center">
                            <LifeBuoy className="w-8 h-8 text-slate-600 mb-3" />
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Aucun ticket actif.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1 sm:max-w-md shadow-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Rechercher une question..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setIsAddingFaq(!isAddingFaq);
                      if(isAddingFaq) setFaqForm({ id: '', question_fr: '', answer_fr: '', tags: '', order: 0 }); // reset on cancel
                    }}
                    className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shrink-0"
                  >
                    {isAddingFaq ? "Annuler" : <><Plus className="w-4 h-4" /> Nouvelle FAQ</>}
                  </button>
               </div>

               {isAddingFaq && (
                 <div className="bg-slate-800/40 border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl animate-in slide-in-from-top-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                       <MessageCircleQuestion className="w-5 h-5 text-blue-500" /> {faqForm.id ? "Modifier Entrée FAQ" : "Nouvelle Entrée FAQ"}
                    </h3>
                    <div className="space-y-5">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Question</label>
                          <input 
                              type="text" 
                              value={faqForm.question_fr}
                              onChange={e => setFaqForm({...faqForm, question_fr: e.target.value})}
                              placeholder="Ex: Comment obtenir mon certificat ?"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-white focus:border-blue-500/50 transition-colors text-sm outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Réponse</label>
                          <textarea 
                              value={faqForm.answer_fr}
                              onChange={e => setFaqForm({...faqForm, answer_fr: e.target.value})}
                              placeholder="Détaillez la procédure ici..."
                              rows={4}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-300 focus:border-blue-500/50 transition-colors text-sm resize-none outline-none"
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tags (séparés par virgule)</label>
                              <input 
                                  type="text" 
                                  value={faqForm.tags}
                                  onChange={e => setFaqForm({...faqForm, tags: e.target.value})}
                                  placeholder="certificat, diplôme"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-white focus:border-blue-500/50 transition-colors text-sm outline-none"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ordre d'affichage</label>
                              <input 
                                  type="number" 
                                  value={faqForm.order}
                                  onChange={e => setFaqForm({...faqForm, order: parseInt(e.target.value) || 0})}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-white focus:border-blue-500/50 transition-colors text-sm outline-none"
                              />
                          </div>
                       </div>
                       <button 
                         onClick={handleSaveFaq}
                         disabled={isSaving || !faqForm.question_fr || !faqForm.answer_fr}
                         className="w-full mt-2 flex items-center justify-center gap-2 h-14 bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-xl"
                       >
                         {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                         Enregistrer
                       </button>
                    </div>
                 </div>
               )}

               <div className="grid gap-4">
                 {filteredFaqs.length > 0 ? filteredFaqs.map(faq => (
                    <div key={faq.id} className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row gap-6 justify-between items-start group shadow-xl">
                       <div className="space-y-3 flex-1">
                          <h4 className="text-white font-black text-lg">{faq.question_fr}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed font-medium">{faq.answer_fr}</p>
                          <div className="flex flex-wrap gap-2 pt-2">
                             {faq.tags && faq.tags.map((tag: string, idx: number) => tag.trim() && (
                               <span key={idx} className="flex items-center gap-1.5 bg-slate-950 text-blue-400 border border-slate-800 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">
                                 <Tag className="w-3 h-3" /> {tag.trim()}
                               </span>
                             ))}
                          </div>
                       </div>
                       <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                          <button onClick={() => editFaq(faq)} className="flex-1 md:flex-none h-10 w-full md:w-10 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="flex-1 md:flex-none h-10 w-full md:w-10 rounded-xl bg-slate-800 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors border border-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 )) : (
                    <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                      <MessageCircleQuestion className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Aucune question trouvée</p>
                    </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

