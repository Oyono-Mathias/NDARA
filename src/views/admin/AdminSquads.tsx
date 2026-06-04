import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { Users, Trash2, Search, X, AlertTriangle, CheckCircle2 } from "lucide-react";

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

    </div>
  );
}
