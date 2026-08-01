import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Save, Percent, History, Users, RefreshCw } from 'lucide-react';

export function AdminCommissions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    referralCommission: 10,
    marketplaceCommission: 5,
    instructorLicenseCommission: 15
  });

  const [recentCommissions, setRecentCommissions] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadSettings();
    loadRecentCommissions();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'commission_settings', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch(e) {
      console.error(e);
      toast({ title: "Erreur", description: "Impossible de charger les paramètres.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentCommissions = async () => {
    setLoadingLogs(true);
    try {
      const q = query(collection(db, 'ambassador_commissions'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      setRecentCommissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'commission_settings', 'default');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: 'admin' // In a real app we'd use current user ID
      }, { merge: true });
      
      toast({ title: "Sauvegardé", description: "Les pourcentages de commission ont été mis à jour." });
    } catch(e) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Percent className="text-emerald-500 w-8 h-8" />
          Moteur de Commissions
        </h1>
        <p className="text-slate-400">Configurez les pourcentages de commission pour les ambassadeurs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SETTINGS FORM */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-8">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" /> Paramètres Globaux
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Commission Formations (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" max="100" step="0.1"
                  value={settings.referralCommission}
                  onChange={(e) => setSettings(prev => ({ ...prev, referralCommission: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500/50"
                  required
                />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Appliqué sur l'achat de formations par les filleuls.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Commission Licences Instructeur (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" max="100" step="0.1"
                  value={settings.instructorLicenseCommission}
                  onChange={(e) => setSettings(prev => ({ ...prev, instructorLicenseCommission: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500/50"
                  required
                />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Commission Marketplace (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" max="100" step="0.1"
                  value={settings.marketplaceCommission}
                  onChange={(e) => setSettings(prev => ({ ...prev, marketplaceCommission: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500/50"
                  required
                />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Enregistrer les Paramètres
            </button>
          </form>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" /> Dernières Commissions
            </h2>
            <button onClick={loadRecentCommissions} disabled={loadingLogs} className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-4">
            {recentCommissions.length === 0 ? (
              <div className="text-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                <p className="text-slate-500 text-sm">Aucune commission récente.</p>
              </div>
            ) : (
              recentCommissions.map(comm => (
                <div key={comm.id} className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        {comm.formationId === 'instructor_license' ? 'Licence' : 'Formation'}
                      </p>
                      <p className="text-sm font-bold text-white truncate max-w-[200px]">{comm.transactionId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-500">+{comm.montantCommission} XAF</p>
                      <p className="text-[10px] font-bold text-slate-500">{comm.pourcentage}% sur {comm.montantVente} XAF</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                     <p className="text-[10px] text-slate-500">Ambassadeur: {comm.ambassadorUid?.substring(0,6)}...</p>
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${comm.statut === 'validated' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                       {comm.statut}
                     </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
