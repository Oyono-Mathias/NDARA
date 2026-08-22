import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, startAfter, getCountFromServer, doc, getDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Users, CheckCircle2, XCircle, Search, Filter, Download, ArrowUpDown, Calendar, TrendingUp, DollarSign, Award, BookOpen, Clock, Mail, Phone, MapPin, Key, User } from 'lucide-react';
import clsx from 'clsx';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CSVLink } from "react-csv";

export function AmbassadorReferrals() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    inactive: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastSignup: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive, this_week, this_month, this_year
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [pageSize] = useState(15);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Selected for Details
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  
  // Realtime new user tracking
  const [latestUserTime, setLatestUserTime] = useState<number>(Date.now());
  const initialLoadRef = useRef(true);

  // Export Data
  const [exportData, setExportData] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchStats();
    loadReferrals(true);

    // Listen for new referrals
    const q = query(
      collection(db, 'affiliate_registrations'),
      where('ambassadorId', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.createdAt && data.createdAt.toMillis() > latestUserTime) {
            toast({ title: "Nouveau filleul !", description: "Un nouvel utilisateur vient de s'inscrire via votre lien." });
            setLatestUserTime(data.createdAt.toMillis());
            fetchStats(); // Update stats
            loadReferrals(true); // Reload page 1 to show the new user
          }
        }
      });
    });

    return () => unsub();
  }, [firebaseUser, filter, sortField, sortDirection]);

  const fetchStats = async () => {
    if (!firebaseUser) return;
    try {
      const refCol = collection(db, 'affiliate_registrations');
      
      const totalQ = query(refCol, where('ambassadorId', '==', firebaseUser.uid));
      const activeQ = query(refCol, where('ambassadorId', '==', firebaseUser.uid), where('status', '==', 'active'));
      const inactiveQ = query(refCol, where('ambassadorId', '==', firebaseUser.uid), where('status', '==', 'inactive'));
      
      const [totalSnap, activeSnap, inactiveSnap] = await Promise.all([
        getCountFromServer(totalQ),
        getCountFromServer(activeQ),
        getCountFromServer(inactiveQ)
      ]);

      // Time based stats - using client side processing for simplicity of stats if we fetch recent ones, 
      // but to be perfectly performant without fetching all, we need index on createdAt.
      const startOfW = startOfWeek(new Date());
      const startOfM = startOfMonth(new Date());
      
      const thisWeekQ = query(refCol, where('ambassadorId', '==', firebaseUser.uid), where('createdAt', '>=', Timestamp.fromDate(startOfW)));
      const thisMonthQ = query(refCol, where('ambassadorId', '==', firebaseUser.uid), where('createdAt', '>=', Timestamp.fromDate(startOfM)));
      
      const [weekSnap, monthSnap] = await Promise.all([
        getCountFromServer(thisWeekQ),
        getCountFromServer(thisMonthQ)
      ]);

      // Last signup
      const lastQ = query(refCol, where('ambassadorId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'), limit(1));
      const lastDocSnap = await getDocs(lastQ);
      let lastSignup = null;
      if (!lastDocSnap.empty) {
         lastSignup = lastDocSnap.docs[0].data().createdAt?.toDate();
      }

      setStats({
        total: totalSnap.data().count,
        active: activeSnap.data().count,
        inactive: inactiveSnap.data().count,
        thisWeek: weekSnap.data().count,
        thisMonth: monthSnap.data().count,
        lastSignup
      });

    } catch(e) {
      console.error("Error fetching stats", e);
    }
  };

  const loadReferrals = async (isFirstPage = false) => {
    if (!firebaseUser) return;
    if (isFirstPage) {
      setLoading(true);
      setLastVisible(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let qList: any[] = [
        where('ambassadorId', '==', firebaseUser.uid)
      ];

      if (filter === 'active') qList.push(where('status', '==', 'active'));
      if (filter === 'inactive') qList.push(where('status', '==', 'inactive'));
      if (filter === 'this_week') qList.push(where('createdAt', '>=', Timestamp.fromDate(startOfWeek(new Date()))));
      if (filter === 'this_month') qList.push(where('createdAt', '>=', Timestamp.fromDate(startOfMonth(new Date()))));
      if (filter === 'this_year') qList.push(where('createdAt', '>=', Timestamp.fromDate(startOfYear(new Date()))));

      let q = query(
        collection(db, 'affiliate_registrations'),
        ...qList,
        orderBy(sortField, sortDirection),
        limit(pageSize)
      );

      if (!isFirstPage && lastVisible) {
        q = query(collection(db, 'affiliate_registrations'), ...qList, orderBy(sortField, sortDirection), startAfter(lastVisible), limit(pageSize));
      }

      const snap = await getDocs(q);
      const newDocs: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (newDocs.length < pageSize) setHasMore(false);
      else setHasMore(true);

      if (newDocs.length > 0) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }

      // Fetch user details for these referrals
      const uids = newDocs.map(d => d.referralUid);
      const usersData: any = {};
      
      // Batch fetch users (max 30 per in query)
      for (let i = 0; i < uids.length; i += 30) {
         const chunk = uids.slice(i, i + 30);
         const uSnap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
         uSnap.docs.forEach(uDoc => {
             usersData[uDoc.id] = uDoc.data();
         });
      }

      // Fetch Enriched Stats via API
      let statsData: any = {};
      if (uids.length > 0) {
        try {
          const token = await auth.currentUser?.getIdToken();
          const res = await fetch('/api/ambassador/referrals-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ uids })
          });
          if (res.ok) {
            statsData = await res.json();
          }
        } catch(e) {
          console.error("Error fetching enriched stats", e);
        }
      }

      const combined = newDocs.map(d => ({
         ...d,
         user: usersData[d.referralUid] || {},
         stats: statsData[d.referralUid] || {}
      }));

      if (isFirstPage) {
        setReferrals(combined);
      } else {
        setReferrals(prev => [...prev, ...combined]);
      }

    } catch(e: any) {
      console.error("Error loading referrals", e);
      if (e.message.includes('index')) {
         toast({ title: "Index manquant", description: "Veuillez patienter pendant que les index Firestore sont générés.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all referrals for export
      const q = query(collection(db, 'affiliate_registrations'), where('ambassadorId', '==', firebaseUser?.uid));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data());
      
      const uids = docs.map(d => d.referralUid);
      const usersData: any = {};
      for (let i = 0; i < uids.length; i += 30) {
         const chunk = uids.slice(i, i + 30);
         const uSnap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
         uSnap.docs.forEach(uDoc => { usersData[uDoc.id] = uDoc.data(); });
      }

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ambassador/referrals-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ uids })
      });
      const statsData = await res.json();

      const csvData = docs.map(d => {
        const u = usersData[d.referralUid] || {};
        const s = statsData[d.referralUid] || {};
        return {
          'Date Inscription': d.createdAt?.toDate ? format(d.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '',
          'Code Utilisé': d.referralCode,
          'Nom Filleul': u.displayName || 'Inconnu',
          'Email': u.email || 'Inconnu',
          'Téléphone': u.phone || 'Non renseigné',
          'Pays': u.country || 'Non renseigné',
          'Statut KYC': u.kycStatus || 'Non vérifié',
          'Statut Filleul': d.status || 'Actif',
          'Achats': s.purchasesCount || 0,
          'Dépenses (XAF)': s.totalSpent || 0,
          'Formations Inscrites': s.enrollmentsCount || 0,
          'Formations Terminées': s.completedCourses || 0,
          'Progression Moyenne': `${s.avgProgress || 0}%`,
          'Devoirs Rendus': s.devoirsCount || 0,
          'Quiz Réussis': s.quizzesCount || 0,
          'Première Connexion': u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy') : '',
          'Dernière Connexion': u.lastLoginAt ? format(new Date(u.lastLoginAt), 'dd/MM/yyyy') : '',
        };
      });

      setExportData(csvData);
      
      // Trigger download using CSVLink reference trick
      setTimeout(() => {
        document.getElementById('csv-export-btn')?.click();
        toast({ title: "Export réussi", description: "Le fichier CSV a été généré." });
      }, 500);

    } catch(e) {
      console.error(e instanceof Error ? e.message : String(e));
      toast({ title: "Erreur d'export", description: "Impossible de générer le fichier.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (ref.user.displayName || '').toLowerCase().includes(term) ||
      (ref.user.email || '').toLowerCase().includes(term) ||
      (ref.user.phone || '').toLowerCase().includes(term) ||
      (ref.referralUid || '').toLowerCase().includes(term) ||
      (ref.referralCode || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Users className="text-emerald-500 w-8 h-8" />
            Mes Filleuls
          </h1>
          <p className="text-slate-400">Gérez et suivez l'activité de vos filleuls.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            EXPORTER
          </button>
          {/* @ts-ignore */}
<CSVLink 
            data={exportData} 
            filename={`ndara_filleuls_${format(new Date(), 'yyyyMMdd')}.csv`}
            id="csv-export-btn"
            className="hidden"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Filleuls" value={stats.total} icon={<Users className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Actifs" value={stats.active} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Inactifs" value={stats.inactive} icon={<XCircle className="w-5 h-5 text-rose-400" />} />
        <StatCard title="Cette Semaine" value={stats.thisWeek} icon={<Calendar className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Ce Mois" value={stats.thisMonth} icon={<Calendar className="w-5 h-5 text-purple-400" />} />
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dernier Inscrit</p>
          <p className="text-sm font-bold text-slate-300 mt-2">
            {stats.lastSignup ? format(stats.lastSignup, 'dd MMM yyyy', { locale: fr }) : '-'}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher nom, email, UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800 shrink-0">
            {['all', 'active', 'inactive', 'this_week', 'this_month', 'this_year'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap",
                  filter === f ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                )}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Filleul</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-300" onClick={() => { setSortField('createdAt'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-2">Inscription <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Formations</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Achats</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Dépenses</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Statut</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading && referrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    Aucun filleul trouvé.
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={ref.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(ref.user.displayName || 'U')}&background=0D9488&color=fff`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{ref.user.displayName || 'Inconnu'}</p>
                          <p className="text-xs text-slate-500">{ref.user.email || 'Email non fourni'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {ref.createdAt?.toDate ? format(ref.createdAt.toDate(), 'dd/MM/yyyy', { locale: fr }) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-white">{ref.stats.enrollmentsCount || 0}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">{ref.stats.avgProgress || 0}% complété</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-bold text-white">{ref.stats.purchasesCount || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-bold text-amber-400">{ref.stats.totalSpent?.toLocaleString() || 0} XAF</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        ref.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      )}>
                        {ref.status || 'actif'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedReferral(ref)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && hasMore && !searchTerm && (
          <div className="p-4 border-t border-slate-800 text-center bg-slate-900/30">
            <button 
              onClick={() => loadReferrals(false)}
              disabled={loadingMore}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : "Charger plus"}
            </button>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-sm" onClick={() => setSelectedReferral(null)}></div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
            
            {/* Header */}
            <div className="p-8 border-b border-slate-800 flex items-start justify-between bg-slate-900/50 sticky top-0 backdrop-blur-md z-20">
              <div className="flex items-center gap-6">
                <img 
                  src={selectedReferral.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReferral.user.displayName || 'U')}&background=0D9488&color=fff`}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover bg-slate-800 border-4 border-slate-800"
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-white">{selectedReferral.user.displayName || 'Inconnu'}</h2>
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      selectedReferral.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    )}>
                      {selectedReferral.status || 'actif'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-mono mb-2">UID: {selectedReferral.referralUid}</p>
                  <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full inline-flex items-center gap-2">
                    <Key className="w-3 h-3" /> Inscrit avec {selectedReferral.referralCode}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedReferral(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              
              {/* Profil & Activité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" /> Informations Personnelles
                  </h3>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email</p>
                        <p className="text-sm text-white font-medium">{selectedReferral.user.email || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Téléphone</p>
                        <p className="text-sm text-white font-medium">{selectedReferral.user.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pays</p>
                        <p className="text-sm text-white font-medium">{selectedReferral.user.country || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" /> Activité
                  </h3>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Date d'inscription</p>
                      <p className="text-sm text-white font-medium">
                        {selectedReferral.createdAt?.toDate ? format(selectedReferral.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dernière connexion</p>
                      <p className="text-sm text-white font-medium">
                        {selectedReferral.user.lastLoginAt ? format(new Date(selectedReferral.user.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Jamais'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Statut KYC</p>
                      <span className={clsx(
                        "inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        selectedReferral.user.kycStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      )}>
                        {selectedReferral.user.kycStatus === 'verified' ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression Académique */}
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Parcours Académique
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 text-center">
                    <p className="text-2xl font-black text-white">{selectedReferral.stats.enrollmentsCount || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Formations suivies</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">{selectedReferral.stats.completedCourses || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Terminées</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 text-center">
                    <p className="text-2xl font-black text-blue-400">{selectedReferral.stats.quizzesCount || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Quiz réussis</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 text-center">
                    <p className="text-2xl font-black text-amber-400">{selectedReferral.stats.avgProgress || 0}%</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Progression moy.</p>
                  </div>
                </div>
              </div>

              {/* Informations Commerciales */}
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Informations Commerciales
                </h3>
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-8 items-center justify-around">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Achats</p>
                    <p className="text-3xl font-black text-white">{selectedReferral.stats.purchasesCount || 0}</p>
                  </div>
                  <div className="h-12 w-px bg-slate-800 hidden md:block"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Montant Dépensé</p>
                    <p className="text-3xl font-black text-amber-400">{selectedReferral.stats.totalSpent?.toLocaleString() || 0} <span className="text-sm">XAF</span></p>
                  </div>
                  <div className="h-12 w-px bg-slate-800 hidden md:block"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Dernier Achat</p>
                    <p className="text-sm font-bold text-slate-300">
                      {selectedReferral.stats.lastPurchase ? format(new Date(selectedReferral.stats.lastPurchase), 'dd/MM/yyyy') : 'Aucun'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
