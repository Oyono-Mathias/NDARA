import { MessageSquare, Mail, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { useRole } from "../context/RoleContext";
import { TopAppBar } from "../components/ui/TopAppBar";

export function SupportView() {
  const { currentUser } = useRole();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
     if(!currentUser?.uid) return;
     const q = query(collection(db, "support_tickets"), where("userId", "==", currentUser.uid));
     const unsub = onSnapshot(q, snap => {
         setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => {
             const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
             const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
             return tB - tA;
         }));
     });
     return () => unsub();
  }, [currentUser?.uid]);

  const handleSubmit = async () => {
    if(!subject.trim() || !description.trim()) {
        setStatus({ type: 'error', text: 'Veuillez remplir tous les champs.' });
        return;
    }
    if(!currentUser?.uid) return;

    setIsSubmitting(true);
    setStatus(null);
    try {
        await addDoc(collection(db, "support_tickets"), {
            userId: currentUser.uid,
            userName: currentUser.fullName || 'User',
            userEmail: currentUser.email || 'N/A',
            subject,
            description,
            status: 'open',
            createdAt: serverTimestamp()
        });
        setSubject("");
        setDescription("");
        setStatus({ type: 'success', text: 'Demande soumise avec succès !' });
    } catch (error: any) {
        setStatus({ type: 'error', text: error.message || 'Erreur lors de la soumission.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 bg-slate-950 min-h-screen">
      <TopAppBar title="Support" showBack={true} transparent />
      
      <div className="px-4 space-y-6 pt-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl text-white">Support</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">Nous sommes là pour vous aider avec la plateforme Ndara.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-3xl p-6 relative overflow-hidden group hover:border border-white/5 border-green-500/30 transition cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">WhatsApp Direct</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Réponse en moins de 5 minutes par notre équipe de modérateurs.</p>
          </div>
          
           <div className="glass rounded-3xl p-6 relative overflow-hidden group hover:border border-white/5 border-blue-500/30 transition cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Ticket Email</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Pour les requêtes complexes liées à la facturation ou aux diplômes.</p>
          </div>
      </div>

      <div className="glass rounded-4xl p-6 border border-white/5">
          <h3 className="font-serif text-xl text-white mb-6">Ouvrir un ticket</h3>
          
          <div className="space-y-4">
              {status && (
                  <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {status.text}
                  </div>
              )}
              <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Sujet / Problème</label>
                  <input 
                      type="text"
                      className="w-full bg-card border border-white/10 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-white/30 text-sm transition"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                  />
              </div>
              <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Description détaillée</label>
                  <textarea 
                      rows={4}
                      className="w-full bg-card border border-white/10 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-white/30 text-sm transition resize-none"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                  ></textarea>
              </div>
              <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition disabled:opacity-50">
                 {isSubmitting ? 'Envoi...' : 'Soumettre la requête'}
              </button>
          </div>
      </div>

      {tickets.length > 0 && (
          <div className="glass rounded-4xl p-6 border border-white/5 mt-6">
             <h3 className="font-serif text-xl text-white mb-6">Mes demandes récentes</h3>
             <div className="space-y-4">
                 {tickets.map(ticket => (
                     <div key={ticket.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
                         <div className="flex items-center justify-between">
                           <div>
                               <div className="text-sm font-bold text-white mb-1">{ticket.subject}</div>
                               <div className="text-xs text-slate-400">{ticket.description}</div>
                           </div>
                           <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-emerald-500/20 text-emerald-400' :
                             ticket.status === 'investigating' ? 'bg-blue-500/20 text-blue-400' :
                             'bg-orange-500/20 text-orange-400'
                           }`}>
                               {ticket.status === 'resolved' || ticket.status === 'closed' ? 'Résolu' : ticket.status === 'investigating' ? 'En traitement' : 'Ouvert'}
                           </div>
                         </div>
                         
                         {/* Replies */}
                         {ticket.replies && ticket.replies.length > 0 && (
                           <div className="space-y-3 pt-3 border-t border-white/5">
                             {ticket.replies.map((reply: any, rIdx: number) => (
                               <div key={rIdx} className={`p-3 rounded-xl text-xs max-w-[90%] ${reply.isAdmin ? 'bg-blue-500/10 border border-blue-500/20 text-blue-50 mr-auto' : 'bg-white/10 text-slate-200 ml-auto'}`}>
                                 <div className="font-black uppercase tracking-widest text-[9px] mb-1 opacity-60">
                                   {reply.isAdmin ? 'Support Ndara' : 'Moi'}
                                 </div>
                                 {reply.message}
                               </div>
                             ))}
                           </div>
                         )}
                         
                         {/* Action (if not resolved) */}
                         {(ticket.status !== 'resolved' && ticket.status !== 'closed') && (
                            <form 
                              className="flex gap-2 mt-2" 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const input = new FormData(e.currentTarget).get('reply') as string;
                                if (!input || !input.trim()) return;
                                
                                import('firebase/firestore').then(({ doc, updateDoc, arrayUnion, Timestamp }) => {
                                  updateDoc(doc(db, 'support_tickets', ticket.id), {
                                    replies: arrayUnion({
                                      message: input.trim(),
                                      adminId: null,
                                      createdAt: Timestamp.now(),
                                      isAdmin: false
                                    }),
                                    status: 'open',
                                    updatedAt: Timestamp.now()
                                  });
                                });
                                e.currentTarget.reset();
                              }}
                            >
                              <input 
                                name="reply"
                                type="text" 
                                placeholder="Répondre..." 
                                className="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-blue-500/50"
                              />
                              <button type="submit" className="bg-blue-500 hover:bg-blue-400 text-slate-950 px-4 rounded-lg font-black text-[10px] tracking-widest uppercase transition-colors">
                                Envoyer
                              </button>
                            </form>
                         )}
                     </div>
                 ))}
             </div>
          </div>
      )}
      </div>
    </div>
  );
}
