import React, { useState, useEffect } from "react";
import { Users, Search, Filter, Shield, MoreVertical, Ban, CheckCircle2, UserCheck, X, ShieldAlert, Loader2 } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Edit modal state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Load users in real time from Firestore
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const uList = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setUsers(uList);
      setLoading(false);
    }, (error) => {
      console.error("Error loading users for admin:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter actions
  const filteredUsers = users.filter(u => {
    // Search matching
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.fullName || "").toLowerCase().includes(searchLower) ||
      (u.email || "").toLowerCase().includes(searchLower) ||
      (u.username || "").toLowerCase().includes(searchLower) ||
      (u.uid || "").toLowerCase().includes(searchLower);

    // Role matching
    const matchesRole = roleFilter === "all" || (u.role || "").toLowerCase() === roleFilter.toLowerCase();

    // Status matching
    const uStatus = u.status || "active";
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && uStatus === "active") ||
      (statusFilter === "suspended" && uStatus === "suspended");

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateStatus = async (userUid: string, newStatus: "active" | "suspended") => {
    try {
      setUpdatingUser(true);
      await updateDoc(doc(db, "users", userUid), {
        status: newStatus
      });
      if (selectedUser?.uid === userUid) {
        setSelectedUser((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleUpdateRole = async (userUid: string, newRole: "student" | "instructor" | "admin") => {
    try {
      setUpdatingUser(true);
      await updateDoc(doc(db, "users", userUid), {
        role: newRole
      });
      if (selectedUser?.uid === userUid) {
        setSelectedUser((prev: any) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Erreur lors de la mise à jour du rôle.");
    } finally {
      setUpdatingUser(false);
    }
  };

  return (
    <div className="w-full px-4 flex flex-col items-stretch space-y-6 animate-in fade-in duration-500 font-mono text-green-500">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Users className="text-[#10B981] w-6 h-6" /> IDENTITY_REGISTRY
        </h1>
        <div className="text-[#10B981] text-xs font-bold leading-none bg-[#10B981]/15 px-3 py-1.5 border border-[#10B981]/20 rounded-md">
          Total Utilisateurs : {loading ? "..." : users.length}
        </div>
      </div>

       {/* Controls Card */}
       <div className="p-4 bg-black border border-[#10B981]/15 rounded-sm space-y-4">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-[#10B981] w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Filtrer par id, pseudo, nom, email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-[#10B981]/30 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all text-sm placeholder:text-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Role filter */}
              <select 
                value={roleFilter} 
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-black border border-[#10B981]/30 rounded-sm px-3 py-2 text-xs font-bold text-[#10B981] focus:outline-none focus:border-[#10B981]"
              >
                <option value="all">TOUS LES RÔLES</option>
                <option value="student">STUDENT</option>
                <option value="instructor">INSTRUCTOR</option>
                <option value="admin">ADMIN</option>
              </select>

              {/* Status filter */}
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-black border border-[#10B981]/30 rounded-sm px-3 py-2 text-xs font-bold text-[#10B981] focus:outline-none focus:border-[#10B981]"
              >
                <option value="all">TOUS LES STATUTS</option>
                <option value="active">ACTIF</option>
                <option value="suspended">SUSPENDU</option>
              </select>
            </div>
         </div>
       </div>

       {/* Data Table */}
       <div className="w-full overflow-x-auto border border-[#10B981]/15 bg-black/50">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">Initialisation de la base d'identité...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 border-b border-[#10B981]/20">
                    <tr>
                        <th className="px-4 py-3">User UID</th>
                        <th className="px-4 py-3">Identité</th>
                        <th className="px-4 py-3">Rôle</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Solde principal</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black">
                    {filteredUsers.map((u) => {
                      const isSuspended = u.status === "suspended";
                      return (
                        <tr key={u.uid} className={`hover:bg-white/5 transition ${u.role === "admin" ? 'border-l-2 border-l-red-500' : u.role === "instructor" ? 'border-l-2 border-l-amber-500' : ''}`}>
                            <td className="px-4 py-4 font-mono text-[11px] text-gray-500 select-all truncate max-w-[120px]">{u.uid}</td>
                            <td className="px-4 py-4">
                                <div className="text-white font-bold text-sm tracking-tight">{u.fullName || "Sans nom"}</div>
                                <div className="text-[10px] text-gray-600 font-semibold lowercase">@{u.username || "no-username"} // {u.email}</div>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border ${
                                  u.role === 'admin' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                                  u.role === 'instructor' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 
                                  'text-blue-400 border-blue-400/30 bg-blue-400/10'
                                }`}>
                                    {(u.role || "student").toUpperCase()}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                {isSuspended ? (
                                    <span className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1">
                                      <ShieldAlert className="w-3.5 h-3.5" /> Suspendu
                                    </span>
                                ) : (
                                    <span className="text-[#10B981] flex items-center gap-1 text-[10px] font-black uppercase">
                                      <Shield className="w-3.5 h-3.5"/> Actif d'office
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-4 text-white font-bold text-xs">{(u.balance || 0).toLocaleString()} F</td>
                            <td className="px-4 py-4 text-right">
                                <button 
                                  onClick={() => setSelectedUser(u)} 
                                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981] hover:text-black transition"
                                >
                                  Superviser
                                </button>
                            </td>
                        </tr>
                      );
                    })}
                </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-600">
               Aucun utilisateur ne correspond aux critères de recherche.
            </div>
          )}
       </div>

       {/* Edit/Inspect Modal */}
       {selectedUser && (
         <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 font-mono" onClick={() => setSelectedUser(null)}>
           <div 
             className="w-full max-w-md bg-zinc-950 border border-[#10B981]/35 p-6 space-y-6 relative rounded-sm shadow-[0_0_50px_rgba(16,185,129,0.1)]"
             onClick={e => e.stopPropagation()}
           >
             <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
               <X className="w-5 h-5" />
             </button>

             <div className="space-y-1">
               <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block">SUPERVISION_UNIT // identity_profile</span>
               <h2 className="text-lg font-black text-white uppercase">{selectedUser.fullName || "Utilisateur"}</h2>
               <p className="text-xs text-[#10B981]/70 leading-none">ID: {selectedUser.uid}</p>
             </div>

             {/* User status info cards */}
             <div className="grid grid-cols-2 gap-3 bg-black p-3 border border-white/5 rounded-sm">
                <div>
                  <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">Solde Cash</span>
                  <span className="text-white text-xs font-bold font-mono">{(selectedUser.balance || 0).toLocaleString()} XOF</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">Gains Parrainage</span>
                  <span className="text-white text-xs font-bold font-mono">{(selectedUser.affiliateBalance || 0).toLocaleString()} XOF</span>
                </div>
             </div>

             {/* Role modification action */}
             <div className="space-y-2">
               <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Attribuer un Rôle Système</span>
               <div className="grid grid-cols-3 gap-2">
                 {["student", "instructor", "admin"].map((r) => (
                   <button
                     key={r}
                     disabled={updatingUser}
                     onClick={() => handleUpdateRole(selectedUser.uid, r as any)}
                     className={`py-2 text-[10px] font-black uppercase border transition-all ${
                       selectedUser.role === r 
                         ? 'bg-[#10B981] text-black border-transparent' 
                         : 'bg-black text-slate-400 border-[#10B981]/20 hover:border-[#10B981]/50'
                     }`}
                   >
                     {r}
                   </button>
                 ))}
               </div>
             </div>

             {/* Block/Unblock Actions */}
             <div className="space-y-2 pt-2 border-t border-white/5">
               <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Mesure Disciplinaire</span>
               {selectedUser.status === 'suspended' ? (
                 <button
                   disabled={updatingUser}
                   onClick={() => handleUpdateStatus(selectedUser.uid, "active")}
                   className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black uppercase text-xs tracking-widest hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                 >
                   <CheckCircle2 className="w-4 h-4" /> Réactiver l'accès
                 </button>
               ) : (
                 <button
                   disabled={updatingUser}
                   onClick={() => handleUpdateStatus(selectedUser.uid, "suspended")}
                   className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/30 font-black uppercase text-xs tracking-widest hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                 >
                   <Ban className="w-4 h-4" /> Suspendre le compte (Bannissement)
                 </button>
               )}
             </div>

             {updatingUser && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
               </div>
             )}
           </div>
         </div>
       )}
    </div>
  );
}

