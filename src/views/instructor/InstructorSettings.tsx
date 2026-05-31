import React, { useState, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import { 
    Loader2, 
    Bot, 
    Bell, 
    Landmark, 
    CheckCircle2, 
    ChevronRight,
    Smartphone,
    Brain,
    Feather,
    Lock,
    HelpCircle
} from 'lucide-react';

export function InstructorSettings() {
  const { currentUser, isUserLoading } = useRole();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'finance' | 'preferences'>('finance');

  const [formData, setFormData] = useState({
    aiAssistanceEnabled: true,
    aiInterventionLevel: 'medium',
    notifyEnrollment: true,
    notifyPayout: true,
    mobileMoneyNumber: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        aiAssistanceEnabled: currentUser.pedagogicalPreferences?.aiAssistanceEnabled ?? true,
        aiInterventionLevel: currentUser.pedagogicalPreferences?.aiInterventionLevel || 'medium',
        notifyEnrollment: currentUser.instructorNotificationPreferences?.newEnrollment ?? true,
        notifyPayout: currentUser.instructorNotificationPreferences?.payoutUpdate ?? true,
        mobileMoneyNumber: currentUser.payoutInfo?.mobileMoneyNumber || '',
      });
    }
  }, [currentUser]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);

    try {
      const payload = {
        pedagogicalPreferences: {
            ...currentUser.pedagogicalPreferences,
            aiAssistanceEnabled: formData.aiAssistanceEnabled,
            aiInterventionLevel: formData.aiInterventionLevel,
        },
        instructorNotificationPreferences: {
            ...currentUser.instructorNotificationPreferences,
            newEnrollment: formData.notifyEnrollment,
            payoutUpdate: formData.notifyPayout,
        },
        payoutInfo: {
            ...currentUser.payoutInfo,
            mobileMoneyNumber: formData.mobileMoneyNumber || '',
        }
      };

      await updateDoc(doc(db, 'users', currentUser.uid), payload);
      alert("Réglages enregistrés !");
    } catch (e: any) {
      console.error(e);
      alert("Erreur: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-[#0f172a]"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-transparent relative flex flex-col font-sans -m-4 md:-m-8 p-4 md:p-8">
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />
      
      <header className="z-50 bg-[#0f172a]/95 backdrop-blur-md safe-area-pt border border-white/5 rounded-3xl mt-2 mb-2 p-6">
        <div className="flex items-center justify-between">
            <h1 className="font-black text-xl text-white tracking-wide uppercase">Configuration</h1>
            <button className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90 shadow-xl border border-white/5">
                <HelpCircle size={20} />
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar pt-6 pb-40 space-y-8 animate-in fade-in duration-700">
        <div className="bg-[#1e293b] rounded-[2rem] p-5 border border-white/5 flex items-center gap-4 shadow-2xl hover:border-primary/30 transition-colors">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0 bg-slate-800 flex items-center justify-center text-slate-500 font-black uppercase text-xl">
                {currentUser?.profilePictureURL ? (
                    <img src={currentUser.profilePictureURL} alt="" className="w-full h-full object-cover" />
                ) : (
                    currentUser?.fullName?.charAt(0) || '?'
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="font-bold text-white text-base truncate uppercase tracking-tight">{currentUser?.fullName}</h2>
                <p className="text-primary text-[10px] font-black uppercase tracking-widest">Academy Owner</p>
                <Link to={`/instructor/p/${currentUser?.uid}`} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5 hover:text-white transition">
                    Voir mon profil public <ChevronRight size={12} />
                </Link>
            </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8 h-full flex flex-col">
            <div className="w-full">
                <div className="flex p-1 bg-[#1e293b] rounded-[1.5rem] mb-8 border border-white/5 h-14">
                    <button type="button" onClick={() => setActiveTab('finance')} className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-white'}`}>
                        Finance & IA
                    </button>
                    <button type="button" onClick={() => setActiveTab('preferences')} className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preferences' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-white'}`}>
                        Préférences
                    </button>
                </div>

                {activeTab === 'finance' && (
                  <div className="space-y-6 m-0 animate-in fade-in duration-500">
                      <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl hover:border-primary/20 transition-colors">
                          <h3 className="font-black text-white text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                              <Landmark className="text-primary h-4 w-4" /> RETRAITS MOBILE MONEY
                          </h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Numéro de compte (Orange / MTN / Wave)</label>
                                  <div className="relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50"><Smartphone size={18}/></div>
                                      <input 
                                          value={formData.mobileMoneyNumber} 
                                          onChange={e => setFormData({...formData, mobileMoneyNumber: e.target.value})}
                                          placeholder="+236..." 
                                          className="w-full h-14 pl-12 pr-4 bg-[#0f172a] border border-white/5 rounded-[1.5rem] text-white font-black text-lg focus:outline-none focus:ring-1 focus:ring-primary/20" 
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl hover:border-primary/20 transition-colors">
                          <h3 className="font-black text-white text-xs uppercase tracking-widest mb-2 flex items-center gap-3">
                              <Bot className="text-primary h-4 w-4" /> CO-PILOTE MATHIAS
                          </h3>
                          <p className="text-slate-500 text-[10px] font-medium italic mb-6 leading-relaxed">
                              Définissez le degré d'autonomie de l'IA pour la correction et la structuration.
                          </p>
                          
                          <div className="grid gap-3">
                              <AiLevelOption 
                                  value="low" 
                                  currentValue={formData.aiInterventionLevel} 
                                  onChange={v => setFormData({...formData, aiInterventionLevel: v})}
                                  icon={Feather}
                                  label="Faible"
                                  desc="Assistant de rédaction simple"
                                  color="text-blue-400"
                                  bgColor="bg-blue-500/10"
                              />
                              <AiLevelOption 
                                  value="medium" 
                                  currentValue={formData.aiInterventionLevel} 
                                  onChange={v => setFormData({...formData, aiInterventionLevel: v})}
                                  icon={Bot}
                                  label="Moyen"
                                  desc="Analyste pédagogique actif"
                                  color="text-primary"
                                  bgColor="bg-primary/10"
                                  isRecommended
                              />
                              <AiLevelOption 
                                  value="high" 
                                  currentValue={formData.aiInterventionLevel} 
                                  onChange={v => setFormData({...formData, aiInterventionLevel: v})}
                                  icon={Brain}
                                  label="Élevé"
                                  desc="Correcteur autonome complet"
                                  color="text-purple-400"
                                  bgColor="bg-purple-500/10"
                              />
                          </div>
                      </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6 m-0 animate-in fade-in duration-500">
                      <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl hover:border-primary/20 transition-colors">
                          <h3 className="font-black text-white text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                              <Bell className="text-primary h-4 w-4" /> ALERTES ÉVÉNEMENTIELLES
                          </h3>
                          <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                  <div>
                                      <p className="font-bold text-white text-sm uppercase tracking-tight">Ventes directes</p>
                                      <p className="text-[10px] text-slate-500 font-medium">À chaque nouvelle inscription</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" className="sr-only peer" checked={formData.notifyEnrollment} onChange={e => setFormData({...formData, notifyEnrollment: e.target.checked})} />
                                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                  </label>
                              </div>
                              <div className="h-px bg-white/5" />
                              <div className="flex items-center justify-between">
                                  <div>
                                      <p className="font-bold text-white text-sm uppercase tracking-tight">Suivi Financier</p>
                                      <p className="text-[10px] text-slate-500 font-medium">Audit et virements validés</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" className="sr-only peer" checked={formData.notifyPayout} onChange={e => setFormData({...formData, notifyPayout: e.target.checked})} />
                                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                  </label>
                              </div>
                          </div>
                      </div>

                      <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl hover:border-primary/20 transition-colors">
                          <h3 className="font-black text-white text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                              <Lock className="text-primary h-4 w-4" /> CONFIDENTIALITÉ
                          </h3>
                          <div className="flex items-center justify-between">
                              <div>
                                  <p className="font-bold text-white text-sm uppercase tracking-tight">Profil Public</p>
                                  <p className="text-[10px] text-slate-500 font-medium">Rendre visible aux étudiants</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                  </label>
                          </div>
                      </div>
                  </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 md:p-0 md:bg-transparent bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent z-40 safe-area-pb md:sticky md:mt-auto">
                <button 
                    type="submit" 
                    disabled={isSaving} 
                    className="flex justify-center items-center gap-3 w-full h-16 md:h-14 rounded-[2.5rem] bg-gradient-to-r from-primary to-emerald-600 text-slate-950 font-black uppercase text-sm tracking-[0.15em] shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 transition-all disabled:opacity-50 border-none"
                >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> ENREGISTRER</>}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}

function AiLevelOption({ value, currentValue, onChange, icon: Icon, label, desc, color, bgColor, isRecommended }: any) {
    const isActive = currentValue === value;
    return (
        <label className={`flex items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all active:scale-[0.98] cursor-pointer group ${isActive ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-white/5 bg-[#0f172a] opacity-60 grayscale hover:opacity-100"}`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${bgColor} ${color}`}>
                    <Icon size={20} />
                </div>
                <div className="flex flex-col">
                    <span className={`text-sm font-black uppercase tracking-tight ${isActive ? "text-white" : "text-slate-400"}`}>{label}</span>
                    <span className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">{desc}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {isRecommended && <span className="bg-primary text-slate-950 border-none rounded-md font-black text-[7px] uppercase px-1.5 py-0.5">TOP</span>}
                <input type="radio" name="ai-level" checked={isActive} onChange={() => onChange(value)} className="w-5 h-5 accent-primary cursor-pointer" />
            </div>
        </label>
    );
}
