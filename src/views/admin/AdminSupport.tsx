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
  CheckCircle,
  Send,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, deleteDoc, orderBy, arrayUnion, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export const EmptyState: React.FC<{ title: string, message?: string, icon?: any }> = ({ title, message, icon: Icon }) => {
  return (
    <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
      {Icon && <Icon className="w-12 h-12 text-slate-700 mx-auto mb-4" />}
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">{title}</h3>
      {message && <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">{message}</p>}
    </div>
  );
}

export const NdaraSkeleton: React.FC<{ type: 'table' | 'cards' | string }> = ({ type }) => {
  if (type === 'table') {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="w-full h-14 bg-slate-900/50 animate-pulse border-b border-slate-800"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-slate-800/50">
            <div className="h-6 w-24 bg-slate-800/50 rounded animate-pulse"></div>
            <div className="h-6 w-48 bg-slate-800/50 rounded animate-pulse"></div>
            <div className="h-6 flex-1 bg-slate-800/50 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-slate-800/50 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="h-64 bg-slate-800/30 rounded-3xl animate-pulse w-full border border-slate-700/50"></div>;
}

export function AdminSupport() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real datasets
  const [tickets, setTickets] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);

  // Tickets state
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // FAQ state
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [faqForm, setFaqForm] = useState({ id: '', question_fr: '', answer_fr: '', tags: '', order: 0 });

  useEffect(() => {
    // 1. Lecture en temps réel des tickets, triés par createdAt descendant
    const qTickets = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    const unsubTickets = onSnapshot(qTickets, (snap) => {
      const fetchedTickets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(fetchedTickets);
      setIsLoadingTickets(false);
    }, (err) => {
      console.error("Erreur de récupération tickets:", err);
      setIsLoadingTickets(false);
    });

    // 2. Lecture en temps réel de la FAQ, triée par order ascendant
    const qFaqs = query(collection(db, 'faq_entries'), orderBy('order', 'asc'));
    const unsubFaqs = onSnapshot(qFaqs, (snap) => {
      const fetchedFaqs = snap.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : (data.tags?.split(',').map((t: string) => t.trim()) || [])
        };
      });
      setFaqs(fetchedFaqs);
      setIsLoadingFaqs(false);
    }, (err) => {
      console.error("Erreur de récupération FAQ:", err);
      setIsLoadingFaqs(false);
    });

    return () => {
      unsubTickets();
      unsubFaqs();
    };
  }, []);

  // Action: Modifier le statut d'un ticket
  const handleUpdateTicketStatus = async (ticketId: string, status: string, userId?: string) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), { 
        status, 
        updatedAt: Timestamp.now() 
      });
      // Notify the user
      if (userId) {
          await setDoc(doc(collection(db, `users/${userId}/notifications`)), {
              title: "Mise à jour de votre demande",
              message: `Le statut de votre requête a été modifié à: ${status}`,
              read: false,
              createdAt: Timestamp.now(),
              type: "support",
              link: "/student/support"
          });
      }
    } catch (err) {
      console.error("Error updating ticket status: ", err);
    }
  };

  // Action: Répondre à un ticket
  const handleReplyToTicket = async (ticketId: string, userId?: string) => {
    if (!replyMessage.trim()) return;
    setIsReplying(true);
    
    try {
      const replyData = {
        message: replyMessage,
        adminId: auth.currentUser?.uid || 'Admin_System',
        createdAt: Timestamp.now(),
        isAdmin: true
      };

      await updateDoc(doc(db, 'support_tickets', ticketId), {
        replies: arrayUnion(replyData),
        status: 'investigating', // Passe en investigation automatiquement lorsqu'on répond
        updatedAt: Timestamp.now()
      });

      // Notify the user
      if (userId) {
          await setDoc(doc(collection(db, `users/${userId}/notifications`)), {
              title: "Nouvelle réponse du support",
              message: "Le support technique a répondu à votre demande.",
              read: false,
              createdAt: Timestamp.now(),
              type: "support",
              link: "/student/support"
          });
      }
      
      setReplyMessage('');
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse: ", error);
    } finally {
      setIsReplying(false);
    }
  };

  // Actions FAQ: addDoc, updateDoc
  const handleSaveFaq = async () => {
    setIsSavingFaq(true);
    try {
      const tagsArray = faqForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const dataToSave = {
        question_fr: faqForm.question_fr,
        answer_fr: faqForm.answer_fr,
        tags: tagsArray,
        order: faqForm.order,
        updatedAt: Timestamp.now()
      };

      if (faqForm.id) {
        await updateDoc(doc(db, 'faq_entries', faqForm.id), dataToSave);
      } else {
        await setDoc(doc(collection(db, 'faq_entries')), {
          ...dataToSave,
          createdAt: Timestamp.now()
        });
      }

      setIsAddingFaq(false);
      setFaqForm({ id: '', question_fr: '', answer_fr: '', tags: '', order: 0 });
    } catch (error) {
      console.error("Error saving FAQ:", error);
    } finally {
      setIsSavingFaq(false);
    }
  };

  // Action FAQ: deleteDoc
  const handleDeleteFaq = async (id: string) => {
    if(!window.confirm("Confirmer la suppression de cette FAQ ?")) return;
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

  const filteredTickets = tickets.filter(t => t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.includes(searchTerm));
  const filteredFaqs = faqs.filter(f => f.question_fr?.toLowerCase().includes(searchTerm.toLowerCase()));
  const openCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;

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
        <div className="flex flex-col sm:flex-row justify-between shrink-0 gap-4">
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl shrink-0">
              <button 
                onClick={() => setActiveTab('tickets')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'tickets' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                  <LifeBuoy className="h-4 w-4" /> Tickets Actifs
              </button>
              <button 
                onClick={() => setActiveTab('faq')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'faq' ? "bg-slate-800 text-blue-400 shadow-sm" : "text-blue-500/50 hover:text-blue-400/80 hover:bg-slate-800/30"
                )}
              >
                  <MessageCircleQuestion className="h-4 w-4" /> Base FAQ
              </button>
          </div>

          {/* Dynamic Search based on Active Tab */}
          <div className="relative w-full sm:max-w-xs shadow-xl shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={activeTab === 'tickets' ? "Rechercher par ID ou Sujet..." : "Rechercher une question..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Content Panels */}
        <div>
          {/* TICKETS TAB */}
          {activeTab === 'tickets' && (
            <div className="animate-in fade-in">
              {isLoadingTickets ? (
                 <NdaraSkeleton type="table" />
              ) : filteredTickets.length > 0 ? (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
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
                        {filteredTickets.map((t) => (
                          <React.Fragment key={t.id}>
                            <tr className={clsx("transition-colors group", expandedTicketId === t.id ? "bg-slate-800/40" : "hover:bg-slate-800/20")}>
                              <td className="p-4 pl-6">
                                <span className="font-mono text-xs text-white">TKT-{t.id.substring(0, 6).toUpperCase()}</span>
                                <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
                                  {t.createdAt?.toDate?.().toLocaleDateString('fr-FR') || 'N/A'}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-500">{(t.userName ? t.userName[0] : 'U').toUpperCase()}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">{t.userName || 'Anonyme'}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{t.userEmail}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-white line-clamp-1 max-w-[200px]">{t.subject || 'Sans sujet'}</span>
                                {t.replies && t.replies.length > 0 && (
                                  <span className="inline-flex mt-1 items-center gap-1 text-[9px] font-black uppercase text-blue-400">
                                    <MessageSquare className="w-3 h-3" /> {t.replies.length} réponse(s)
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {t.status === 'resolved' || t.status === 'closed' ? (
                                  <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">Résolu</span>
                                ) : t.status === 'urgent' ? (
                                  <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-red-500/10 text-red-500 animate-pulse">Urgent</span>
                                ) : t.status === 'investigating' ? (
                                  <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-blue-500/10 text-blue-500">En traitement</span>
                                ) : (
                                  <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-amber-500/10 text-amber-500">Ouvert</span>
                                )}
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)} 
                                    className={clsx(
                                      "h-8 px-3 rounded-lg hover:text-white transition-colors flex items-center justify-center border shadow-sm text-[9px] font-black uppercase tracking-wider",
                                      expandedTicketId === t.id ? "bg-slate-800 text-white border-slate-700" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                                    )}
                                  >
                                    {expandedTicketId === t.id ? "Fermer" : "Détails"}
                                  </button>
                                  {(t.status === 'resolved' || t.status === 'closed') ? (
                                    <button onClick={() => handleUpdateTicketStatus(t.id, 'open', t.userId)} className="h-8 px-3 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center justify-center border border-amber-500/20 shadow-lg text-[9px] font-black uppercase tracking-wider">
                                      Réouvrir
                                    </button>
                                  ) : (
                                    <button onClick={() => handleUpdateTicketStatus(t.id, 'resolved', t.userId)} className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 hover:text-slate-950 hover:bg-emerald-500 transition-colors flex items-center justify-center border border-emerald-500/20 shadow-lg text-[9px] font-black uppercase tracking-wider">
                                       Clore
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Ticket View - Conversations */}
                            {expandedTicketId === t.id && (
                              <tr className="bg-slate-900/80 border-b border-slate-800">
                                <td colSpan={5} className="p-6">
                                  <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Message de l'étudiant</h4>
                                      <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/50 p-4 rounded-xl font-medium">{t.message || t.description}</p>
                                    </div>
                                    
                                    {/* Thread / Replies */}
                                    {t.replies && t.replies.length > 0 && (
                                      <div className="space-y-4 pl-6 border-l-2 border-slate-800">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Historique d'échanges</h4>
                                        {t.replies.map((reply: any, rIdx: number) => (
                                          <div key={rIdx} className={clsx(
                                            "p-4 rounded-2xl border w-fit max-w-xl",
                                            reply.isAdmin ? "bg-blue-500/10 border-blue-500/20 text-blue-50 relative" 
                                                          : "bg-slate-800/80 border-slate-700 text-slate-200"
                                          )}>
                                            <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">
                                              {reply.isAdmin ? "Staff Ndara" : "Étudiant"} • {reply.createdAt?.toDate?.().toLocaleString('fr-FR') || 'A l\'instant'}
                                            </div>
                                            <p className="text-sm">{reply.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Action Reply */}
                                    {t.status !== 'resolved' && t.status !== 'closed' && (
                                      <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3">
                                        <input 
                                          type="text" 
                                          value={replyMessage}
                                          onChange={(e) => setReplyMessage(e.target.value)}
                                          placeholder="Taper une réponse..." 
                                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500/50 transition-colors text-sm outline-none"
                                        />
                                        <button 
                                          onClick={() => handleReplyToTicket(t.id, t.userId)}
                                          disabled={isReplying || !replyMessage.trim()}
                                          className="flex items-center gap-2 px-6 bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl"
                                        >
                                          {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Rép.
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyState title="Aucun ticket support" message="Tous les problèmes ont été résolus." icon={LifeBuoy} />
              )}
            </div>
          )}

          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex flex-col sm:flex-row justify-between gap-4">
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
                         disabled={isSavingFaq || !faqForm.question_fr || !faqForm.answer_fr}
                         className="w-full mt-2 flex items-center justify-center gap-2 h-14 bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-xl"
                       >
                         {isSavingFaq ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                         Enregistrer
                       </button>
                    </div>
                 </div>
               )}

               <div className="grid gap-4">
                 {isLoadingFaqs ? (
                    <NdaraSkeleton type="cards" />
                 ) : filteredFaqs.length > 0 ? filteredFaqs.map(faq => (
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
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            Ordre: {faq.order}
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
                    <EmptyState title="Aucune question trouvée" icon={MessageCircleQuestion} />
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

