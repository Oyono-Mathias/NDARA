import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Users, Trash2, Search, X, AlertTriangle, CheckCircle2, MessageSquare, ShieldBan } from "lucide-react";

interface Squad {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Communautés (Squads)</h1>
          <p className="text-slate-400 text-sm mt-1">Supervisez et modérez les groupes d'étude étudiants.</p>
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
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090E17] border-b border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Squad</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Cours Associé</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Membres</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Création</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                       <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></span>
                       <span>Chargement des Squads...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSquads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>Aucune squad trouvée.</p>
                  </td>
                </tr>
              ) : (
                filteredSquads.map((squad) => (
                  <tr key={squad.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 mt-1 shrink-0 flex items-center justify-center text-emerald-500">
                           <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white mb-0.5">{squad.name}</div>
                          <div className="text-xs text-slate-500 font-mono truncate max-w-[200px]">ID: {squad.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-300">
                        {squad.courseTitle || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold font-mono min-w-[3rem]">
                        {squad.membersCount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-slate-400">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {squadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSquadToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Supprimer la Squad ?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Voulez-vous vraiment supprimer définitivement la communauté <strong>"{squadToDelete.name}"</strong> ? Cette action est irréversible et supprimera le groupe pour tous ses {squadToDelete.membersCount} membres.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setSquadToDelete(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteSquad}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]"
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
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 focus-trap flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">{selectedSquad.name} <span className="opacity-40">|</span> Modération</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Gérez le contenu et modérez les membres suspects</p>
              </div>
              <button 
                onClick={() => setSelectedSquad(null)}
                className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 hide-scrollbar">
              {squadMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p>Aucun message dans ce groupe.</p>
                </div>
              ) : (
                squadMessages.map(msg => {
                   const mDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt || 0);
                   return (
                  <div key={msg.id} className="relative group flex gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-700">
                      {msg.userPhotoURL ? <img src={msg.userPhotoURL} alt="avatar" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{msg.userName || 'Anonyme'}</span>
                        <span className="text-[10px] text-emerald-500/80 font-mono tracking-wider">{msg.userId?.substring(0,8)}</span>
                        <span className="text-[10px] text-slate-600 block pl-2 border-l border-slate-800">{mDate.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-300 break-words whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {/* Actions de modération */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 flex-col md:flex-row group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {msg.userId && (
                        <button 
                          onClick={() => handleBanUser(msg.userId)}
                          className="p-1.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
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
