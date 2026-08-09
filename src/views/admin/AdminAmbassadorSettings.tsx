import React, { useState } from 'react';
import { Save, Check, ToggleLeft, ToggleRight } from 'lucide-react';

export function AdminAmbassadorSettings() {
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
    minWithdrawal: 2500,
    autoValidation: false,
    autoPayment: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, save to Firestore
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

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
            <label className="text-sm font-bold text-slate-300">Commission Certifications (%)</label>
            <input 
              type="number" 
              value={settings.certificationCommission}
              onChange={(e) => handleChange('certificationCommission', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Commission Premium (%)</label>
            <input 
              type="number" 
              value={settings.premiumCommission}
              onChange={(e) => handleChange('premiumCommission', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Commission Marketplace (%)</label>
            <input 
              type="number" 
              value={settings.marketplaceCommission}
              onChange={(e) => handleChange('marketplaceCommission', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Commission P2P (%)</label>
            <input 
              type="number" 
              value={settings.p2pCommission}
              onChange={(e) => handleChange('p2pCommission', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-700/50">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Durée du cookie (jours)</label>
            <input 
              type="number" 
              value={settings.cookieDuration}
              onChange={(e) => handleChange('cookieDuration', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Paiement minimum (FCFA)</label>
            <input 
              type="number" 
              value={settings.minPayout}
              onChange={(e) => handleChange('minPayout', Number(e.target.value))}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Validation automatique</h3>
              <p className="text-sm text-slate-400">Valider les commissions automatiquement après l'achat</p>
            </div>
            <button 
              onClick={() => handleChange('autoValidation', !settings.autoValidation)}
              className={`text-4xl ${settings.autoValidation ? 'text-emerald-500' : 'text-slate-600'}`}
            >
              {settings.autoValidation ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Paiement automatique</h3>
              <p className="text-sm text-slate-400">Approuver les retraits automatiquement sous le seuil défini</p>
            </div>
            <button 
              onClick={() => handleChange('autoPayment', !settings.autoPayment)}
              className={`text-4xl ${settings.autoPayment ? 'text-emerald-500' : 'text-slate-600'}`}
            >
              {settings.autoPayment ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
