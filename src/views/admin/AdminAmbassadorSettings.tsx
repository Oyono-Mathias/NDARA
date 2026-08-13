
import React, { useState, useEffect } from 'react';
import { Save, Check, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';

export function AdminAmbassadorSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    active: true,
    courseCommission: 20,
    ebookCommission: 15,
    certificationCommission: 10,
    premiumCommission: 25,
    marketplaceCommission: 8,
    p2pCommission: 5,
    cookieDuration: 90,
    minPayout: 5000,
    minWithdrawal: 5000,
    autoValidation: false,
    autoPayment: false,
    validationDays: 7
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
     getDoc(doc(db, 'config', 'affiliate_rewards_config')).then(snap => {
        if (snap.exists()) {
           setSettings({ ...settings, ...snap.data() });
        }
        setLoading(false);
     });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, 'config', 'affiliate_rewards_config'), settings, { merge: true });
      setSaved(true);
      toast({ title: 'Succès', description: 'Configuration enregistrée.' });
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };
  
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-pink-500"/></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Paramètres du programme</h1>
        <p className="text-slate-400 mt-2">Configurez les taux de commission et les règles générales.</p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-lg font-bold text-white">Activer le programme</h3>
            <p className="text-sm text-slate-400">Permettre l'inscription de nouveaux ambassadeurs</p>
          </div>
          <button 
            onClick={() => handleChange('active', !settings.active)}
            className={`text-4xl ${settings.active ? 'text-emerald-500' : 'text-slate-600'}`}
          >
            {settings.active ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-700/50">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Commission Formations (%)</label>
            <input 
              type="number" 
              value={settings.courseCommission}
              onChange={(e) => handleChange('courseCommission', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Commission Ebooks (%)</label>
            <input 
              type="number" 
              value={settings.ebookCommission}
              onChange={(e) => handleChange('ebookCommission', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Délai de validation (jours)</label>
            <input 
              type="number" 
              value={settings.validationDays}
              onChange={(e) => handleChange('validationDays', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Retrait minimum (FCFA)</label>
            <input 
              type="number" 
              value={settings.minWithdrawal}
              onChange={(e) => handleChange('minWithdrawal', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
