import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Users, Trash2, Search, X, AlertTriangle, CheckCircle2, MessageSquare, ShieldBan } from "lucide-react";
import { NdaraSkeleton, EmptyState } from "./AdminSupport";

export interface Squad {
  id: string;
  name: string;
  description: string;
  courseTitle: string;
  creatorId: string;
  membersCount: number;
  createdAt: any;
}

export function AdminSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [squadToDelete, setSquadToDelete] = useState<Squad | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [squadMessages, setSquadMessages] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, "squads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Squad[];
      setSquads(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching squads:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedSquad) {
      setSquadMessages([]);
      return;
    }
    const q = query(
      collection(db, "squad_messages"),
      where("squadId", "==", selectedSquad.id),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSquadMessages(data);
    });
    return () => unsub();
  }, [selectedSquad]);

  const handleDeleteSquad = async () => {
    if (!squadToDelete) return;
    
    try {
      await deleteDoc(doc(db, "squads", squadToDelete.id));
      setStatusMsg({ type: 'success', text: 'Squad supprimée avec succès.' });
    } catch (err) {
      console.error("Error deleting squad:", err);
      setStatusMsg({ type: 'error', text: 'Erreur lors de la suppression de la Squad.' });
    } finally {
      setSquadToDelete(null);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await deleteDoc(doc(db, "squad_messages", msgId));
    } catch(err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Impossible de supprimer le message.' });
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = window.prompt("Motif de la suspension ? (Ce motif n'est peut-être pas sauvegardé si la base ne l'attend pas, mais c'est pour confirmer)");
    if (reason === null) return;
    try {
      await updateDoc(doc(db, "users", userId), { status: 'suspended', suspendedAt: new Date() });
      setStatusMsg({ type: 'success', text: `Utilisateur banni avec succès.` });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch(err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Impossible de suspendre l\'utilisateur.' });
    }
  };

  const filteredSquads = squads.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 flex flex-col items-stretch space-y-6 animate-in fade-in duration-700 font-sans pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="space-y-2">
             <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
             <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
           </div>
           <div className="h-10 w-full md:w-72 bg-slate-800/50 rounded-xl animate-pulse"></div>
        </div>
        <NdaraSkeleton type="table" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 flex flex-col items-stretch space-y-6 animate-in fade-in duration-700 font-sans pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Communautés (Squads)</h1>
          <p className="text-slate-400 text-sm mt-1">Supervisez et modérez les cohortes d'étudiants.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full bg-[#090E17] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            placeholder="Rechercher une squad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-bold">{statusMsg.text}</span>
        </div>
      )}

      {/* Main Table */}
      {filteredSquads.length > 0 ? (
        <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#090E17] border-b border-slate-800">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Squad</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cours Associé</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Membres</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Création</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSquads.map((squad) => (
                  <tr key={squad.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 mt-1 shrink-0 flex items-center justify-center text-emerald-500 group-hover:border-emerald-500/30 transition-colors">
                           <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{squad.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">ID: {squad.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-300">
                        {squad.courseTitle || <span className="text-slate-600 italic">Non assigné</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black font-mono min-w-[3rem]">
                        {squad.membersCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-400">
                      {formatDate(squad.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedSquad(squad)}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors inline-block mr-2"
                        title="Modérer les messages"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSquadToDelete(squad)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors inline-block"
                        title="Supprimer la squad"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState 
           title="Aucune promotion" 
           message="La liste des groupes est vide ou aucun résultat ne correspond à votre recherche." 
           icon={Users} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {squadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSquadToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Supprimer la Squad ?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Voulez-vous vraiment supprimer définitivement la communauté <strong>"{squadToDelete.name}"</strong> ? Cette action est irréversible et supprimera le groupe pour tous ses {squadToDelete.membersCount || 0} membres.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setSquadToDelete(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteSquad}
                className="px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Panel (Modal) */}
      {selectedSquad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">
            <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                   <MessageSquare className="w-6 h-6 text-emerald-500" /> 
                   {selectedSquad.name}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Supervision des échanges & Modération</p>
              </div>
              <button 
                onClick={() => setSelectedSquad(null)}
                className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 hide-scrollbar">
              {squadMessages.length === 0 ? (
                <EmptyState title="Aucun message" message="Il n'y a actuellement aucun échange dans ce groupe d'étude." />
              ) : (
                squadMessages.map(msg => {
                   const mDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt || 0);
                   return (
                  <div key={msg.id} className="relative group flex gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-700">
                      {msg.userPhotoURL ? <img src={msg.userPhotoURL} alt="avatar" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{msg.userName || 'Anonyme'}</span>
                        <span className="text-[10px] text-emerald-500/80 font-mono tracking-wider">{msg.userId?.substring(0,8)}</span>
                        <span className="text-[10px] text-slate-500 block pl-2 border-l border-slate-700 font-bold">{mDate.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-300 break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {/* Actions de modération */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 flex-col md:flex-row group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {msg.userId && (
                        <button 
                          onClick={() => handleBanUser(msg.userId)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/20"
                          title="Suspendre l'utilisateur"
                        >
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                 )})
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
