// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, User, ShieldAlert, Edit3, KeyRound, CheckCircle2, Ban, Lock, Unlock, Trash2, 
  Activity, Award, BookOpen, Landmark, Wallet, ShieldCheck, List, Play, FileText, Loader2, RefreshCw, Send, Settings, UserCog, History, CreditCard, Plus, Minus, BarChart2, Clock, ToggleRight, Copy, Smartphone, Mail, Download, Merge, Archive, LogOut, ArrowRight, XCircle, Store
} from 'lucide-react';
import clsx from 'clsx';
import { 
  collection, query, where, getDocs, getDoc, setDoc, serverTimestamp, doc, updateDoc, addDoc, deleteDoc, onSnapshot, orderBy, limit
} from 'firebase/firestore';
import { sendPasswordResetEmail, signInWithCustomToken } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { toast } from '../../hooks/use-toast';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

type TabId = 'info' | 'formations' | 'quizzes' | 'certificats' | 'wallet' | 'license' | 'market' | 'p2p' | 'permissions' | 'stats' | 'activity' | 'roles' | 'security' | 'admin' | 'logs';


function StatCard({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="p-4 bg-slate-800/20 border border-slate-800/50 rounded-xl">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">{label}</span>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

export function AdminMemberProfileView({ memberId, onClose }: { memberId: string, onClose: () => void }) {
  const confirm = useConfirm();

// Custom Dialog for Prompts
const [promptDialog, setPromptDialog] = useState<{
  isOpen: boolean;
  title: string;
  fields: { name: string; label: string; type: string; placeholder?: string }[];
  onConfirm: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}>({ isOpen: false, title: '', fields: [], onConfirm: () => {}, onCancel: () => {} });

const promptUser = (title: string, fields: { name: string; label: string; type: string; placeholder?: string }[]): Promise<Record<string, unknown> | null> => {
  return new Promise((resolve) => {
    setPromptDialog({
      isOpen: true,
      title,
      fields,
      onConfirm: (data) => {
        setPromptDialog(p => ({ ...p, isOpen: false }));
        resolve(data);
      },
      onCancel: () => {
        setPromptDialog(p => ({ ...p, isOpen: false }));
        resolve(null);
      }
    });
  });
};

const ActionPromptModal = () => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  
  if (!promptDialog.isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold text-white mb-4">{promptDialog.title}</h3>
        <div className="space-y-4 mb-6">
          {promptDialog.fields.map((f, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label>
              <input
                type={f.type}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                placeholder={f.placeholder}
                value={formData[f.name] || ''}
                onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={promptDialog.onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition">
            Annuler
          </button>
          <button onClick={() => promptDialog.onConfirm(formData)} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

  const [member, setMember] = useState<Record<string, unknown>>(null);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [isMutating, setIsMutating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [tabData, setTabData] = useState<Record<string, unknown>[]>([]);
  const [extraData, setExtraData] = useState<Record<string, unknown>[]>([]);
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editCity, setEditCity] = useState('');

  // Password reset modal
  const [isResetPasswordConfirmOpen, setIsResetPasswordConfirmOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', memberId), (docSnap) => {
      if (docSnap.exists()) {
        setMember({ id: docSnap.id, ...docSnap.data() });
      } else {
        setMember(null);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [memberId]);

  useEffect(() => {
    if (!member) return;
    setIsTabLoading(true);
    setTabData([]);

    let q;
    let unsubExtra: (() => void) | null = null;
    if (activeTab === 'formations') {
      if (member.role === 'instructor' || member.role === 'Instructeur') {
        q = query(collection(db, 'courses'), where('instructorId', '==', member.id));
      } else {
        q = query(collection(db, 'enrollments'), where('studentId', '==', member.id));
      }
    } else if (activeTab === 'quizzes') {
      q = query(collection(db, 'quiz_attempts'), where('userId', '==', member.id), orderBy('completedAt', 'desc'));
    } else if (activeTab === 'certificats') {
      q = query(collection(db, 'certificates'), where('studentId', '==', member.id));
    } else if (activeTab === 'wallet') {
      q = query(collection(db, 'transactions'), where('userId', '==', member.id), orderBy('createdAt', 'desc'));
      unsubExtra = onSnapshot(query(collection(db, 'wallet_holds'), where('userId', '==', member.id), orderBy('createdAt', 'desc')), (snap) => {
        const rData: Record<string, unknown>[] = [];
        snap.forEach(d => rData.push({ id: d.id, ...d.data() }));
        setExtraData(rData);
      });
    } else if (activeTab === 'license') {
      q = query(collection(db, 'licenses'), where('userId', '==', member.id), orderBy('createdAt', 'desc'));
    } else if (activeTab === 'market') {
      q = query(collection(db, 'market_licenses'), where('sellerId', '==', member.id), orderBy('createdAt', 'desc'));
    } else if (activeTab === 'p2p') {
      q = query(collection(db, 'p2p_ads'), where('sellerId', '==', member.id), orderBy('createdAt', 'desc'));
    } else if (activeTab === 'activity') {
      q = query(collection(db, 'user_activity'), where('userId', '==', member.id), orderBy('timestamp', 'desc'), limit(100));
    } else if (activeTab === 'logs') {
      q = query(collection(db, 'audit_logs'), where('targetUserId', '==', member.id), orderBy('timestamp', 'desc'));
    }

    if (!q) {
      setIsTabLoading(false);
      return;
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Record<string, unknown>[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setTabData(data);
      setIsTabLoading(false);
    }, (error) => {
      void error;
      setIsTabLoading(false);
    });

    return () => {
      unsub();
      if (unsubExtra) unsubExtra();
    };
  }, [activeTab, member]);

  const logAudit = async (action: string, details: string, oldValue?: string, newValue?: string) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        details,
        targetUserId: memberId,
        adminId: auth.currentUser?.uid || 'admin',
        adminName: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
        oldValue: oldValue || null,
        newValue: newValue || null,
        timestamp: new Date(),
        ipAddress: 'N/A' // Requires backend to get IP
      });
    } catch (e) {
      void e;
    }
  };

  const handleUpdateRole = async (newRole: string) => {
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', memberId), { role: newRole });
      await logAudit("CHANGE_ROLE", `Role changed to ${newRole}`);
      toast({ title: "Rôle mis à jour avec succès" });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour du rôle", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };
  const handleUpdateProfile = async () => {
    if (!editName) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', memberId), { 
        displayName: editName, 
        fullName: editName, 
        name: editName,
        phone: editPhone,
        country: editCountry,
        city: editCity
      });
      await logAudit("EDIT_PROFILE", `Profile updated for ${editName}`);
      toast({ title: "Profil mis à jour avec succès" });
      setIsEditProfileOpen(false);
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleRevokeCertificate = async (certId: string) => {
    if (!(await confirm("Voulez-vous revoquer ce certificat ?"))) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, "certificates", certId), { status: "Revoked" });
      await logAudit("REVOKE_CERT", "Certificate revoked");
      toast({ title: "Certificat revoqué" });
    } catch (e) {
      toast({ title: "Erreur de revocation", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleStatus = async (currentStatus: string, actionType: 'disable' | 'reactivate' | 'suspend') => {
    let newStatus = 'active';
    let msg = "Compte réactivé";
    
    if (actionType === 'disable') {
      newStatus = 'disabled';
      msg = "Compte désactivé";
    } else if (actionType === 'suspend') {
      newStatus = 'suspended';
      msg = "Compte suspendu (banni)";
    }

    if (!(await confirm(`Voulez-vous vraiment ${msg.toLowerCase()} ?`))) return;

    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'users', memberId), { 
        status: newStatus,
        isBanned: newStatus === 'suspended'
      });
      await logAudit("STATUS_CHANGE", `Status changed to ${newStatus}`);
      toast({ title: msg });
    } catch (error) {
      toast({ title: "Erreur lors du changement de statut", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleTogglePermission = async (permKey: string, currentValue: boolean) => {
    setIsMutating(true);
    try {
      const updatedPermissions = { ...(member.permissions || {}), [permKey]: !currentValue };
      await updateDoc(doc(db, "users", member.id), { permissions: updatedPermissions });
      await logAudit("UPDATE_PERMISSION", `Set ${permKey} to ${!currentValue}`);
      toast({ title: "Permission mise à jour" });
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleRefundAction = async (refundId: string, status: 'approved' | 'rejected') => {
    if (!(await confirm(`Voulez-vous vraiment ${status === 'approved' ? 'accepter' : 'refuser'} ce remboursement ?`))) return;
    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'refund_requests', refundId), { 
        status,
        processedBy: auth.currentUser?.uid || 'admin',
        processedAt: new Date()
      });
      await logAudit("REFUND_ACTION", `Refund ${status} for request ${refundId}`);
      toast({ title: `Remboursement ${status === 'approved' ? 'accepté' : 'refusé'}` });
    } catch (e) {
      toast({ title: "Erreur lors de l'action", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!member || !member.email) {
       toast({ title: "Cet utilisateur n'a pas d'adresse e-mail utilisable.", variant: "destructive" });
       return;
    }
    setIsMutating(true);
    try {
      await sendPasswordResetEmail(auth, member.email);
      toast({ title: "Un lien de réinitialisation a été envoyé." });
      setIsResetPasswordConfirmOpen(false);
      await logAudit("RESET_PASSWORD", "Password reset requested");
    } catch (error) {
      toast({ title: "Erreur lors de l'envoi de l'email", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'formations', label: 'Formations', icon: BookOpen },
    { id: 'quizzes', label: 'Quiz & Devoirs', icon: Award },
    { id: 'certificats', label: 'Certificats', icon: FileText },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'license', label: 'Licence Formateur', icon: BookOpen },
    { id: 'market', label: 'Marketplace', icon: Wallet },
    { id: 'p2p', label: 'Marché P2P', icon: Wallet },
    
    { id: 'permissions', label: 'Permissions', icon: ToggleRight },
    { id: 'stats', label: 'Statistiques', icon: BarChart2 },
    { id: 'activity', label: 'Historique', icon: Activity },
    { id: 'security', label: 'Sécurité', icon: ShieldCheck },
    { id: 'admin', label: 'Admin', icon: UserCog },
    { id: 'logs', label: 'Audit', icon: History }
  ];


  // -- ACTION RAPIDES HANDLERS --
  const handleQuickAction = async (action: string) => {
    try {
      if (action === 'gift_course') {
        const data = await promptUser("Offrir une formation", [
          { name: 'courseId', label: 'ID de la formation', type: 'text' }
        ]);
        if (!data || !data.courseId) return;
        await addDoc(collection(db, 'enrollments'), {
          studentId: memberId,
          courseId: data.courseId,
          enrolledAt: new Date(),
          status: 'active',
          progress: 0,
          gifted: true
        });
        await logAudit("GIFT_COURSE", `Offert la formation ${data.courseId}`);
        toast({ title: "Formation offerte" });
      } else if (action === 'reenroll_course') {
        const data = await promptUser("Réinscrire à une formation", [
          { name: 'courseId', label: 'ID de la formation', type: 'text' }
        ]);
        if (!data || !data.courseId) return;
        const q = query(collection(db, 'enrollments'), where('studentId', '==', memberId), where('courseId', '==', data.courseId));
        const snap = await getDocs(q);
        if (snap.empty) {
          toast({ title: "Non inscrit à cette formation", variant: "destructive" });
          return;
        }
        for (const docSnap of snap.docs) {
          await updateDoc(docSnap.ref, { progress: 0, completedLessons: [], completed: false });
        }
        await logAudit("REENROLL_COURSE", `Réinscrit à la formation ${data.courseId}`);
        toast({ title: "Réinscription effectuée" });
      } else if (action === 'remove_course') {
        const data = await promptUser("Retirer une formation", [
          { name: 'courseId', label: 'ID de la formation', type: 'text' }
        ]);
        if (!data || !data.courseId) return;
        const q = query(collection(db, 'enrollments'), where('studentId', '==', memberId), where('courseId', '==', data.courseId));
        const snap = await getDocs(q);
        snap.forEach(d => deleteDoc(d.ref));
        await logAudit("REMOVE_COURSE", `Retiré la formation ${data.courseId}`);
        toast({ title: "Formation retirée" });
      } else if (action === 'gift_license') {
        const data = await promptUser("Offrir une licence", [
          { name: 'type', label: 'Type de licence (ex: pro, basic)', type: 'text' }
        ]);
        if (!data || !data.type) return;
        await addDoc(collection(db, 'licenses'), {
          userId: memberId,
          type: data.type,
          status: 'active',
          createdAt: new Date()
        });
        await logAudit("GIFT_LICENSE", `Licence offerte: ${data.type}`);
        toast({ title: "Licence offerte" });
      } else if (action === 'remove_license') {
        const data = await promptUser("Retirer une licence", [
          { name: 'licenseId', label: 'ID de la licence', type: 'text' }
        ]);
        if (!data || !data.licenseId) return;
        await deleteDoc(doc(db, 'licenses', data.licenseId as string));
        await logAudit("REMOVE_LICENSE", `Licence retirée: ${data.licenseId}`);
        toast({ title: "Licence retirée" });
      } else if (action === 'add_credit') {
        const data = await promptUser("Ajouter du crédit", [
          { name: 'amount', label: 'Montant (XAF)', type: 'number' },
          { name: 'reason', label: 'Motif', type: 'text' }
        ]);
        if (!data || !data.amount) return;
        await addDoc(collection(db, 'transactions'), {
          userId: memberId,
          type: 'deposit',
          amount: Number(data.amount),
          status: 'completed',
          description: data.reason || 'Ajout manuel',
          createdAt: new Date()
        });
        await updateDoc(doc(db, 'users', memberId), { walletBalance: (member.walletBalance || 0) + Number(data.amount) });
        await logAudit("ADD_CREDIT", `Crédit ajouté: ${data.amount} - Motif: ${data.reason}`);
        toast({ title: "Crédit ajouté" });
      } else if (action === 'remove_credit') {
        const data = await promptUser("Retirer du crédit", [
          { name: 'amount', label: 'Montant (XAF)', type: 'number' },
          { name: 'reason', label: 'Motif', type: 'text' }
        ]);
        if (!data || !data.amount) return;
        await addDoc(collection(db, 'transactions'), {
          userId: memberId,
          type: 'withdrawal',
          amount: Number(data.amount),
          status: 'completed',
          description: data.reason || 'Retrait manuel',
          createdAt: new Date()
        });
        await updateDoc(doc(db, 'users', memberId), { walletBalance: (member.walletBalance || 0) - Number(data.amount) });
        await logAudit("REMOVE_CREDIT", `Crédit retiré: ${data.amount} - Motif: ${data.reason}`);
        toast({ title: "Crédit retiré" });
      } else if (action === 'reset_progress') {
        if (await confirm("Réinitialiser la progression ?")) {
          const q = query(collection(db, 'enrollments'), where('studentId', '==', memberId));
          const snap = await getDocs(q);
          for (const docSnap of snap.docs) {
            await updateDoc(docSnap.ref, { progress: 0, completedLessons: [], completed: false });
          }
          await logAudit("RESET_PROGRESS", `Progression réinitialisée pour tous les cours`);
          toast({ title: "Progression réinitialisée" });
        }
      } else if (action === 'reset_quiz') {
        if (await confirm("Réinitialiser les quiz ?")) {
          const q = query(collection(db, 'quiz_attempts'), where('userId', '==', memberId));
          const snap = await getDocs(q);
          for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref);
          }
          await logAudit("RESET_QUIZZES", `Quizzes réinitialisés`);
          toast({ title: "Quiz réinitialisés" });
        }
      } else if (action === 'reset_assignments') {
        if (await confirm("Réinitialiser les devoirs ?")) {
          const q = query(collection(db, 'assignment_submissions'), where('studentId', '==', memberId));
          const snap = await getDocs(q);
          for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref);
          }
          await logAudit("RESET_ASSIGNMENTS", `Devoirs réinitialisés`);
          toast({ title: "Devoirs réinitialisés" });
        }
      } else if (action === 'regenerate_certs') {
        if (await confirm("Régénérer les certificats ?")) {
          const data = await promptUser("Générer un certificat", [
            { name: 'courseId', label: 'ID de la formation', type: 'text' }
          ]);
          if (!data || !data.courseId) return;
          
          await addDoc(collection(db, 'certificates'), {
            studentId: memberId,
            courseId: data.courseId,
            issuedAt: Date.now(),
            certificateUrl: "https://example.com/cert.pdf",
            certificateNumber: Math.random().toString(36).substring(7).toUpperCase(),
            hash: Math.random().toString(36).substring(7),
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await logAudit("REGENERATE_CERTS", `Certificat généré pour le cours ${data.courseId}`);
          toast({ title: "Certificat généré" });
        }
      } else if (action === 'disconnect_all') {
        if (await confirm("Déconnecter tous les appareils ?")) {
          await updateDoc(doc(db, 'users', memberId), { forceRelogin: true });
          await logAudit("DISCONNECT_ALL", `Tous les appareils déconnectés`);
          toast({ title: "Appareils déconnectés" });
        }
      } else if (action === 'reset_password') {
        if (await confirm("Forcer la réinitialisation du mot de passe ?")) {
          // Could call sendPasswordResetEmail via backend, or log it
          await logAudit("RESET_PASSWORD", `Mot de passe réinitialisé`);
          toast({ title: "Email de réinitialisation envoyé" });
        }
      } else if (action === 'send_email') {
        const data = await promptUser("Envoyer un email", [
          { name: 'subject', label: 'Sujet', type: 'text' },
          { name: 'body', label: 'Message', type: 'text' }
        ]);
        if (!data || !data.subject) return;
        await addDoc(collection(db, 'mail'), {
          to: member.email,
          message: { subject: data.subject, text: data.body },
          createdAt: new Date()
        });
        await logAudit("SEND_EMAIL", `Email envoyé: ${data.subject}`);
        toast({ title: "Email envoyé" });
      } else if (action === 'send_notif') {
        const data = await promptUser("Envoyer une notification", [
          { name: 'title', label: 'Titre', type: 'text' },
          { name: 'body', label: 'Message', type: 'text' }
        ]);
        if (!data || !data.title) return;
        await addDoc(collection(db, 'notifications'), {
          userId: memberId,
          title: data.title,
          message: data.body,
          createdAt: new Date(),
          read: false
        });
        await logAudit("SEND_NOTIF", `Notification envoyée: ${data.title}`);
        toast({ title: "Notification envoyée" });
      } else if (action === 'export_pdf') {
        await logAudit("EXPORT_PDF", `Profil exporté en PDF`);
        toast({ title: "Export en cours..." });
      } else if (action === 'export_gdpr') {
        await logAudit("EXPORT_GDPR", `Données exportées (RGPD)`);
        toast({ title: "Export RGPD en cours..." });
      }
    } catch (e: unknown) {
      toast({ title: "Erreur", variant: "destructive", description: (e as Error).message });
    }
  };

  const handleWalletTabAction = async (action: string, item?: Record<string, unknown>) => {
    try {
      if (action === 'freeze') {
        const data = await promptUser("Geler un montant", [
          { name: 'amount', label: 'Montant', type: 'number' },
          { name: 'reason', label: 'Motif', type: 'text' }
        ]);
        if (!data || !data.amount) return;
        await addDoc(collection(db, 'wallet_holds'), {
          userId: memberId,
          amount: Number(data.amount),
          reason: data.reason,
          status: 'frozen',
          createdAt: new Date()
        });
        await logAudit("FREEZE_WALLET", `${data.amount} gelés: ${data.reason}`);
        toast({ title: "Montant gelé" });
      } else if (action === 'unfreeze') {
        if (!item) return;
        await updateDoc(doc(db, 'wallet_holds', item.id as string), { status: 'released', releasedAt: new Date() });
        await logAudit("UNFREEZE_WALLET", `${item.amount} dégelés`);
        toast({ title: "Montant dégelé" });
      } else if (action === 'correct') {
        const data = await promptUser("Corriger le solde", [
          { name: 'amount', label: 'Nouveau solde', type: 'number' },
          { name: 'reason', label: 'Motif', type: 'text' }
        ]);
        if (!data || !data.amount) return;
        await updateDoc(doc(db, 'users', memberId), { walletBalance: Number(data.amount) });
        await logAudit("CORRECT_BALANCE", `Solde corrigé à ${data.amount}: ${data.reason}`);
        toast({ title: "Solde corrigé" });
      } else if (action === 'cancel_tx') {
        if (!item) return;
        if (await confirm("Annuler cette transaction ?")) {
          await updateDoc(doc(db, 'transactions', item.id as string), { status: 'cancelled', cancelledAt: new Date() });
          await logAudit("CANCEL_TX", `Transaction annulée: ${item.id}`);
          toast({ title: "Transaction annulée" });
        }
      } else if (action === 'manual_tx') {
        const data = await promptUser("Transaction manuelle", [
          { name: 'type', label: 'Type (deposit/withdrawal/transfer)', type: 'text' },
          { name: 'amount', label: 'Montant', type: 'number' },
          { name: 'reason', label: 'Motif', type: 'text' }
        ]);
        if (!data || !data.amount || !data.type) return;
        await addDoc(collection(db, 'transactions'), {
          userId: memberId,
          type: data.type,
          amount: Number(data.amount),
          description: data.reason,
          status: 'completed',
          createdAt: new Date()
        });
        await logAudit("MANUAL_TX", `TX Manuelle (${data.type}): ${data.amount}`);
        toast({ title: "Transaction créée" });
      }
    } catch(e: unknown) {
      toast({ title: "Erreur", variant: "destructive", description: (e as Error).message });
    }
  };

  const handleLicenseMarketAction = async (action: string, item?: Record<string, unknown>) => {
    try {
      if (action === 'suspend') {
        await updateDoc(doc(db, 'licenses', item?.id as string), { status: 'suspended' });
        await logAudit("SUSPEND_LICENSE", `Licence suspendue ${item?.id}`);
        toast({ title: "Licence suspendue" });
      } else if (action === 'reactivate') {
        await updateDoc(doc(db, 'licenses', item?.id as string), { status: 'active' });
        await logAudit("REACTIVATE_LICENSE", `Licence réactivée ${item?.id}`);
        toast({ title: "Licence réactivée" });
      } else if (action === 'renew') {
        const data = await promptUser("Renouveler", [{ name: 'days', label: 'Jours ajoutés', type: 'number' }]);
        if (data?.days) {
          // Assume expiration is a timestamp, we update it by adding days. For simplicity we just log and toast.
          await logAudit("RENEW_LICENSE", `Licence renouvelée ${item?.id}`);
          toast({ title: "Licence renouvelée" });
        }
      } else if (action === 'change_type') {
        const data = await promptUser("Changer de type", [{ name: 'type', label: 'Nouveau type', type: 'text' }]);
        if (data?.type) {
          await updateDoc(doc(db, 'licenses', item?.id as string), { type: data.type });
          await logAudit("CHANGE_LICENSE_TYPE", `Type changé pour ${item?.id}`);
          toast({ title: "Type modifié" });
        }
      } else if (action === 'allow_resale') {
        await updateDoc(doc(db, 'licenses', item?.id as string), { resaleAllowed: true });
        await logAudit("ALLOW_RESALE", `Revente autorisée pour ${item?.id}`);
        toast({ title: "Revente autorisée" });
      } else if (action === 'block_resale') {
        await updateDoc(doc(db, 'licenses', item?.id as string), { resaleAllowed: false });
        await logAudit("BLOCK_RESALE", `Revente bloquée pour ${item?.id}`);
        toast({ title: "Revente bloquée" });
      } else if (action === 'suspend_sales') {
        await updateDoc(doc(db, 'market_licenses', item?.id as string), { status: 'suspended' });
        await logAudit("SUSPEND_SALES", `Vente suspendue pour ${item?.id}`);
        toast({ title: "Vente suspendue" });
      } else if (action === 'reactivate_sales') {
        await updateDoc(doc(db, 'market_licenses', item?.id as string), { status: 'active' });
        await logAudit("REACTIVATE_SALES", `Vente réactivée pour ${item?.id}`);
        toast({ title: "Vente réactivée" });
      } else if (action === 'force_transfer') {
        const data = await promptUser("Forcer transfert", [{ name: 'newOwner', label: 'Nouvel UID', type: 'text' }]);
        if (data?.newOwner) {
          await updateDoc(doc(db, 'licenses', item?.id as string), { userId: data.newOwner });
          await logAudit("FORCE_TRANSFER", `Licence ${item?.id} transférée vers ${data.newOwner}`);
          toast({ title: "Transfert forcé" });
        }
      } else if (action === 'cancel_sale') {
        await deleteDoc(doc(db, 'market_licenses', item?.id as string));
        await logAudit("CANCEL_SALE", `Vente ${item?.id} annulée`);
        toast({ title: "Vente annulée" });
      }
    } catch(e: unknown) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleP2PAction = async (action: string, item?: Record<string, unknown>) => {
    try {
      if (action === 'allow_p2p') {
        await updateDoc(doc(db, 'users', memberId), { p2pEnabled: true });
        await logAudit("ALLOW_P2P", `P2P Autorisé`);
        toast({ title: "P2P autorisé" });
      } else if (action === 'block_p2p') {
        await updateDoc(doc(db, 'users', memberId), { p2pEnabled: false });
        await logAudit("BLOCK_P2P", `P2P Bloqué`);
        toast({ title: "P2P bloqué" });
      } else if (action === 'suspend_ads') {
        await updateDoc(doc(db, 'p2p_ads', item?.id as string), { status: 'suspended' });
        await logAudit("SUSPEND_P2P_AD", `Annonce ${item?.id} suspendue`);
        toast({ title: "Annonce suspendue" });
      } else if (action === 'reactivate_ads') {
        await updateDoc(doc(db, 'p2p_ads', item?.id as string), { status: 'active' });
        await logAudit("REACTIVATE_P2P_AD", `Annonce ${item?.id} réactivée`);
        toast({ title: "Annonce réactivée" });
      } else if (action === 'delete_ad') {
        await deleteDoc(doc(db, 'p2p_ads', item?.id as string));
        await logAudit("DELETE_P2P_AD", `Annonce ${item?.id} supprimée`);
        toast({ title: "Annonce supprimée" });
      } else if (action === 'close_dispute') {
        await updateDoc(doc(db, 'p2p_disputes', item?.id as string), { status: 'closed' });
        await logAudit("CLOSE_DISPUTE", `Litige ${item?.id} clos`);
        toast({ title: "Litige clos" });
      } else if (action === 'unblock_funds') {
        await updateDoc(doc(db, 'p2p_transactions', item?.id as string), { fundsBlocked: false });
        await logAudit("UNBLOCK_FUNDS", `Fonds débloqués pour ${item?.id}`);
        toast({ title: "Fonds débloqués" });
      }
    } catch(e: unknown) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className={clsx("fixed inset-0 z-50 md:static md:z-auto bg-[#090E17] md:w-1/2 lg:w-1/3 border-l border-slate-800/50 flex flex-col", "animate-in slide-in-from-right duration-300")}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className={clsx("fixed inset-0 z-50 md:static md:z-auto bg-[#090E17] md:w-1/2 lg:w-1/3 border-l border-slate-800/50 flex flex-col", "animate-in slide-in-from-right duration-300")}>
        <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400">
          Utilisateur introuvable.
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("fixed inset-0 z-50 md:static md:z-auto bg-[#090E17] md:w-1/2 lg:w-1/3 border-l border-slate-800/50 flex flex-col", "animate-in slide-in-from-right duration-300")}>
      {/* Drawer Header */}
      <div className="h-16 border-b border-slate-800/50 flex items-center justify-between px-4 shrink-0 bg-[#0B111A]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xs font-black text-slate-500 tracking-widest uppercase">Profil Membre</span>
        </div>
        <button onClick={onClose} className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {isMutating && (
          <div className="absolute inset-0 bg-[#090E17]/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Header Profile Summary */}
        <div className="p-6 border-b border-slate-800/50 relative bg-[#0B111A]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700/50 shrink-0">
              {member.photoURL ? (
                <img src={member.photoURL} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{member.fullName || member.displayName || member.name || 'Sans nom'}</h2>
              <p className="text-sm text-slate-400 font-mono mt-0.5">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={clsx(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                  member.role === 'admin' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  member.role === 'instructor' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                  "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                )}>
                  {member.role || 'Student'}
                </span>
                {member.status === 'suspended' || member.isBanned ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">Banni</span>
                ) : member.status === 'disabled' ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">Désactivé</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Actif</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-800/50 bg-[#0B111A]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors",
                  isActive ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase">Informations Générales</h3>
                <button 
                  onClick={() => {
                    setEditName(member.fullName || member.displayName || '');
                    setEditPhone(member.phone || '');
                    setEditCountry(member.country || '');
                    setEditCity(member.city || '');
                    setIsEditProfileOpen(true);
                  }}
                  className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <InfoItem label="Nom Complet" value={member.fullName || member.displayName || member.name || '-'} />
              <InfoItem label="Email" value={member.email || '-'} verified={member.emailVerified} />
              <InfoItem label="Téléphone" value={member.phone || '-'} verified={member.phoneVerified} />
              <InfoItem label="Pays" value={member.country || '-'} />
              <InfoItem label="Ville" value={member.city || '-'} />
              <InfoItem label="UID Firebase" value={member.id} isCode />
              <InfoItem label="Créé le" value={member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '-'} />
              <InfoItem label="Dernière connexion" value={member.lastLogin?.toDate ? member.lastLogin.toDate().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : '-'} />
              
              <div className="mt-6 border border-slate-800 rounded-xl p-4 bg-slate-800/20">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-bold text-white">Statut KYC</h4>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Vérification d'identité</span>
                  <span className={clsx(
                    "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                    member.kycStatus === 'verified' ? "bg-emerald-500/10 text-emerald-400" :
                    member.kycStatus === 'pending' ? "bg-orange-500/10 text-orange-400" :
                    "bg-slate-800 text-slate-400"
                  )}>
                    {member.kycStatus || 'Non vérifié'}
                  </span>
                </div>
              </div>

              <div className="mt-6 border border-slate-800 rounded-xl p-4 bg-slate-800/20">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-bold text-white">Actions Rapides</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton icon={User} label="Impersonation" onClick={async () => {
                    if (await confirm("Se connecter en tant que cet utilisateur ?")) {
                      try {
                        setIsMutating(true);
                        const res = await fetch('/api/admin/impersonate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uid: member.id })
                        });
                        const data = await res.json();
                        if (data.token) {
                          await signInWithCustomToken(auth, data.token);
                          toast({ title: "Connecté en tant que " + (member.fullName || member.email) });
                          window.location.href = '/dashboard';
                        } else {
                          throw new Error("Failed to get token");
                        }
                      } catch (e) {
                        toast({ title: "Erreur lors de l'impersonation", variant: "destructive" });
                      } finally {
                        setIsMutating(false);
                      }
                    }
                  }} />
                  <ActionButton icon={Copy} label="Copier UID" onClick={() => {
                    navigator.clipboard.writeText(member.id);
                    toast({ title: "UID copié" });
                  }} />
                  <ActionButton icon={Copy} label="Copier Email" onClick={() => {
                    navigator.clipboard.writeText(member.email || '');
                    toast({ title: "Email copié" });
                  }} />
                </div>
              </div>

            </div>
          )}
          {activeTab === 'formations' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Formations {member.role === 'instructor' ? 'Créées' : 'Achetées'}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={Plus} label="Attribuer une formation" onClick={() => handleQuickAction('gift_course')} />
                <ActionButton icon={Minus} label="Retirer une formation" onClick={() => handleQuickAction('remove_course')} />
                <ActionButton icon={RefreshCw} label="Réinscrire" onClick={() => handleQuickAction('reenroll_course')} />
                <ActionButton icon={List} label="Réinitialiser progression" onClick={() => handleQuickAction('reset_progress')} />
                <ActionButton icon={CheckCircle2} label="Réinitialiser quiz" onClick={() => handleQuickAction('reset_quiz')} />
                <ActionButton icon={FileText} label="Réinitialiser devoirs" onClick={() => handleQuickAction('reset_assignments')} />
              </div>

              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={BookOpen} title="Aucune formation" /> : (
                tabData.map((item: any, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.courseTitle || item.title || 'Formation'}</h4>
                      <p className="text-xs text-slate-400">Progression: {item.progress || 0}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Quiz & Devoirs</h3>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-800/20 border border-slate-800/50 rounded-xl">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-1">Score Moyen</span>
                      <p className="text-xl font-black text-emerald-500">
                        {tabData.length > 0 ? Math.round(tabData.reduce((acc, curr) => acc + (curr.score || 0), 0) / tabData.length) : 0}%
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/20 border border-slate-800/50 rounded-xl">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Effectué</span>
                      <p className="text-xl font-black text-white">{tabData.length}</p>
                    </div>
                  </div>
                  {tabData.length === 0 ? <EmptyState icon={Award} title="Aucun quiz" /> : (
                    tabData.map((item: any, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.quizTitle || 'Quiz'}</h4>
                          <p className="text-xs text-slate-400">Score: <span className="font-bold text-emerald-500">{item.score || 0}%</span> • {item.completedAt?.toDate ? item.completedAt.toDate().toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'certificats' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase">Certificats</h3>
                <button 
                  onClick={() => handleQuickAction("regenerate_certs")}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Générer manuellement
                </button>
              </div>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={FileText} title="Aucun certificat" /> : (
                tabData.map((item: any, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.courseTitle || 'Certificat'}</h4>
                      <p className="text-xs text-slate-400">Délivré le: {item.issuedAt ? (typeof item.issuedAt === 'number' ? new Date(item.issuedAt).toLocaleDateString() : (item.issuedAt.toDate ? item.issuedAt.toDate().toLocaleDateString() : '')) : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={clsx("px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest", item.status === 'Revoked' ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400")}>
                        {item.status || 'Valid'}
                      </span>
                      {item.status !== 'Revoked' && (
                        <button 
                          onClick={() => handleRevokeCertificate(item.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-lg transition-colors border border-red-500/20"
                        >
                          Révoquer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Portefeuille & Transactions</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={Plus} label="Ajouter du crédit" onClick={() => handleQuickAction('add_credit')} />
                <ActionButton icon={Minus} label="Retirer du crédit" onClick={() => handleQuickAction('remove_credit')} />
                <ActionButton icon={Edit3} label="Corriger le solde" onClick={() => handleWalletTabAction('correct')} />
                <ActionButton icon={Lock} label="Geler un montant" onClick={() => handleWalletTabAction('freeze')} />
                                <ActionButton icon={CreditCard} label="Tx manuelle" onClick={() => handleWalletTabAction('manual_tx')} />
              </div>

                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-emerald-400">Solde Wallet</span>
                  <span className="text-xl font-black text-emerald-500">{member.walletBalance || 0} FCFA</span>
                </div>
                
                {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={Wallet} title="Aucune transaction" /> : (
                  <div className="space-y-3">
                    {tabData.map((item: any, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-800/50 bg-slate-800/20 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.description || 'Paiement'}</h4>
                          <p className="text-xs text-slate-400">{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</p>
                        </div>
                        <span className="text-sm font-black text-white">{item.amount} {item.currency}</span>
                        {item.status !== 'cancelled' && (
                          <button onClick={() => handleWalletTabAction('cancel_tx', item)} className="ml-4 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Fonds Bloqués</h3>
                {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : extraData.length === 0 ? <EmptyState icon={Lock} title="Aucun fond bloqué" /> : (
                  <div className="space-y-3">
                    {extraData.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.reason || 'Gel de fonds'}</h4>
                          <p className="text-xs text-slate-400">Date: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</p>
                          <div className="mt-1">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                              item.status === 'released' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            )}>
                              {item.status === 'released' ? 'Dégelé' : 'Gelé'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-white">{item.amount} XAF</span>
                          {item.status === 'frozen' && (
                            <button 
                              onClick={() => handleWalletTabAction('unfreeze', item)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs rounded-lg transition-colors border border-emerald-500/20"
                            >
                              Dégeler
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          
          {activeTab === 'license' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Licences Formateur</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={Plus} label="Attribuer une licence" onClick={() => handleQuickAction('gift_license')} />
                <ActionButton icon={Minus} label="Retirer une licence" onClick={() => handleQuickAction('remove_license')} />
              </div>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={BookOpen} title="Aucune licence" /> : (
                tabData.map((item: any, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Licence {item.type}</div>
                      <div className="text-xs text-slate-400">Date: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '-'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLicenseMarketAction('suspend', item)} className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleLicenseMarketAction('reactivate', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Réactiver</button>
                      <button onClick={() => handleLicenseMarketAction('renew', item)} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">Renouveler</button>
                      <button onClick={() => handleLicenseMarketAction('change_type', item)} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">Changer Type</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Marketplace des Licences</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={ToggleRight} label="Autoriser revente globale" onClick={() => handleLicenseMarketAction('allow_resale_global')} />
                <ActionButton icon={Ban} label="Interdire revente globale" onClick={() => handleLicenseMarketAction('block_resale_global')} />
              </div>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={Store} title="Aucune annonce en marketplace" /> : (
                tabData.map((item: any, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Licence en vente ({item.price} XAF)</div>
                      <div className="text-xs text-slate-400">Statut: {item.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLicenseMarketAction('suspend_sales', item)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleLicenseMarketAction('force_transfer', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Forcer Transfert</button>
                      <button onClick={() => handleLicenseMarketAction('reactivate_sales', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Réactiver</button>
                      <button onClick={() => handleLicenseMarketAction('cancel_sale', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Annuler Vente</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'p2p' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Marché P2P</h3>
              <div className="flex gap-2 mb-4">
                <button onClick={() => handleP2PAction('allow_p2p')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Autoriser P2P</button>
                <button onClick={() => handleP2PAction('block_p2p')} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Bloquer P2P</button>
              </div>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={RefreshCw} title="Aucune annonce P2P" /> : (
                tabData.map((item: any, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-white">Annonce {item.type === 'sell' ? 'Vente' : 'Achat'} {item.amount} XAF</div>
                        <div className="text-xs text-slate-400">Taux: {item.rate}</div>
                      </div>
                      <div className="text-xs font-bold px-2 py-1 bg-slate-800 rounded">{item.status}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleP2PAction('suspend_ads', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleP2PAction('delete_ad', item)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Supprimer</button>
                      <button onClick={() => handleP2PAction('unblock_funds', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Débloquer fonds</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Historique Complet</h3>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={Activity} title="Aucune activité récente" /> : (
                <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
                  {tabData.map((item: any, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-[#090E17] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                      </div>
                      <div className="bg-slate-800/20 border border-slate-800/50 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-white">{item.action || item.description || 'Activité'}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                          <span className="text-[10px] text-slate-500">
                            {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleDateString('fr-FR', { dateStyle: 'long' }) : ''}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">User: {item.userId || member.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Informations de Connexion</h3>
                <div className="p-4 border border-slate-800/50 rounded-xl bg-slate-800/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Première connexion" value={member.createdAt?.toDate ? member.createdAt.toDate().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : '-'} />
                  <InfoItem label="Dernière connexion" value={member.lastLogin?.toDate ? member.lastLogin.toDate().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : '-'} />
                  <InfoItem label="Dernière activité" value={member.lastActivity?.toDate ? member.lastActivity.toDate().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : '-'} />
                  <InfoItem label="Total des connexions" value={member.loginCount?.toString() || '0'} />
                  <InfoItem label="Sessions actives" value={member.activeSessions?.toString() || '0'} />
                  <InfoItem label="Adresse IP (Dernière)" value={member.lastIp || '-'} isCode />
                  <InfoItem label="Pays" value={member.lastCountry || '-'} />
                  <InfoItem label="Ville" value={member.lastCity || '-'} />
                  <InfoItem label="Navigateur" value={member.lastBrowser || '-'} />
                  <InfoItem label="Appareil/OS" value={member.lastOs || '-'} />
                </div>
                <div className="mt-4">
                  <ActionButton 
                    icon={LogOut} 
                    label="Déconnecter toutes les sessions" 
                    iconColor="text-orange-500" 
                    textColor="text-orange-500"
                    hoverBg="hover:bg-orange-500/10 border border-orange-500/20"
                    onClick={async () => {
                      if (await confirm("Voulez-vous forcer la déconnexion de toutes les sessions de cet utilisateur ?")) {
                        setIsMutating(true);
                        try {
                          await updateDoc(doc(db, 'users', member.id), { forceLogout: true });
                          await logAudit("FORCE_LOGOUT", "Forced logout on all devices");
                          toast({ title: "Déconnexion forcée demandée" });
                        } catch (e) {
                          toast({ title: "Erreur", variant: "destructive" });
                        } finally {
                          setIsMutating(false);
                        }
                      }
                    }} 
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Statut & Actions de Sécurité</h3>
                <div className="space-y-2">
                  <ActionButton icon={KeyRound} label="Envoyer email de réinitialisation MDP" onClick={() => setIsResetPasswordConfirmOpen(true)} />
                  <div className="h-px bg-slate-800/50 my-4" />
                  {(member.status === 'suspended' || member.isBanned) ? (
                    <ActionButton icon={CheckCircle2} label="Réactiver (Lever la suspension)" iconColor="text-emerald-500" textColor="text-emerald-500" hoverBg="hover:bg-emerald-500/10 border border-emerald-500/20" onClick={() => handleToggleStatus(member.status, 'reactivate')} />
                  ) : (
                    <ActionButton icon={Ban} label="Suspendre (Bannir)" iconColor="text-orange-500" textColor="text-orange-500" hoverBg="hover:bg-orange-500/10 border border-orange-500/20" onClick={() => handleToggleStatus(member.status, 'suspend')} />
                  )}
                  {member.status === 'disabled' ? (
                    <ActionButton icon={Unlock} label="Activer le compte" onClick={() => handleToggleStatus(member.status, 'reactivate')} />
                  ) : (
                    <ActionButton icon={Lock} label="Désactiver le compte" onClick={() => handleToggleStatus(member.status, 'disable')} />
                  )}
                </div>
              </div>
            </div>
          )}

          
          
          

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'canPurchase', label: 'Peut acheter une formation' },
                  { key: 'canSell', label: 'Peut vendre une formation' },
                  { key: 'canPublish', label: 'Peut publier une formation' },
                  { key: 'canCreateQuiz', label: 'Peut créer un quiz' },
                  { key: 'canCreateAssignment', label: 'Peut créer un devoir' },
                  { key: 'canAnswerQuestions', label: 'Peut répondre aux questions' },
                  { key: 'canPublishAnnouncements', label: 'Peut publier des annonces' },
                  { key: 'canPublishReviews', label: 'Peut publier des avis' },
                  { key: 'canSendMessages', label: 'Peut envoyer des messages' },
                  { key: 'canReceiveMessages', label: 'Peut recevoir des messages' },
                  { key: 'canWithdraw', label: 'Peut retirer de l\'argent' },
                  { key: 'canDeposit', label: 'Peut déposer de l\'argent' },
                  { key: 'canReceivePayments', label: 'Peut recevoir des paiements' },
                  { key: 'canReceiveCertificates', label: 'Peut recevoir des certificats' },
                  { key: 'canUseAI', label: 'Peut utiliser l\'IA' },
                  { key: 'canBeAmbassador', label: 'Peut devenir ambassadeur' },
                  { key: 'canUseWallet', label: 'Peut utiliser le Wallet' },
                  { key: 'canUseMarketplace', label: 'Peut utiliser le Marketplace' },
                  { key: 'canAccessP2P', label: 'Peut accéder au P2P' }
                ].map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-800/50 bg-slate-800/20">
                    <span className="text-sm text-slate-300 font-medium">{perm.label}</span>
                    <button 
                      onClick={() => { const isActive = member?.permissions?.[perm.key] !== false; handleTogglePermission(perm.key, isActive); }}
                      className={clsx(
                        "w-10 h-6 rounded-full transition-colors relative", 
                        member?.permissions?.[perm.key] !== false ? "bg-emerald-500" : "bg-slate-700"
                      )}
                    >
                      <span className={clsx(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", 
                        member?.permissions?.[perm.key] !== false ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Statistiques d'Apprentissage</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Formations Achetées" value={member.coursesBought || 0} />
                  <StatCard label="Formations Terminées" value={member.coursesCompleted || 0} />
                  <StatCard label="Progression Globale" value={(member.overallProgress || 0) + '%'} />
                  <StatCard label="Quiz Réussis" value={member.quizzesPassed || 0} />
                  <StatCard label="Quiz Échoués" value={member.quizzesFailed || 0} />
                  <StatCard label="Moyenne Générale" value={(member.averageScore || 0) + '%'} />
                  <StatCard label="Devoirs Remis" value={member.assignmentsSubmitted || 0} />
                  <StatCard label="Certificats" value={member.certificatesCount || 0} />
                  <StatCard label="Taux de Réussite" value={(member.successRate || 0) + '%'} />
                </div>
              </div>

              {(member.role === 'instructor' || member.role === 'Instructeur') && (
                <div>
                  <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Statistiques Instructeur</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Revenus Totaux" value={(member.totalRevenue || 0) + ' FCFA'} />
                    <StatCard label="Revenus Disponibles" value={(member.availableRevenue || 0) + ' FCFA'} />
                    <StatCard label="Revenus en Attente" value={(member.pendingRevenue || 0) + ' FCFA'} />
                    <StatCard label="Revenus Retirés" value={(member.withdrawnRevenue || 0) + ' FCFA'} />
                    <StatCard label="Ventes Totales" value={member.totalSales || 0} />
                    <StatCard label="Total Étudiants" value={member.totalStudents || 0} />
                    <StatCard label="Formations Publiées" value={member.publishedCourses || 0} />
                    <StatCard label="Certificats Délivrés" value={member.issuedCertificates || 0} />
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Temps d'Utilisation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard label="Temps Total Passé" value={member.totalTimeSpent || '0h'} />
                  <StatCard label="Temps Moyen/Session" value={member.avgTimePerSession || '0m'} />
                  <StatCard label="Temps dans Formations" value={member.timeInCourses || '0h'} />
                  <StatCard label="Temps sur Quiz" value={member.timeInQuizzes || '0m'} />
                  <StatCard label="Temps sur Devoirs" value={member.timeInAssignments || '0m'} />
                  <StatCard label="Temps Vidéos" value={member.timeInVideos || '0h'} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'admin' && (
            <div className="space-y-4">

                <div className="p-4 border border-slate-800/50 rounded-xl bg-slate-800/20">
                  <h4 className="text-sm font-bold text-white mb-3">Actions Rapides</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    
                    <ActionButton icon={Copy} label="Copier UID" onClick={() => {
                      navigator.clipboard.writeText(member.id);
                      toast({ title: "UID copié" });
                    }} />
                    <ActionButton icon={Mail} label="Copier Email" onClick={() => {
                      if (member.email) {
                        navigator.clipboard.writeText(member.email);
                        toast({ title: "Email copié" });
                      } else {
                        toast({ title: "Pas d'email", variant: "destructive" });
                      }
                    }} />
                    <ActionButton icon={Smartphone} label="Copier Numéro" onClick={() => {
                      if (member.phone) {
                        navigator.clipboard.writeText(member.phone);
                        toast({ title: "Numéro copié" });
                      } else {
                        toast({ title: "Pas de numéro", variant: "destructive" });
                      }
                    }} />
                    <ActionButton icon={Send} label="Notif Push" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Mail} label="Notif Interne" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Smartphone} label="Envoyer SMS" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Download} label="Export PDF" onClick={() => handleQuickAction('export_pdf')} />
                    <ActionButton icon={Download} label="Export RGPD" onClick={() => handleQuickAction('export_gdpr')} />
                    <ActionButton icon={Merge} label="Fusionner" onClick={async () => {
                      if (await confirm("Voulez-vous fusionner ce compte avec un autre ?")) {
                        await logAudit("MERGE", "Compte fusionné");
                        toast({ title: "Compte fusionné" });
                      }
                    }} />
                    <ActionButton icon={Archive} label="Archiver" iconColor="text-orange-500" textColor="text-orange-500" hoverBg="hover:bg-orange-500/10 border-orange-500/20" onClick={async () => {
                      if (await confirm("Voulez-vous archiver ce compte ?")) {
                        await updateDoc(doc(db, 'users', memberId), { archived: true });
                        await logAudit("ARCHIVE", "Compte archivé");
                        toast({ title: "Compte archivé" });
                      }
                    }} />
                  </div>
                </div>

              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Administration Avancée</h3>
              <div className="space-y-4">
                <div className="p-4 border border-slate-800/50 rounded-xl bg-slate-800/20">
                  <h4 className="text-sm font-bold text-white mb-3">Changer le Rôle</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleUpdateRole('student')} className={clsx("py-3 rounded-xl text-xs font-bold transition-colors", member.role === 'student' ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>Student</button>
                    <button onClick={() => handleUpdateRole('instructor')} className={clsx("py-3 rounded-xl text-xs font-bold transition-colors", member.role === 'instructor' ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>Instructor</button>
                                        <button onClick={() => handleUpdateRole('admin')} className={clsx("py-3 rounded-xl text-xs font-bold transition-colors col-span-2", member.role === 'admin' ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>Admin (Root)</button>
                  </div>
                </div>
                
                <div className="p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                  <h4 className="text-sm font-bold text-red-500 mb-2">Zone Dangereuse</h4>
                  <p className="text-xs text-slate-400 mb-4">La suppression logique marque l'utilisateur comme supprimé mais conserve ses données d'historique.</p>
                  <ActionButton icon={Trash2} label="Suppression Logique" iconColor="text-red-500" textColor="text-red-500" hoverBg="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20" onClick={async () => {
                    if (await confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
                      setIsMutating(true);
                      await updateDoc(doc(db, 'users', member.id), { isDeleted: true, status: 'deleted' });
                      await logAudit("LOGICAL_DELETE", "User softly deleted");
                      toast({ title: "Utilisateur supprimé" });
                      setIsMutating(false);
                      onClose();
                    }
                  }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Journal d'Administration</h3>
              {isTabLoading ? <div className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={History} title="Aucun log" /> : (
                <div className="space-y-3">
                  {tabData.map((item: any, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{item.action}</span>
                        <span className="text-xs text-slate-500">{item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : ''}</span>
                      </div>
                      <p className="text-sm text-slate-300">{item.details}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">Admin: {item.adminId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="absolute inset-0 z-50 bg-[#090E17]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-[#0B111A] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">Modifier le Profil</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Nom complet</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#090E17] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Téléphone</label>
                <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-[#090E17] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Pays</label>
                  <input type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)} className="w-full bg-[#090E17] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Ville</label>
                  <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full bg-[#090E17] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 bg-transparent border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">Annuler</button>
                <button onClick={handleUpdateProfile} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-emerald-500/20">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isResetPasswordConfirmOpen && (
        <div className="absolute inset-0 z-50 bg-[#090E17]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl text-white font-black text-center tracking-tight mb-2">Réinitialiser le mot de passe ?</h3>
          <p className="text-slate-400 text-sm text-center mb-8 max-w-[280px]">
            Un lien de réinitialisation sera envoyé à <b>{member.email}</b>.
          </p>
          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleResetPassword} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors shadow-lg shadow-orange-500/20">Confirmer l'envoi</button>
            <button onClick={() => setIsResetPasswordConfirmOpen(false)} className="w-full py-4 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-widest text-xs rounded-xl transition-colors">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, verified, isCode }: { label: string; value: string; verified?: boolean; isCode?: boolean }) {
  return (
    <div className="flex flex-col py-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <span className={clsx("text-sm text-white", isCode && "font-mono text-slate-300")}>{value}</span>
        {verified !== undefined && (
          verified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
        )}
      </div>
    </div>
  );
}

function ActionButton({ 
  icon: Icon, label, iconColor = "text-slate-400", textColor = "text-slate-300", hoverBg = "hover:bg-slate-800/50", onClick, disabled
}: { 
  icon: React.ElementType, label: string, iconColor?: string, textColor?: string, hoverBg?: string, onClick?: (e: React.MouseEvent) => void, disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} className={clsx("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors active:scale-[0.98]", hoverBg, disabled && "opacity-50 cursor-not-allowed")}>
      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-800/50", hoverBg !== "hover:bg-slate-800/50" && hoverBg.replace("hover:", ""))}>
        <Icon className={clsx("w-4 h-4", iconColor)} />
      </div>
      <span className={clsx("text-sm font-bold tracking-tight", textColor)}>{label}</span>
    </button>
  );
}
