import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  ArrowLeft, User, Mail, MapPin, Calendar, Clock, 
  MousePointerClick, UserPlus, ShoppingCart, Wallet, 
  Trophy, Medal, ShieldAlert, MonitorSmartphone, Award, Phone, Globe, Link, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminAmbassadorProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stats from collections
  const [referrals, setReferrals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;

    const loadData = async () => {
      try {
        const uDoc = await getDoc(doc(db, 'users', uid));
        if (uDoc.exists()) {
          setUserDoc({ id: uDoc.id, ...uDoc.data() });
        }

        // Fetch referrals (affiliate_registrations)
        const refQ = query(collection(db, 'affiliate_registrations'), where('ambassadorId', '==', uid));
        const refSnap = await getDocs(refQ);
        const refs = refSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setReferrals(refs);

        // Fetch transactions (affiliate_transactions)
        const txQ = query(collection(db, 'affiliate_transactions'), where('ambassadorId', '==', uid));
        const txSnap = await getDocs(txQ);
        const txs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransactions(txs);

        // Fetch clicks (affiliate_clicks)
        const clicksQ = query(collection(db, 'affiliate_clicks'), where('ambassadorId', '==', uid));
        const clicksSnap = await getDocs(clicksQ);
        const clks = clicksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClicks(clks);
        
        // Fetch login history
        const lhQ = query(collection(db, 'login_history'), where('uid', '==', uid));
        const lhSnap = await getDocs(lhQ);
        const lhs = lhSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLoginHistory(lhs);
        
      } catch (err) {
        console.error("Failed to load related data", err);
      }
    };

    loadData();

    // Listen to ambassador doc for real-time changes
    const unsubAmb = onSnapshot(doc(db, 'ambassadors', uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubAmb();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile && !userDoc) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Utilisateur introuvable</h2>
        <p className="text-slate-400">Ce compte n'existe pas ou a été supprimé.</p>
        <button 
          onClick={() => navigate('/admin/ambassadors')}
          className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const identity = {
    name: userDoc?.displayName || profile?.name || 'Inconnu',
    email: userDoc?.email || profile?.email || 'Non renseigné',
    phone: userDoc?.phone || profile?.phone || 'Non renseigné',
    country: userDoc?.country || profile?.country || 'Non renseigné',
    city: userDoc?.city || profile?.city || 'Non renseigné',
    role: userDoc?.role || 'student',
    avatar: userDoc?.photoURL || null
  };

  const activity = {
    createdAt: userDoc?.createdAt || profile?.createdAt,
    lastLoginAt: userDoc?.lastLoginAt || profile?.lastLoginAt,
    lastIp: userDoc?.lastLoginIp || 'Non disponible',
    userAgent: userDoc?.lastLoginUserAgent || 'Non disponible',
    loginCount: loginHistory.length
  };

  const affiliation = {
    code: profile?.referralCode || 'Non généré',
    link: profile?.referralLink || 'Non généré',
    clicks: profile?.totalClicks || 0,
    registrations: profile?.totalRegistrations || 0,
    conversionRate: profile?.totalClicks > 0 ? Math.round((profile?.totalRegistrations / profile?.totalClicks) * 100) : 0
  };

  const sales = {
    count: profile?.totalSales || 0,
    revenue: profile?.totalRevenue || 0,
    commission: profile?.totalCommission || 0
  };

  const wallet = {
    available: profile?.availableBalance || 0,
    pending: profile?.pendingBalance || 0,
    withdrawn: profile?.withdrawnAmount || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/ambassadors')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Profil Utilisateur
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
              {identity.role.toUpperCase()}
            </span>
          </h2>
          <p className="text-slate-400">ID: {uid}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IDENTITÉ */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-700/50 pb-6">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {identity.avatar ? (
                <img src={identity.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{identity.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <Mail className="w-4 h-4" />
                {identity.email}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Contact & Localisation</h4>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              {identity.phone}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Globe className="w-4 h-4 text-slate-500" />
              {identity.country}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500" />
              {identity.city}
            </div>
          </div>
        </div>

        {/* ACTIVITÉ */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <Activity className="w-5 h-5 text-blue-400" />
            Activité
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Créé le</span>
              <span className="text-white font-medium">
                {activity.createdAt?.toDate ? format(activity.createdAt.toDate(), 'dd MMMM yyyy', { locale: fr }) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Dernière connexion</span>
              <span className="text-white font-medium">
                {activity.lastLoginAt?.toDate ? format(activity.lastLoginAt.toDate(), 'dd/MM/yyyy HH:mm') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Dernière IP</span>
              <span className="text-white font-medium">{activity.lastIp}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2"><MonitorSmartphone className="w-4 h-4" /> Appareil</span>
              <span className="text-white font-medium truncate max-w-[150px]" title={activity.userAgent}>
                {activity.userAgent}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-700/50 pt-4">
              <span className="text-slate-400">Total connexions</span>
              <span className="text-white font-bold">{activity.loginCount}</span>
            </div>
          </div>
        </div>

        {/* GAMIFICATION */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            Gamification
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Niveau Actuel</span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full font-bold capitalize">
                {profile?.level || 'Bronze'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Badge</span>
              <span className="text-white font-medium">{profile?.badge || 'Débutant'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Points d'expérience</span>
              <span className="text-white font-bold">{profile?.xp || 0} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AFFILIATION */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <Link className="w-5 h-5 text-purple-400" />
            Affiliation
          </h3>
          <div className="p-4 bg-slate-900 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">Code Ambassadeur</p>
              <p className="font-mono font-bold text-white text-lg">{affiliation.code}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-lg text-center">
              <MousePointerClick className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{affiliation.clicks}</p>
              <p className="text-xs text-slate-400">Clics</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg text-center">
              <UserPlus className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{affiliation.registrations}</p>
              <p className="text-xs text-slate-400">Inscriptions</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg text-center">
              <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{affiliation.conversionRate}%</p>
              <p className="text-xs text-slate-400">Conversion</p>
            </div>
          </div>
        </div>

        {/* VENTES & PORTEFEUILLE */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Portefeuille & Ventes
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-400 mb-1 font-bold">SOLDE DISPONIBLE</p>
              <p className="text-2xl font-bold text-emerald-400">{wallet.available.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400 mb-1 font-bold">SOLDE EN ATTENTE</p>
              <p className="text-2xl font-bold text-amber-400">{wallet.pending.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400">Ventes</p>
              <p className="text-lg font-bold text-white">{sales.count}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">CA Généré</p>
              <p className="text-lg font-bold text-white">{sales.revenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Commissions</p>
              <p className="text-lg font-bold text-white">{sales.commission.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LISTE DES FILLEULS */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-6">Dernières Inscriptions (Filleuls)</h3>
          <div className="space-y-3">
            {referrals.slice(0, 5).map(ref => (
              <div key={ref.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-white">Utilisateur {ref.referredUserId.slice(0, 6)}...</p>
                  <p className="text-xs text-slate-400">{ref.createdAt?.toDate ? format(ref.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '-'}</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Vérifié</span>
              </div>
            ))}
            {referrals.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Aucune inscription</p>
            )}
          </div>
        </div>

        {/* LISTE DES VENTES */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-6">Dernières Ventes</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">{tx.courseTitle}</p>
                  <p className="text-xs text-slate-400">{tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'dd/MM/yyyy') : '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">+{tx.commissionAmount?.toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-xs text-slate-400">sur {tx.amount?.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Aucune vente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
