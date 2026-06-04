import React, { useState } from 'react';
import { 
  BellRing, 
  Mail, 
  Send, 
  Smartphone, 
  History, 
  Edit3, 
  Eye, 
  Frown,
  Users
} from 'lucide-react';
import clsx from 'clsx';

export function AdminMarketing() {
  const [activeTab, setActiveTab] = useState('push');
  
  // States for Push notification form
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTarget, setPushTarget] = useState('all');
  const [isSending, setIsSending] = useState(false);

  const handleSendPush = () => {
    setIsSending(true);
    setTimeout(() => {
      setPushTitle('');
      setPushMessage('');
      setPushTarget('all');
      setIsSending(false);
      alert("Notification programmée et envoyée avec succès.");
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-orange-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <BellRing className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Communication Systémique</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Marketing & Push</h1>
          <p className="text-slate-400 text-sm font-medium">Gérez les notifications mobiles et les emails transactionnels automatiques.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setActiveTab('push')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'push' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
                <Smartphone className="h-4 w-4" /> Notifications Push
            </button>
            <button 
              onClick={() => setActiveTab('emails')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'emails' ? "bg-slate-800 text-orange-400 shadow-sm" : "text-orange-500/50 hover:text-orange-400/80"
              )}
            >
                <Mail className="h-4 w-4" /> Emails Modèles
            </button>
        </div>

        {/* Content Panels */}
        <div>
          {activeTab === 'push' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               
               {/* Mobile-first Notification Form */}
               <div className="md:col-span-1 lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-lg font-black text-white uppercase tracking-widest">Nouveau Message Push</h2>
                       <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                         <Send className="w-4 h-4 text-orange-500" />
                       </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Segment cible</label>
                      <div className="flex flex-wrap gap-2">
                         <button 
                           onClick={() => setPushTarget('all')}
                           className={clsx(
                             "px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                             pushTarget === 'all' ? "bg-orange-500 text-slate-950" : "bg-slate-900 border border-slate-700 text-slate-400"
                           )}
                         >
                           <Users className="w-3.5 h-3.5" /> Tous (Mass-Push)
                         </button>
                         <button 
                           onClick={() => setPushTarget('students')}
                           className={clsx(
                             "px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors",
                             pushTarget === 'students' ? "bg-orange-500 text-slate-950" : "bg-slate-900 border border-slate-700 text-slate-400"
                           )}
                         >
                           Étudiants Uniquement
                         </button>
                         <button 
                           onClick={() => setPushTarget('instructors')}
                           className={clsx(
                             "px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors",
                             pushTarget === 'instructors' ? "bg-orange-500 text-slate-950" : "bg-slate-900 border border-slate-700 text-slate-400"
                           )}
                         >
                           Instructeurs Uniquement
                         </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Titre de la notification</label>
                       <input 
                         type="text"
                         placeholder="Ex: Nouvelle formation disponible !" 
                         value={pushTitle} 
                         onChange={e => setPushTitle(e.target.value)}
                         className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 px-5 text-white text-base font-bold focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-slate-600"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Contenu du message</label>
                       <textarea 
                         placeholder="Découvrez notre parcours avancé en Data Science..." 
                         value={pushMessage} 
                         onChange={e => setPushMessage(e.target.value)}
                         rows={4}
                         className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 px-5 text-slate-300 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none placeholder:text-slate-600 leading-relaxed"
                       />
                    </div>
                  </div>

                  {/* Massive Action Button (Android First) */}
                  <div className="mt-8 pt-6 border-t border-slate-700/50">
                    <button 
                      onClick={handleSendPush}
                      disabled={isSending || !pushTitle || !pushMessage}
                      className="w-full h-16 rounded-2xl bg-orange-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black uppercase text-sm tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                       {isSending ? "ENVOI EN COURS..." : <><Send className="w-5 h-5"/> ENVOYER LA NOTIFICATION</>}
                    </button>
                  </div>
               </div>

               {/* Preview Mockup Mobile */}
               <div className="hidden lg:flex flex-col items-center justify-center">
                  <div className="w-[300px] h-[600px] border-[8px] border-slate-900 rounded-[3rem] bg-slate-950 p-4 relative shadow-2xl overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl"></div>
                    <div className="flex-1"></div>
                    
                    {/* Simulated Push Notification Toast */}
                    {(pushTitle || pushMessage) ? (
                      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/10 animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
                              <span className="text-[8px] font-black text-white">N</span>
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">NDARA</span>
                           <span className="text-[10px] text-slate-500 ml-auto">à l'instant</span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-tight mb-1">{pushTitle || "Titre..."}</h4>
                        <p className="text-xs text-slate-300 leading-tight line-clamp-2">{pushMessage || "Message..."}</p>
                      </div>
                    ) : (
                      <div className="text-center opacity-30 pb-20 space-y-4">
                        <Smartphone className="w-12 h-12 mx-auto text-slate-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest px-8">Saisissez un message pour prévisualiser</p>
                      </div>
                    )}

                    <div className="flex-1"></div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'emails' && (
             <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nom du Modèle</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Déclencheur</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                      <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {[
                      { id: 1, name: 'Bienvenue Étudiant', trigger: 'Inscription', status: 'Actif' },
                      { id: 2, name: 'Reçu d\'achat', trigger: 'Paiement Validé', status: 'Actif' },
                      { id: 3, name: 'Cours Rejeté', trigger: 'Modération', status: 'Brouillon' }
                    ].map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                           <div className="flex gap-4 items-center">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                               <Mail className="w-4 h-4 text-orange-500" />
                             </div>
                             <div>
                                <span className="font-bold text-sm text-white uppercase">{tpl.name}</span>
                                <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Système Ndara</div>
                             </div>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className="text-xs text-slate-400 font-medium italic">{tpl.trigger}</span>
                        </td>
                        <td className="p-4">
                           <span className={clsx(
                             "inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded",
                             tpl.status === 'Actif' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-400"
                           )}>
                             {tpl.status}
                           </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center">
                               <Eye className="w-4 h-4" />
                             </button>
                             <button className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center">
                               <Edit3 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
