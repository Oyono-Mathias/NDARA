import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, MoreVertical, X, 
  Eye, User, History, MessageSquare, Wallet, Landmark,
  ShieldCheck, UserCog, Edit3, SquareUser, Ban, Loader2,
  Award, BookOpen, KeyRound, AlertTriangle, ChevronLeft, CheckCircle2, ShieldAlert,
  Trash2, Play, Lock, Unlock, Zap
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, where, addDoc, runTransaction, limit, getDocs, writeBatch, orderBy, collectionGroup } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

export function AdminMembers() {
  const navigate = useNavigate();
  
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [activeDrawerDetail, setActiveDrawerDetail] = useState<'info' | 'certificates' | 'courses' | 'reports'>('info');
  const [actionData, setActionData] = useState<any[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [isResetPasswordConfirmOpen, setIsResetPasswordConfirmOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // We load a good chunk of users to allow client-side filtering/pagination
    const q = query(
      collection(db, 'users'), 
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setMembers(usersData);
      setIsLoading(false);
      
      setSelectedMember((prev: any) => {
        if (prev) {
          const updated = usersData.find(u => u.id === prev.id);
          return updated || prev;
        }
        return prev;
      });
    }, (error) => {
      console.error("Error fetching users: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setActiveDrawerDetail('info');
    setIsResetPasswordConfirmOpen(false);
    setActionData([]);
  }, [selectedMember?.id]);

  useEffect(() => {
    if (!selectedMember || activeDrawerDetail === 'info') return;
    setIsActionLoading(true);
    setActionData([]);
    let q;
    
    if (activeDrawerDetail === 'certificates') {
      q = query(collectionGroup(db, 'certificates'), where('studentId', '==', selectedMember.id));
    } else if (activeDrawerDetail === 'courses') {
      if (selectedMember.role === 'instructor' || selectedMember.role === 'Instructeur') {
        q = query(collection(db, 'courses'), where('instructorId', '==', selectedMember.id));
      } else {
        q = query(collection(db, 'enrollments'), where('studentId', '==', selectedMember.id));
      }
    } else if (activeDrawerDetail === 'reports') {
      q = query(collection(db, 'reports'), where('reportedUserId', '==', selectedMember.id));
    }

    if (!q) {
      setIsActionLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setActionData(data);
      setIsActionLoading(false);
    }, (error) => {
      console.error("Erreur de récupération des détails:", error);
      setIsActionLoading(false);
    });

    return () => unsubscribe();
  }, [activeDrawerDetail, selectedMember?.id]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (m.isDeleted) return false;
      
      const nameStr = (m.name || m.displayName || m.fullName || '').toLowerCase();
      const emailStr = (m.email || '').toLowerCase();
      const searchStr = searchTerm.toLowerCase();
      
      const matchesSearch = nameStr.includes(searchStr) || emailStr.includes(searchStr);
      
      const roleMatch = roleFilter === 'all' || m.role === roleFilter;
      
      const mStatus = m.status || (m.isBanned ? 'suspended' : 'active');
      const statusMatch = statusFilter === 'all' || mStatus === statusFilter;
      
      return matchesSearch && roleMatch && statusMatch;
    });
  }, [members, searchTerm, roleFilter, statusFilter]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }
  
  const logAudit = async (action: string, details: string, targetUserId: string) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        details,
        targetUserId,
        adminId: auth.currentUser?.uid || 'admin',
        timestamp: new Date()
      });
    } catch (e) {
      console.error("Erreur audit", e);
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      await logAudit("CHANGE_ROLE", `Role changed to ${newRole}`, userId);
      showToast("Rôle mis à jour avec succès");
    } catch (error) {
      showToast("Erreur lors de la mise à jour du rôle");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateProfile = async (userId: string, currentName: string) => {
    const newName = window.prompt("Nouveau nom d'utilisateur:", currentName);
    if (!newName) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', userId), { displayName: newName, fullName: newName, name: newName });
      await logAudit("EDIT_PROFILE", `Name changed to ${newName}`, userId);
      showToast("Profil mis à jour avec succès");
    } catch (error) {
      showToast("Erreur lors de la mise à jour");
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string, actionType: 'disable' | 'reactivate' | 'suspend') => {
    let newStatus = 'active';
    let msg = "Compte réactivé";
    
    if (actionType === 'disable') {
      newStatus = 'disabled';
      msg = "Compte désactivé";
    } else if (actionType === 'suspend') {
      newStatus = 'suspended';
      msg = "Compte suspendu (banni)";
    }
    
    if (!window.confirm(`Voulez-vous vraiment ${actionType === 'reactivate' ? 'réactiver' : actionType === 'disable' ? 'désactiver' : 'suspendre'} ce compte ?`)) return;
    
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', userId), { 
        status: newStatus,
        isBanned: actionType === 'suspend' 
      });
      await logAudit(actionType.toUpperCase(), `Status changed to ${newStatus}`, userId);
      showToast(msg);
    } catch (error) {
      showToast("Erreur de modification du statut");
    } finally {
      setIsMutating(false);
    }
  };
  
  const handleLogicalDelete = async (userId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer logiquement cet utilisateur ? Ses données seront conservées mais il n'apparaîtra plus.")) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', userId), { isDeleted: true, status: 'deleted' });
      await logAudit("LOGICAL_DELETE", "User softly deleted", userId);
      showToast("Utilisateur supprimé logiquement");
      setSelectedMember(null);
    } catch (error) {
      showToast("Erreur de suppression");
    } finally {
      setIsMutating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedMember || !selectedMember.email) {
       showToast("Cet utilisateur n'a pas d'adresse e-mail utilisable.");
       return;
    }
    setIsMutating(true);
    try {
      await sendPasswordResetEmail(auth, selectedMember.email);
      showToast("Un lien de réinitialisation a été envoyé.");
      setIsResetPasswordConfirmOpen(false);
      await logAudit("RESET_PASSWORD", "Password reset requested", selectedMember.id);
    } catch (error: any) {
      showToast("Erreur: " + error.message);
    } finally {
      setIsMutating(false);
    }
  };
  
  const handleRevokeCertificate = async (certId: string) => {
    if (!window.confirm("Voulez-vous révoquer ce certificat ?")) return;
    try {
      await updateDoc(doc(db, 'certificates', certId), { status: 'Revoked' });
      showToast("Certificat révoqué.");
    } catch (e) {
      showToast("Erreur de révocation.");
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] overflow-hidden animate-in fade-in duration-500 rounded-3xl border border-slate-800/50 bg-[#090E17]">
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 animate-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      {/* Main List */}
      <div className={clsx("flex-1 flex flex-col min-w-0 transition-all duration-300 relative", selectedMember ? "hidden md:flex md:w-1/2 lg:w-2/3" : "w-full")}>
        
        {/* Header & Filters */}
        <div className="p-6 border-b border-slate-800/50 bg-[#0B111A]">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-4 flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-500" />
            Membres
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <select 
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3.5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="student">Étudiants</option>
              <option value="instructor">Formateurs</option>
              <option value="admin">Admins</option>
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3.5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="disabled">Désactivés</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#090E17]">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <NdaraSkeleton className="h-16 w-full rounded-2xl" />
              <NdaraSkeleton className="h-16 w-full rounded-2xl" />
              <NdaraSkeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <EmptyState icon={Users} title="Aucun membre trouvé" />
          ) : (
            <div className="p-4 space-y-2">
              {paginatedMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                const mStatus = member.status || (member.isBanned ? 'suspended' : 'active');
                
                return (
                  <div 
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={clsx(
                      "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border group",
                      isSelected ? "bg-slate-800 border-emerald-500/30" : "bg-slate-800/20 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/50"
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative">
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          member.role === 'admin' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                          member.role === 'instructor' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                          "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        )}>
                          {member.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> :
                           member.role === 'instructor' ? <BookOpen className="w-5 h-5" /> :
                           <User className="w-5 h-5" />}
                        </div>
                        <div className={clsx(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#090E17]",
                          mStatus === 'active' ? "bg-emerald-500" : 
                          mStatus === 'suspended' ? "bg-red-500" : "bg-slate-500"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{member.fullName || member.displayName || member.name || member.email}</p>
                        <p className="text-slate-400 text-[11px] truncate flex items-center gap-2">
                          <span className="uppercase tracking-widest font-black text-slate-500">{member.role || 'student'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="font-mono">{member.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {mStatus === 'suspended' && <span className="hidden md:inline-flex px-2 py-1 bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-lg">Banni</span>}
                      {mStatus === 'disabled' && <span className="hidden md:inline-flex px-2 py-1 bg-slate-500/10 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg">Désactivé</span>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                        className="w-8 h-8 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors inline-flex items-center justify-center border border-slate-700/50 shadow-sm"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-800/50">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold disabled:opacity-50"
              >Précédent</button>
              <span className="text-slate-400 text-xs">Page {currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold disabled:opacity-50"
              >Suivant</button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedMember && (
        <div className={clsx(
          "fixed inset-0 z-50 md:static md:z-auto bg-[#090E17] md:w-1/2 lg:w-1/3 border-l border-slate-800/50 flex flex-col",
          "animate-in slide-in-from-right duration-300"
        )}>
          {/* Drawer Header */}
          <div className="h-16 border-b border-slate-800/50 flex items-center justify-between px-4 shrink-0 bg-[#0B111A]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedMember(null)}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xs font-black text-slate-500 tracking-widest uppercase">Profil Membre</span>
            </div>
            <button 
              onClick={() => setSelectedMember(null)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar relative">
            {isMutating && (
              <div className="absolute inset-0 bg-[#090E17]/80 backdrop-blur-sm z-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            )}

            {/* Profile Info */}
            <div className="p-6 border-b border-slate-800/50 relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center border border-slate-700/50 mb-4 shadow-xl">
                  {selectedMember.photoURL ? (
                    <img src={selectedMember.photoURL} alt="" className="w-full h-full rounded-3xl object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-500" />
                  )}
                </div>
                <h2 className="text-xl font-black text-white">{selectedMember.fullName || selectedMember.displayName || selectedMember.name || 'Sans nom'}</h2>
                <p className="text-sm text-slate-400 font-mono mt-1">{selectedMember.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    selectedMember.role === 'admin' ? "bg-red-500/10 text-red-400" :
                    selectedMember.role === 'instructor' ? "bg-purple-500/10 text-purple-400" :
                    "bg-blue-500/10 text-blue-400"
                  )}>
                    {selectedMember.role || 'Student'}
                  </span>
                  
                  {selectedMember.status === 'suspended' || selectedMember.isBanned ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">Banni</span>
                  ) : selectedMember.status === 'disabled' ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">Désactivé</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Actif</span>
                  )}
                  
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700/50 font-mono">
                    ID: {selectedMember.id.substring(0,6)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="p-6">
              <h3 className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-4 px-2">Actions d'administration</h3>
              <div className="space-y-2">
                <ActionButton 
                  icon={Edit3} 
                  label="Modifier le profil" 
                  onClick={() => handleUpdateProfile(selectedMember.id, selectedMember.fullName || selectedMember.displayName || '')}
                />
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleUpdateRole(selectedMember.id, 'student')}
                    className={clsx("py-3 rounded-xl text-xs font-bold transition-colors", selectedMember.role === 'student' ? "bg-blue-500 text-white" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800")}
                  >Rôle: Student</button>
                  <button 
                    onClick={() => handleUpdateRole(selectedMember.id, 'instructor')}
                    className={clsx("py-3 rounded-xl text-xs font-bold transition-colors", selectedMember.role === 'instructor' ? "bg-purple-500 text-white" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800")}
                  >Rôle: Instructor</button>
                  <button 
                    onClick={() => handleUpdateRole(selectedMember.id, 'admin')}
                    className={clsx("py-3 rounded-xl text-xs font-bold transition-colors col-span-2", selectedMember.role === 'admin' ? "bg-red-500 text-white" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800")}
                  >Rôle: Admin (Root)</button>
                </div>
                
                <ActionButton 
                  icon={KeyRound} 
                  label="Envoyer un email de réinit. MDP" 
                  onClick={() => setIsResetPasswordConfirmOpen(true)}
                />
                
                <div className="h-px bg-slate-800/50 my-4" />

                {(selectedMember.status === 'suspended' || selectedMember.isBanned) ? (
                   <ActionButton 
                     icon={CheckCircle2} 
                     label="Réactiver (Lever la suspension)" 
                     iconColor="text-emerald-500" 
                     textColor="text-emerald-500"
                     hoverBg="hover:bg-emerald-500/10 border border-emerald-500/20"
                     onClick={() => handleToggleStatus(selectedMember.id, selectedMember.status, 'reactivate')}
                   />
                ) : (
                   <ActionButton 
                     icon={Ban} 
                     label="Suspendre (Bannir)" 
                     iconColor="text-orange-500" 
                     textColor="text-orange-500"
                     hoverBg="hover:bg-orange-500/10 border border-orange-500/20"
                     onClick={() => handleToggleStatus(selectedMember.id, selectedMember.status, 'suspend')}
                   />
                )}
                
                {selectedMember.status === 'disabled' ? (
                   <ActionButton 
                     icon={Unlock} 
                     label="Activer le compte" 
                     onClick={() => handleToggleStatus(selectedMember.id, selectedMember.status, 'reactivate')}
                   />
                ) : (
                   <ActionButton 
                     icon={Lock} 
                     label="Désactiver le compte" 
                     onClick={() => handleToggleStatus(selectedMember.id, selectedMember.status, 'disable')}
                   />
                )}

                <div className="h-px bg-slate-800/50 my-4" />
                
                <ActionButton 
                  icon={Trash2} 
                  label="Suppression Logique" 
                  iconColor="text-red-500" 
                  textColor="text-red-500"
                  hoverBg="hover:bg-red-500/10 border border-red-500/20"
                  onClick={() => handleLogicalDelete(selectedMember.id)}
                />
              </div>
            </div>
          </div>
          
          {/* Password Reset Modal layer */}
          {isResetPasswordConfirmOpen && (
            <div className="absolute inset-0 z-50 bg-[#090E17]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                <KeyRound className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl text-white font-black text-center tracking-tight mb-2">Réinitialiser le mot de passe ?</h3>
              <p className="text-slate-400 text-sm text-center mb-8 max-w-[280px]">
                Un lien de réinitialisation sera envoyé à <b>{selectedMember.email}</b>.
              </p>
              <div className="w-full space-y-3">
                <button 
                  onClick={handleResetPassword}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                >
                  Confirmer l'envoi
                </button>
                <button 
                  onClick={() => setIsResetPasswordConfirmOpen(false)}
                  className="w-full py-4 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-widest text-xs rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function ActionButton({ 
    icon: Icon, 
    label, 
    iconColor = "text-slate-400", 
    textColor = "text-slate-300",
    hoverBg = "hover:bg-slate-800/50",
    onClick,
    disabled
}: { 
    icon: any, 
    label: string, 
    iconColor?: string, 
    textColor?: string,
    hoverBg?: string,
    onClick?: (e: React.MouseEvent) => void,
    disabled?: boolean
}) {
    return (
        <button 
          onClick={onClick}
          disabled={disabled}
          className={clsx("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors active:scale-[0.98]", hoverBg, disabled && "opacity-50 cursor-not-allowed")}
        >
            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-800/50", hoverBg !== "hover:bg-slate-800/50" && hoverBg.replace("hover:", ""))}>
               <Icon className={clsx("w-4 h-4", iconColor)} />
            </div>
            <span className={clsx("text-sm font-bold tracking-tight", textColor)}>
                {label}
            </span>
        </button>
    );
}
