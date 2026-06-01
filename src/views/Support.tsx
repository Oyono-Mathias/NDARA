import { MessageSquare, Mail, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { useRole } from "../context/RoleContext";

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
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
             <div className="space-y-3">
                 {tickets.map(ticket => (
                     <div key={ticket.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                         <div>
                             <div className="text-sm font-bold text-white">{ticket.subject}</div>
                             <div className="text-xs text-slate-400">{ticket.description}</div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                             {ticket.status === 'open' ? 'En cours' : 'Fermé'}
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      )}
    </div>
  );
}
