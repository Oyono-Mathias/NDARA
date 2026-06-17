import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Bot, 
  Save, 
  AlertTriangle, 
  Settings, 
  Terminal, 
  Activity, 
  Power
} from 'lucide-react';
import { NdaraSkeleton } from './AdminSupport';

export function AdminAiConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [aiConfig, setAiConfig] = useState<any>({
    systemPrompt: "Tu es Mathias, un tuteur virtuel basé sur l'IA, expert en développement web et mobile. Tu accompagnes les étudiants de la plateforme NDARA de manière pédagogique et précise.",
    temperature: 0.7,
    maxTokens: 2048,
    modelName: "gemini-1.5-pro",
    isMaintenanceActive: false
  });

  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    
    // Initialiser l'écoute en temps réel sur le document ai_config
    const configRef = doc(db, 'settings', 'ai_config');
    unsubscribe = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAiConfig({
          systemPrompt: data.systemPrompt || aiConfig.systemPrompt,
          temperature: data.temperature !== undefined ? data.temperature : aiConfig.temperature,
          maxTokens: data.maxTokens || aiConfig.maxTokens,
          modelName: data.modelName || aiConfig.modelName,
          isMaintenanceActive: !!data.isMaintenanceActive
        });
      } else {
        // Le document n'existe pas, on initialise avec les valeurs par défaut saines
        setDoc(configRef, {
          systemPrompt: aiConfig.systemPrompt,
          temperature: aiConfig.temperature,
          maxTokens: aiConfig.maxTokens,
          modelName: aiConfig.modelName,
          isMaintenanceActive: aiConfig.isMaintenanceActive,
          createdAt: new Date(),
          updatedAt: new Date()
        }).catch(err => console.error("Erreur auto-init ai_config:", err));
      }
      // Petit délai pour l'effet de chargement de l'UI
      setTimeout(() => setLoading(false), 500);
    }, (err) => {
      console.error("Erreur sync ai_config:", err);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      // Mutation Atomique avec merge: true
      const configRef = doc(db, 'settings', 'ai_config');
      await setDoc(configRef, {
        systemPrompt: aiConfig.systemPrompt,
        temperature: aiConfig.temperature,
        maxTokens: aiConfig.maxTokens,
        modelName: aiConfig.modelName,
        isMaintenanceActive: aiConfig.isMaintenanceActive,
        updatedAt: new Date()
      }, { merge: true });
      
      setStatusMsg({ type: 'success', text: 'Configuration de l\'IA mise à jour avec succès.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch(err: any) {
      console.error("Erreur sauvegarde IA:", err);
      setStatusMsg({ type: 'error', text: `Erreur de sauvegarde: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenance = async () => {
    // Kill Switch - Active ou désactive l'IA globalement
    const newState = !aiConfig.isMaintenanceActive;
    setAiConfig({ ...aiConfig, isMaintenanceActive: newState });
    
    // On sauvegarde immédiatement pour le Kill Switch
    try {
      const configRef = doc(db, 'settings', 'ai_config');
      await setDoc(configRef, {
        isMaintenanceActive: newState,
        updatedAt: new Date()
      }, { merge: true });
    } catch(err) {
      console.error("Erreur lors de l'activation/désactivation de l'IA:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
        <div className="flex justify-between items-end">
           <div className="space-y-2 relative z-10">
             <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
             <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
           </div>
           <div className="h-12 w-32 bg-slate-800/50 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-2 space-y-6">
             <NdaraSkeleton type="card" />
             <NdaraSkeleton type="card" />
          </div>
          <div className="space-y-6">
             <NdaraSkeleton type="card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
        <div>
           <div className="flex items-center gap-2 text-emerald-500 mb-1">
             <Bot className="h-4 w-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">IA & Modèles</span>
           </div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tight">Configuration Mathias</h1>
           <p className="text-slate-400 text-sm font-medium mt-1">Gérez le comportement, le ton et les paramètres LLM en temps réel.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={toggleMaintenance}
            className={`flex flex-1 md:flex-none items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl
              ${aiConfig.isMaintenanceActive 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'}`}
          >
            <Power className="w-4 h-4" />
            {aiConfig.isMaintenanceActive ? 'IA Suspendue' : 'Kill Switch IA'}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50"
          >
             {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Sauvegarder
          </button>
        </div>
      </header>

      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border relative z-10 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {statusMsg.type === 'success' ? <Settings className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-bold">{statusMsg.text}</span>
        </div>
      )}

      {aiConfig.isMaintenanceActive && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative z-10 animate-pulse">
           <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
           <h3 className="text-lg font-black text-rose-500 uppercase tracking-widest">IA Hors Ligne</h3>
           <p className="text-sm text-rose-400/80 mt-1">Le mode maintenance est activé. Les étudiants ne recevront plus de réponses générées par le LLM.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
         
         <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Terminal className="w-5 h-5 text-emerald-500" /> System Prompt</h2>
              <p className="text-xs text-slate-400 mb-4 tracking-widest uppercase">Persona global et contexte injecté au LLM</p>
              
              <textarea 
                value={aiConfig.systemPrompt}
                onChange={e => setAiConfig({...aiConfig, systemPrompt: e.target.value})}
                className="w-full bg-[#0B1120]/80 border border-slate-700 rounded-2xl p-5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 min-h-[250px] font-mono leading-relaxed"
                placeholder="Ex: Tu es Mathias, un tuteur virtuel pour l'école..."
              />
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
               <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-emerald-500" /> Paramètres Modèle</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sélection du Modèle (modelName)</label>
                     <select 
                       value={aiConfig.modelName}
                       onChange={e => setAiConfig({...aiConfig, modelName: e.target.value})}
                       className="w-full bg-[#0B1120]/80 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50"
                     >
                       <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                       <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                       <option value="vertex-ai-v1">Vertex AI - Custom</option>
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jetons Max (maxTokens)</label>
                     <input 
                       type="number"
                       value={aiConfig.maxTokens}
                       onChange={e => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                       className="w-full bg-[#0B1120]/80 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                     />
                  </div>
                  <div className="space-y-3 md:col-span-2 pt-2 border-t border-slate-800">
                     <label className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                       <span>Créativité (Temperature)</span>
                       <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded font-mono">{aiConfig.temperature.toFixed(2)}</span>
                     </label>
                     <input 
                       type="range"
                       min="0" max="2" step="0.05"
                       value={aiConfig.temperature}
                       onChange={e => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                       className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                     />
                     <div className="flex justify-between text-[9px] text-slate-500 font-black uppercase tracking-widest mt-3">
                       <span>0.0 (Précis/Strict)</span>
                       <span>2.0 (Très Créatif)</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> État du Système</h2>
              
              <div className="space-y-5">
                 <div className="flex flex-col gap-1">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connectivité LLM</div>
                   <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     Service en ligne
                   </div>
                 </div>

                 <div className="w-full h-px bg-slate-800" />

                 <div className="flex flex-col gap-1">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kill Switch Global</div>
                   <div className={`flex items-center gap-2 text-sm font-bold ${aiConfig.isMaintenanceActive ? 'text-rose-500' : 'text-slate-300'}`}>
                     {aiConfig.isMaintenanceActive ? 'Désactivé (Maintenance)' : 'Actif (Autorisé)'}
                   </div>
                   <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                     L'activation du Kill Switch coupe instantanément l'accès de l'IA à la plateforme sans nécessiter de rafraîchissement côté client, grâce à Firebase onSnapshot.
                   </p>
                 </div>
              </div>
            </div>
         </div>

      </div>
    </div>
  );
}

