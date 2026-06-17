import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Bot, Save, AlertTriangle, Settings, Sparkles, Terminal, Activity, Video, CheckCircle2, XCircle } from 'lucide-react';

export function AdminAiConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatingVideo, setValidatingVideo] = useState(false);
  const [aiConfig, setAiConfig] = useState<any>({
    systemInstruction: "You are an AI assistant. Be helpful and pedagogical.",
    temperature: 0.7,
    maxTokens: 2048,
    model: "gemini-pro",
    autonomousTutor: true,
    fraudDetection: true
  });
  
  const [globalConfig, setGlobalConfig] = useState<any>({
    active_video_provider: 'bunny',
    cloudflare_account_id: '',
    cloudflare_api_token: '',
    bunny_stream_api_key: '',
    bunny_stream_library_id: ''
  });

  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [videoStatus, setVideoStatus] = useState<{provider: string, valid: boolean} | null>(null);
  const [healthStats, setHealthStats] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const fetchHealthStats = async () => {
    setLoadingHealth(true);
    try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/admin/video/health', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setHealthStats(data);
        }
    } catch(err) {
        console.error("Failed to fetch health stats", err);
    }
    setLoadingHealth(false);
  };

  useEffect(() => {
    let unsubs: any[] = [];
    
    // AI Config
    unsubs.push(onSnapshot(doc(db, 'settings', 'ai_config'), (snap) => {
      if (snap.exists()) {
        setAiConfig(snap.data());
      }
    }));

    // Global Config
    unsubs.push(onSnapshot(doc(db, 'settings', 'global_config'), (snap) => {
      if (snap.exists()) {
        setGlobalConfig({
            ...globalConfig,
            ...snap.data()
        });
      }
      setLoading(false);
    }));

    fetchHealthStats();

    return () => unsubs.forEach(u => u());
  }, []);

  const handleValidateProvider = async (provider: 'bunny' | 'cloudflare') => {
      setValidatingVideo(true);
      setStatusMsg(null);
      try {
          const token = await auth.currentUser?.getIdToken();
          const pData = provider === 'cloudflare' 
            ? { provider, accountId: globalConfig.cloudflare_account_id, apiKey: globalConfig.cloudflare_api_token }
            : { provider, libraryId: globalConfig.bunny_stream_library_id, apiKey: globalConfig.bunny_stream_api_key };
            
          const res = await fetch('/api/admin/video/validate', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(pData)
          });
          const data = await res.json();
          if (data.success) {
              setVideoStatus({ provider, valid: true });
              setStatusMsg({ type: 'success', text: `Clés ${provider} valides !` });
              // Also update the active provider globally since it's valid
              setGlobalConfig({...globalConfig, active_video_provider: provider});
          } else {
              setVideoStatus({ provider, valid: false });
              setStatusMsg({ type: 'error', text: data.error || `Clés ${provider} invalides.` });
          }
      } catch (err) {
          setStatusMsg({ type: 'error', text: 'Erreur réseau lors de la validation.' });
      }
      setValidatingVideo(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateDoc(doc(db, 'settings', 'ai_config'), aiConfig);
      
      // Update global config with video settings
      await updateDoc(doc(db, 'settings', 'global_config'), {
        'ai.autonomousTutor': aiConfig.autonomousTutor,
        'ai.fraudDetection': aiConfig.fraudDetection,
        active_video_provider: globalConfig.active_video_provider,
        cloudflare_account_id: globalConfig.cloudflare_account_id,
        cloudflare_api_token: globalConfig.cloudflare_api_token,
        bunny_stream_api_key: globalConfig.bunny_stream_api_key,
        bunny_stream_library_id: globalConfig.bunny_stream_library_id
      });
      
      setStatusMsg({ type: 'success', text: 'Configuration mise à jour globale.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch(err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Erreur de sauvegarde.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <div className="flex items-center gap-2 text-emerald-500 mb-1">
             <Bot className="h-4 w-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">IA & Tuteur</span>
           </div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tight">Configuration Mathias</h1>
           <p className="text-slate-400 text-sm font-medium mt-1">Gérez le comportement, le ton et les limitations du LLM.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
        >
           {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Sauvegarder
        </button>
      </header>

      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {statusMsg.type === 'success' ? <Settings className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-bold">{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Terminal className="w-5 h-5 text-emerald-400" /> System Instructions</h2>
              <p className="text-xs text-slate-400 mb-4 tracking-wider">Définit le persona principal de Mathias. Ces instructions sont injectées au tout début du prompt de contexte.</p>
              
              <textarea 
                value={aiConfig.systemInstruction}
                onChange={e => setAiConfig({...aiConfig, systemInstruction: e.target.value})}
                className="w-full bg-[#090E17] border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 min-h-[200px] font-mono leading-relaxed"
                placeholder="Ex: Tu es Mathias, un tuteur virtuel pour l'école..."
              />
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
               <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-emerald-400" /> Paramètres du Modèle</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modèle / Version</label>
                     <select 
                       value={aiConfig.model}
                       onChange={e => setAiConfig({...aiConfig, model: e.target.value})}
                       className="w-full bg-[#090E17] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                     >
                       <option value="gemini-pro">Gemini 1.5 Pro</option>
                       <option value="gemini-flash">Gemini 1.5 Flash</option>
                       <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Tokens</label>
                     <input 
                       type="number"
                       value={aiConfig.maxTokens}
                       onChange={e => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                       className="w-full bg-[#090E17] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                     />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                       <span>Créativité (Temperature: {aiConfig.temperature})</span>
                     </label>
                     <input 
                       type="range"
                       min="0" max="2" step="0.1"
                       value={aiConfig.temperature}
                       onChange={e => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                       className="w-full accent-emerald-500"
                     />
                     <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                       <span>Strict/Analytique (0)</span>
                       <span>Créatif (2)</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /> Capacités Autonomes</h2>
              
              <div className="space-y-4">
                 <label className="flex items-start gap-3 cursor-pointer group">
                   <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${aiConfig.autonomousTutor ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${aiConfig.autonomousTutor ? 'translate-x-5' : 'translate-x-1'}`} />
                   </div>
                   <input type="checkbox" className="hidden" checked={aiConfig.autonomousTutor} onChange={e => setAiConfig({...aiConfig, autonomousTutor: e.target.checked})} />
                   <div>
                     <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Intervention dans les Squads</div>
                     <div className="text-xs text-slate-500 mt-1">L'IA répond automatiquement lorsqu'elle est taguée (@Mathias)</div>
                   </div>
                 </label>

                 <label className="flex items-start gap-3 cursor-pointer group">
                   <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${aiConfig.fraudDetection ? 'bg-rose-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${aiConfig.fraudDetection ? 'translate-x-5' : 'translate-x-1'}`} />
                   </div>
                   <input type="checkbox" className="hidden" checked={aiConfig.fraudDetection} onChange={e => setAiConfig({...aiConfig, fraudDetection: e.target.checked})} />
                   <div>
                     <div className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Détection de Fraude NLP</div>
                     <div className="text-xs text-slate-500 mt-1">Analyse contextuelle des transactions suspicieuses et signalement admin.</div>
                   </div>
                 </label>
              </div>
            </div>
         </div>

      </div>
    </div>
  );
}
