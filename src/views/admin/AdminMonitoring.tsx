import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    Zap, 
    Cpu, 
    Server, 
    ShieldAlert, 
    Terminal, 
    Bot, 
    ShieldCheck, 
    CheckSquare,
    RefreshCw,
    Database
} from 'lucide-react';
import clsx from 'clsx';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export function AdminMonitoring() {
    const [hasMounted, setHasMounted] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [settings, setSettings] = useState({
        ai: { autoCorrection: true, autonomousTutor: true, fraudDetection: true }
    });
    const [tvlData, setTvlData] = useState<any>(null);

    useEffect(() => {
        // Fetch System Logs
        const qLogs = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(50));
        const unsubLogs = onSnapshot(qLogs, (snap) => {
            const fetchedLogs: any[] = [];
            snap.forEach(doc => {
                const data = doc.data();
                fetchedLogs.push({
                    id: doc.id,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
                    eventType: data.eventType || 'SYS_EVENT',
                    details: data.details || ''
                });
            });
            setLogs(fetchedLogs);
            setLoadingLogs(false);
        });

        // Fetch AI Settings from global config
        const unsubSettings = onSnapshot(doc(db, 'settings', 'global_config'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ai) {
                    setSettings(prev => ({
                        ...prev,
                        ai: { ...prev.ai, ...data.ai }
                    }));
                }
            } else {
                // Initialize if it doesn't exist
                setDoc(doc(db, 'settings', 'global_config'), { ai: settings.ai }, { merge: true });
            }
        });
        
        // Fetch TVL Data
        const fetchTvl = async () => {
            try {
                // Wait for auth to be ready
                const token = await auth.currentUser?.getIdToken();
                if (!token) return;
                
                const response = await fetch('/api/wallet/tvl', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setTvlData(data);
                }
            } catch (err) {
                console.error("Failed to fetch TVL:", err);
            }
        };
        fetchTvl();

        return () => {
            unsubLogs();
            unsubSettings();
        };
    }, []);

    const toggleAiFeature = async (key: string, value: boolean) => {
        // Optimistic UI update
        setSettings(prev => ({ ...prev, ai: { ...prev.ai, [key]: value } }));
        try {
            await updateDoc(doc(db, 'settings', 'global_config'), {
                [`ai.${key}`]: value
            });
        } catch (error) {
            console.error("Error updating AI settings:", error);
            // Revert on error
            setSettings(prev => ({ ...prev, ai: { ...prev.ai, [key]: !value } }));
        }
    };

    if (!hasMounted) return null;

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-1000 relative bg-[#050505] -m-4 md:-m-10 p-4 md:p-10 min-h-screen overflow-hidden">
            {/* Visual Effects: Matrix/Cyber Style */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-[scan_4s_linear_infinite]" />
            </div>

            <header className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-emerald-500/20 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">
                        SYSTEM<span className="text-emerald-500">.OS</span>
                    </h1>
                </div>
                <div className="border border-emerald-500/30 text-emerald-500 font-mono text-[10px] px-3 py-1 rounded uppercase tracking-widest font-bold">
                    V.2.5.0 • SECURED
                </div>
            </header>

            {/* --- TVL & TRESORERIE --- */}
            {tvlData && (
                <section className="relative z-10 mb-8 w-full bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Database className="w-32 h-32 text-emerald-500" />
                   </div>
                   <div className="relative">
                       <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Total Value Locked (Trésorerie Globale)</h2>
                       <div className="text-4xl md:text-5xl font-black text-white mb-6 font-mono tracking-tighter">
                           {tvlData.tvl.toLocaleString()} <span className="text-emerald-500 text-2xl">FCFA</span>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-6">
                           <div>
                               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Disponible</p>
                               <p className="text-lg font-bold text-white font-mono">{tvlData.breakdown.available.toLocaleString()} F</p>
                           </div>
                           <div>
                               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Affiliation</p>
                               <p className="text-lg font-bold text-emerald-400 font-mono">{tvlData.breakdown.affiliate.toLocaleString()} F</p>
                           </div>
                           <div>
                               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Séquestre (Ventes)</p>
                               <p className="text-lg font-bold text-yellow-400 font-mono">{tvlData.breakdown.escrow.toLocaleString()} F</p>
                           </div>
                           <div>
                               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Séquestre (Parrainage)</p>
                               <p className="text-lg font-bold text-orange-400 font-mono">{tvlData.breakdown.escrowAffiliate.toLocaleString()} F</p>
                           </div>
                       </div>
                   </div>
                </section>
            )}

            {/* --- LIVE STATS GRID (Android-First Progress Bars) --- */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Zap className="h-5 w-5 text-emerald-400 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Latence IA</span>
                    <div className="relative w-16 h-16 mb-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-emerald-500" strokeDasharray="24, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">24<span className="text-[8px] ml-0.5 text-slate-500">ms</span></div>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Server className="h-5 w-5 text-blue-400 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Uptime</span>
                    <div className="relative w-16 h-16 mb-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-blue-500" strokeDasharray="99.9, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xs">99.9<span className="text-[8px] text-slate-500">%</span></div>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-purple-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Database className="h-5 w-5 text-purple-400 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Charge DB</span>
                    <div className="relative w-full h-3 bg-slate-800 rounded-full mt-2 mb-3">
                        <div className="absolute top-0 left-0 h-full bg-purple-500 rounded-full" style={{ width: '14%' }}></div>
                    </div>
                    <span className="text-white font-black text-sm">14<span className="text-[9px] ml-0.5 text-slate-500">% optimal</span></span>
                </div>

                <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Activity className="h-5 w-5 text-emerald-400 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Quotas API IA</span>
                    <div className="relative w-full h-3 bg-slate-800 rounded-full mt-2 mb-3">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                    <span className="text-white font-black text-sm">4.2k<span className="text-[9px] ml-0.5 text-slate-500"> / 10k req</span></span>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
                
                {/* --- MATHIAS COMMAND POST --- */}
                <div className="xl:col-span-1 space-y-4">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2 px-1 mb-4">
                        <Cpu className="h-4 w-4 text-emerald-500" />
                        Moteur IA Mathias
                    </h2>

                    <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-4 space-y-3 shadow-2xl">
                        <AiToggleItem 
                            icon={CheckSquare} 
                            label="Correction Auto" 
                            desc="Devoirs & Quiz" 
                            color="text-purple-400" 
                            checked={settings.ai?.autoCorrection !== false} // Default to true if undefined
                            onChange={(v: boolean) => toggleAiFeature('autoCorrection', v)}
                        />
                        <AiToggleItem 
                            icon={Bot} 
                            label="Tuteur Autonome" 
                            desc="Réponses 24/7" 
                            color="text-blue-400" 
                            checked={settings.ai?.autonomousTutor !== false}
                            onChange={(v: boolean) => toggleAiFeature('autonomousTutor', v)}
                        />
                        <AiToggleItem 
                            icon={ShieldAlert} 
                            label="Détection Fraude" 
                            desc="Analyse temps réel" 
                            color="text-red-400" 
                            isCritical
                            checked={settings.ai?.fraudDetection !== false}
                            onChange={(v: boolean) => toggleAiFeature('fraudDetection', v)}
                        />
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-5 flex items-start gap-4">
                        <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                        <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                            L'intelligence artificielle Mathias est supervisée par le protocole Ndara-Shield pour garantir l'éthique pédagogique.
                        </p>
                    </div>
                </div>

                {/* --- LIVE CONSOLE LOGS --- */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-emerald-500" />
                            Console Système Live
                        </h2>
                        <span className="text-[8px] font-mono text-emerald-500 animate-pulse uppercase tracking-widest">Inbound Feed</span>
                    </div>

                    <div className="bg-black/80 border border-emerald-500/20 rounded-3xl p-5 h-[400px] flex flex-col shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50"></div>
                        
                        <div className="flex-1 overflow-y-auto hide-scrollbar font-mono text-[10px] md:text-xs space-y-3">
                            {loadingLogs ? (
                                <div className="space-y-2 opacity-30 text-emerald-500">
                                    <p>[00:00:00] [SYS] Initializing secure terminal...</p>
                                    <p>[00:00:01] [IA] Mathias engine handshake...</p>
                                </div>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <div key={log.id} className="flex flex-col sm:flex-row gap-1 sm:gap-3 opacity-90">
                                        <span className="text-slate-600 shrink-0">
                                            [{log.timestamp.toLocaleTimeString()}]
                                        </span>
                                        <div className="flex gap-2 w-full">
                                            <span className={clsx(
                                                "font-black uppercase shrink-0",
                                                log.eventType?.includes('course') ? "text-blue-400" :
                                                log.eventType?.includes('user') ? "text-emerald-400" :
                                                log.eventType?.includes('alert') ? "text-amber-500" :
                                                "text-purple-400"
                                            )}>
                                                [{log.eventType?.split('_')[0].substring(0,3).toUpperCase() || 'SYS'}]
                                            </span>
                                            <span className="text-slate-300 break-words line-clamp-2 md:line-clamp-none">{log.details}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-700 italic">En attente de données système...</p>
                            )}
                            <div className="flex items-center gap-2 text-emerald-500/50 pt-2">
                                <span className="w-2 h-3.5 bg-emerald-500/50 animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Firestore: OK</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CDN: Active</span>
                                </div>
                            </div>
                            <button className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">
                                <RefreshCw className="h-3 w-3" /> Purger
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AiToggleItem({ icon: Icon, label, desc, color, isCritical = false, checked, onChange }: {
    icon: any;
    label: string;
    desc: string;
    color: string;
    isCritical?: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div 
            onClick={() => onChange(!checked)}
            className={clsx(
                "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98]",
                isCritical ? "bg-red-500/[0.03] border-red-500/10" : "bg-black/40 border-white/5",
                checked ? "border-emerald-500/30 bg-emerald-500/5" : ""
            )}
        >
            <div className="flex items-center gap-3">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color.replace('text-', 'bg-').concat('/10'), color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{label}</span>
                        {isCritical && <span className="bg-red-500/20 text-red-500 text-[6px] font-black px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-widest">CRITIQUE</span>}
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            
            {/* Custom generic switch */}
            <div className={clsx(
                "w-9 h-5 rounded-full relative transition-colors border",
                checked 
                    ? (isCritical ? "bg-red-500 border-red-400" : "bg-emerald-500 border-emerald-400") 
                    : "bg-slate-800 border-slate-700"
            )}>
                <div className={clsx(
                    "absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all shadow-sm",
                    checked ? "left-[18px]" : "left-0.5 opacity-50"
                )} />
            </div>
        </div>
    );
}
