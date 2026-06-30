import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, X, 
  Eye, User, History, MessageSquare, Wallet, Landmark,
  ShieldCheck, UserCog, Edit3, SquareUser, Ban, Loader2,
  Award, BookOpen, KeyRound, AlertTriangle, ChevronLeft, CheckCircle2, ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, where, addDoc, runTransaction, limit } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

export function AdminMembers() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New states for actions
  const [activeDrawerDetail, setActiveDrawerDetail] = useState<'info' | 'certificates' | 'courses' | 'reports'>('info');
  const [actionData, setActionData] = useState<any[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isResetPasswordConfirmOpen, setIsResetPasswordConfirmOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'student'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setMembers(usersData);
      setIsLoading(false);
      // Update selected member if it is open and data has changed
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

  // Reset drawer state when member changes
  useEffect(() => {
    setActiveDrawerDetail('info');
    setIsResetPasswordConfirmOpen(false);
    setActionData([]);
  }, [selectedMember?.id]);

  // Load sub-collection data dynamically
  useEffect(() => {
    if (!selectedMember || activeDrawerDetail === 'info') return;

    setIsActionLoading(true);
    setActionData([]);

    let q;
    if (activeDrawerDetail === 'certificates') {
      q = query(collection(db, 'certificates'), where('userId', '==', selectedMember.id));
    } else if (activeDrawerDetail === 'courses') {
      if (selectedMember.role === 'instructor' || selectedMember.role === 'Instructeur') {
        q = query(collection(db, 'courses'), where('instructorId', '==', selectedMember.id));
      } else {
        q = query(collection(db, 'enrollments'), where('userId', '==', selectedMember.id));
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

  const filteredMembers = members.filter(m => {
    const nameStr = m.name || m.displayName || '';
    const emailStr = m.email || '';
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
           emailStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    setIsMutating(true);
    let newRole = 'student';
    if (currentRole === 'student') newRole = 'instructor';
    else if (currentRole === 'instructor') newRole = 'admin';
    else if (currentRole === 'admin') newRole = 'student';

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setToastMessage("Rôle mis à jour avec succès");
    } catch (error) {
      console.error("Error updating role:", error);
      setToastMessage("Erreur lors de la mise à jour du rôle");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
      setIsMutating(false);
    }
  };

  const handleUpdateProfile = async (userId: string) => {
    const newName = window.prompt("Nouveau nom d'utilisateur (Laissez vide pour annuler):");
    if (!newName) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', userId), { displayName: newName, name: newName });
      setToastMessage("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage("Erreur lors de la mise à jour");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
      setIsMutating(false);
    }
  };

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    if (!window.confirm(isBanned ? "Voulez-vous vraiment réactiver ce compte ?" : "Voulez-vous vraiment suspendre ce compte (bannissement) ?")) return;
    setIsMutating(true);
    try {
      if (isBanned) {
        await updateDoc(doc(db, 'users', userId), { status: 'active', isBanned: false });
        setToastMessage("Compte réactivé avec succès");
      } else {
        await updateDoc(doc(db, 'users', userId), { status: 'suspended', isBanned: true });
        setToastMessage("Compte suspendu avec succès");
      }
    } catch (error) {
      console.error("Error toggling ban status:", error);
      setToastMessage("Erreur lors de la suspension");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
      setIsMutating(false);
    }
  };

  const handleWalletTransaction = async (userId: string, amount: number) => {
    const actionName = amount > 0 ? "Recharger" : "Débiter";
    if (!window.confirm(`Voulez-vous vraiment ${actionName} le portefeuille de ${amount} ?`)) return;
    setIsMutating(true);
    try {
      await runTransaction(db, async (t) => {
        const userRef = doc(db, 'users', userId);
        const txRef = doc(collection(db, 'transactions'));
        
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("Utilisateur introuvable");
        
        const currentBalance = userDoc.data()?.balance || 0;
        
        t.update(userRef, {
          balance: currentBalance + amount
        });
        
        t.set(txRef, {
          type: 'admin_adjustment',
          status: 'success',
          currency: 'XAF',
          amount: amount,
          userId: userId,
          createdAt: new Date(),
          adminId: auth.currentUser?.uid || 'admin'
        });
      });
      setToastMessage("Solde mis à jour avec succès");
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      setToastMessage("Erreur lors de la mise à jour");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
      setIsMutating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedMember || !selectedMember.email) {
       setToastMessage("Cet utilisateur n'a pas d'adresse e-mail utilisable.");
       setTimeout(() => setToastMessage(null), 3000);
       return;
    }
    setIsMutating(true);
    try {
      await sendPasswordResetEmail(auth, selectedMember.email);
      setIsResetPasswordConfirmOpen(false);
      setToastMessage("Lien de réinitialisation envoyé avec succès");
    } catch (error) {
      console.error("Erreur réinitialisation MDP:", error);
      setToastMessage("Erreur lors de l'envoi de l'e-mail");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
      setIsMutating(false);
    }
  };

  const handleImpersonate = (userId: string) => {
    setIsMutating(true);
    setTimeout(() => {
      setToastMessage(`Connexion en tant que ${userId.substring(0,8)}...`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsMutating(false);
    }, 500);
  };

  const handleRevokeCertificate = async (certId: string) => {
    try {
      await updateDoc(doc(db, 'certificates', certId), { status: 'Revoked' });
    } catch (error) {
      console.error("Erreur révocation certificat:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 flex flex-col items-stretch space-y-6 animate-in fade-in duration-500 pb-20 relative">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
           <div className="h-12 flex-1 bg-slate-800/50 rounded-2xl animate-pulse"></div>
           <div className="h-12 w-32 bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <NdaraSkeleton type="table" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 flex flex-col items-stretch space-y-6 animate-in fade-in duration-500 pb-20 relative">
       <header>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Gestion des Membres</h1>
        <p className="text-slate-400 mt-1 text-sm">Recherchez, filtrez et gérez tous les membres de la plateforme.</p>
      </header>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un membre par nom ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-500/70"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-700/50 transition-colors">
          <Filter className="w-4 h-4" /> Filtres
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/30">
                <th className="p-4 pl-6">Utilisateur</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Inscription</th>
                <th className="p-4">Statut</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/30">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      {member.avatar || member.photoURL ? (
                         <img src={member.avatar || member.photoURL} alt="Avatar" className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                          <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{member.name || member.displayName || 'Utilisateur Anonyme'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={clsx(
                      "inline-flex items-center justify-center text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-widest",
                      (member.role === 'instructor' || member.role === 'Instructeur')
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20" 
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    )}>
                      {member.role || 'student'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs font-medium">
                    {member.signupDate || member.signup || 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="relative flex h-2.5 w-2.5">
                        {!member.isBanned && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>}
                        <span className={clsx("relative inline-flex rounded-full h-2.5 w-2.5", !member.isBanned ? "bg-emerald-500" : "bg-red-500")}></span>
                      </span>
                      <span className="text-xs font-bold text-slate-300">{member.isBanned ? 'Banni' : (member.status || 'Actif')}</span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="w-8 h-8 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors inline-flex items-center justify-center border border-slate-700/50 shadow-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMembers.length === 0 && (
             <div className="mt-6">
                <EmptyState title="Aucun membre" message="Aucun utilisateur ne correspond à ces critères." icon={Users} />
             </div>
          )}
        </div>
      </div>

      {/* Admin User Context Menu (Bottom Sheet on Mobile / Modal on Desktop) */}
      {selectedMember && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-300 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          />

          {/* Container */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#090E17] rounded-t-3xl border-t border-slate-800 p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto hide-scrollbar md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:h-auto md:rounded-3xl md:border shadow-2xl">
              
              {/* Drag handle (Mobile only) */}
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6 md:hidden" />

              {/* Close button (Desktop) */}
              <button 
                onClick={() => setSelectedMember(null)}
                className="hidden md:flex absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-50"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Toast Message */}
              {toastMessage && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-widest flex items-center gap-2 shadow-lg z-50 animate-in slide-in-from-top fade-in whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4" />
                  {toastMessage}
                </div>
              )}

              {activeDrawerDetail === 'info' ? (
                <>
                  {/* Header (Profil cible) */}
                  <div className="flex items-center gap-4 mb-8 pt-2">
                    {selectedMember.avatar || selectedMember.photoURL ? (
                      <img src={selectedMember.avatar || selectedMember.photoURL} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-slate-700" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                          <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                        <h3 className="text-white font-black text-xl tracking-tight">{selectedMember.name || selectedMember.displayName || 'Utilisateur Anonyme'}</h3>
                        <p className="text-slate-500 font-mono text-[10px] mt-0.5 uppercase tracking-widest flex items-center gap-2">
                            #{selectedMember.id.substring(0, 8)}
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            {selectedMember.role || 'student'}
                        </p>
                        {selectedMember.balance !== undefined && (
                          <p className="text-emerald-400 font-mono text-[10px] mt-0.5 uppercase tracking-widest flex items-center gap-2">
                            Solde: {selectedMember.balance} XAF
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Action Sections */}
                  <div className="space-y-6 pb-6 md:pb-2">
                    
                    {/* Section Info & Sécurité */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Info & Sécurité</h4>
                      <ActionButton icon={Eye} label="Détails & Soldes" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveDrawerDetail('info'); }} />
                      <ActionButton icon={User} label="Voir profil public" onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(selectedMember.role === 'instructor' ? `/instructor/p/${selectedMember.slug || selectedMember.id}` : `/profile`); }} />
                      <ActionButton icon={History} label="Logs Sécurité" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveDrawerDetail('reports'); }} />
                    </div>

                    {/* Section Communication */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Communication</h4>
                      <ActionButton icon={MessageSquare} label="Envoyer message" onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate('/messages'); }} />
                    </div>

                    {/* Section Finances */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Finances</h4>
                      <ActionButton 
                        icon={Wallet} 
                        label="Recharger Wallet (+5000)" 
                        iconColor="text-emerald-500" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleWalletTransaction(selectedMember.id, 5000); }}
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={Landmark} 
                        label="Débiter Wallet (-5000)" 
                        iconColor="text-amber-500" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleWalletTransaction(selectedMember.id, -5000); }}
                        disabled={isMutating}
                      />
                    </div>

                    {/* Section Formation & Rôles */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Formation & Rôles</h4>
                      <ActionButton icon={ShieldCheck} label="Gérer l'accès & Droits" disabled={isMutating} onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} />
                      <ActionButton 
                        icon={UserCog} 
                        label="Changer Rôle" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleUpdateRole(selectedMember.id, selectedMember.role); }}
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={Edit3} 
                        label="Modifier le profil" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleUpdateProfile(selectedMember.id); }}
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={Award} 
                        label="Voir les certificats" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveDrawerDetail('certificates'); }} 
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={BookOpen} 
                        label="Historique des cours" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveDrawerDetail('courses'); }} 
                        disabled={isMutating}
                      />
                    </div>

                    {/* Section Restrictions (Critique Sécurité) */}
                    <div className="space-y-1 pt-6 border-t border-slate-800">
                      <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Restrictions Système</h4>
                      <ActionButton 
                        icon={SquareUser} 
                        label="Se connecter en tant que" 
                        iconColor="text-slate-400" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleImpersonate(selectedMember.id); }}
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={Ban} 
                        label={selectedMember.isBanned ? "Réactiver le compte" : "Suspendre le compte"} 
                        iconColor={selectedMember.isBanned ? "text-emerald-500" : "text-red-500"} 
                        textColor={selectedMember.isBanned ? "text-emerald-500" : "text-red-500"} 
                        hoverBg={selectedMember.isBanned ? "hover:bg-emerald-500/10" : "hover:bg-red-500/10"} 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleBan(selectedMember.id, !!selectedMember.isBanned); }}
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={KeyRound} 
                        label="Réinitialiser le mot de passe" 
                        iconColor="text-orange-400" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleResetPassword(); }} 
                        disabled={isMutating}
                      />
                      <ActionButton 
                        icon={AlertTriangle} 
                        label="Signalements & avis" 
                        iconColor="text-yellow-500" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveDrawerDetail('reports'); }} 
                        disabled={isMutating}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full fade-in animate-in pb-6 md:pb-2 min-h-[300px]">
                  <div className="flex items-center gap-4 mb-6">
                    <button 
                      onClick={() => setActiveDrawerDetail('info')}
                      className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-white font-black text-xl tracking-tight uppercase">
                      {activeDrawerDetail === 'certificates' && "Certificats"}
                      {activeDrawerDetail === 'courses' && "Historique"}
                      {activeDrawerDetail === 'reports' && "Signalements"}
                    </h3>
                  </div>

                  {isActionLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : actionData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-4">
                        <Filter className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune donnée trouvée</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto hide-scrollbar max-h-[50vh]">
                      {activeDrawerDetail === 'certificates' && actionData.map(cert => (
                        <div key={cert.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                              <Award className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm tracking-tight">{cert.courseTitle || 'Formation Inconnue'}</p>
                              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                                {cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString() : 'Date inconnue'}
                              </p>
                            </div>
                          </div>
                          {cert.status !== 'Revoked' ? (
                            <button 
                              onClick={() => handleRevokeCertificate(cert.id)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                            >
                              Révoquer
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              Révoqué
                            </span>
                          )}
                        </div>
                      ))}

                      {activeDrawerDetail === 'courses' && actionData.map(course => (
                        <div key={course.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-bold text-sm tracking-tight line-clamp-1">{course.title || course.courseTitle || 'Cours'}</p>
                            <div className="flex items-center gap-2 mt-1.5 w-full max-w-[200px]">
                              <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress || (selectedMember.role === 'instructor' ? 100 : 0)}%` }}></div>
                              </div>
                              <span className="text-slate-500 text-[9px] font-bold">{course.progress || (selectedMember.role === 'instructor' ? 100 : 0)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {activeDrawerDetail === 'reports' && actionData.map(report => (
                        <div key={report.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4">
                          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shrink-0">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm tracking-tight">{report.reason || 'Comportement Inapproprié'}</p>
                            <p className="text-slate-400 text-xs mt-1 leading-snug">{report.details || 'Aucun détail fourni.'}</p>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2 flex items-center gap-1.5">
                              <User className="w-3 h-3" />
                              Par {report.reporterName || report.reporterId || 'Anonyme'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Password Reset Modal layer */}
              {isResetPasswordConfirmOpen && (
                <div className="absolute inset-0 z-50 bg-[#090E17]/95 backdrop-blur-md rounded-t-3xl md:rounded-3xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                    <KeyRound className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl text-white font-black text-center tracking-tight mb-2">Réinitialiser le mot de passe ?</h3>
                  <p className="text-slate-400 text-sm text-center mb-8 max-w-[280px]">
                    Un lien de réinitialisation sera envoyé à <b>{selectedMember.email}</b>. Cette action est irréversible.
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
        </>
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


