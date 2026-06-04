import React, { useState } from 'react';
import { 
  Settings, Palette, Wrench, Users, GraduationCap, BookOpen, Award, CreditCard, 
  Landmark, ShieldCheck, Shield, Key, HardDrive, BrainCircuit, Bell, MessageSquare, 
  Layout, TrendingUp, BarChart3, Globe, Save, Loader2, X, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

const HUBS = [
  {
    id: 'global',
    title: 'Hub Global',
    description: 'Structure, Apparence, Système',
    icon: Globe,
    modules: [
        { id: 'general', title: 'Général' },
        { id: 'appearance', title: 'Apparence' },
        { id: 'maintenance', title: 'Maintenance' },
    ]
  },
  {
    id: 'actors',
    title: 'Hub Acteurs',
    description: 'Élèves, Instructeurs, Rôles',
    icon: Users,
    modules: [
        { id: 'users', title: 'Utilisateurs' },
        { id: 'instructors', title: 'Formateurs' },
    ]
  },
  {
    id: 'pedagogy',
    title: 'Hub Pédagogie',
    description: 'Cours, Modules, Certificats',
    icon: BookOpen,
    modules: [
        { id: 'courses', title: 'Formations' },
        { id: 'certificates', title: 'Certificats' },
    ]
  },
  {
    id: 'fintech',
    title: 'Hub Fintech',
    description: 'Paiements, Portefeuilles',
    icon: CreditCard,
    modules: [
        { id: 'payments', title: 'Paiements' },
        { id: 'commissions', title: 'Commissions' },
    ]
  },
  {
    id: 'security',
    title: 'Hub Sécurité & Tech',
    description: 'Protection, APIs, Serveurs',
    icon: ShieldCheck,
    modules: [
        { id: 'security_config', title: 'Sécurité' },
        { id: 'api_integrations', title: 'Intégrations API' },
        { id: 'storage', title: 'Stockage & Médias' },
    ]
  },
  {
    id: 'growth',
    title: 'Hub Croissance & IA',
    description: 'Mathias, Marketing, Analytique',
    icon: TrendingUp,
    modules: [
        { id: 'ai', title: 'IA Mathias' },
        { id: 'notifications', title: 'Notifications' },
        { id: 'moderation', title: 'Modération' },
        { id: 'cms', title: 'Pages CMS' },
        { id: 'marketing', title: 'Marketing' },
        { id: 'analytics', title: 'Analytics' },
    ]
  }
];

const getHubTheme = (id: string) => {
    switch(id) {
        case 'global': return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" };
        case 'actors': return { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" };
        case 'pedagogy': return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" };
        case 'fintech': return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" };
        case 'security': return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" };
        case 'growth': return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" };
        default: return { bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/20" };
    }
}

export function AdminSettings() {
  const [activeHubId, setActiveHubId] = useState<string>('global');
  const [activeModuleId, setActiveModuleId] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const activeHub = HUBS.find(h => h.id === activeHubId)!;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#090E17] text-white -m-4 md:-m-10 font-sans">
      
      {/* MOBILE VIEW: Grid of 6 Hubs */}
      <div className={clsx("p-4 lg:hidden w-full pb-24", isMobileSheetOpen && "hidden")}>
         <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 shadow-inner">
                <Settings className="h-5 w-5" />
            </div>
            <div>
                <h1 className="font-black uppercase text-xl tracking-tight text-white mb-0.5">Configuration</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pilotage ERP Global</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            {HUBS.map(hub => {
               const theme = getHubTheme(hub.id);
               return (
                  <button 
                     key={hub.id}
                     onClick={() => {
                        setActiveHubId(hub.id);
                        setActiveModuleId(hub.modules[0].id);
                        setIsMobileSheetOpen(true);
                     }}
                     className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-800/80 active:scale-95 transition-all shadow-lg"
                  >
                     <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center border", theme.bg, theme.border)}>
                        <hub.icon className={clsx("w-6 h-6", theme.text)} />
                     </div>
                     <div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-200">{hub.title.replace('Hub ', '')}</h3>
                        <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase line-clamp-1">{hub.modules.length} modules</p>
                     </div>
                  </button>
               )
            })}
         </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-r border-slate-800/50 h-screen sticky top-0 z-20 flex-shrink-0 shadow-2xl">
        <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 shadow-inner">
                <Settings className="h-6 w-6" />
            </div>
            <div>
                <h1 className="font-black uppercase text-sm tracking-tight text-white mb-0.5">Configuration</h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Pilotage Global</p>
            </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto hide-scrollbar p-4 xl:p-6 space-y-2">
          {HUBS.map((hub) => {
            const theme = getHubTheme(hub.id);
            return (
              <button
                key={hub.id}
                onClick={() => {
                    setActiveHubId(hub.id);
                    setActiveModuleId(hub.modules[0].id);
                }}
                className={clsx(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                  activeHubId === hub.id 
                      ? 'bg-slate-800/80 shadow-md border border-slate-700/50' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                )}
              >
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border transition-colors", activeHubId === hub.id ? [theme.bg, theme.border] : "border-transparent bg-slate-800", "group-hover:" + theme.bg)}>
                    <hub.icon className={clsx("w-5 h-5", activeHubId === hub.id ? theme.text : "text-slate-400", "group-hover:" + theme.text)} />
                </div>
                <div className="flex-1 relative">
                    <div className={clsx("text-xs font-black uppercase tracking-widest", activeHubId === hub.id ? "text-white" : "text-slate-400", "group-hover:text-white")}>
                        {hub.title}
                    </div>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* OVERLAY MOBILE */}
      {isMobileSheetOpen && (
         <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileSheetOpen(false)} />
      )}

      {/* MAIN CONTENT AREA */}
      <main className={clsx(
          "flex-1 relative flex flex-col bg-[#090E17] overflow-hidden",
          isMobileSheetOpen ? "fixed bottom-0 left-0 right-0 z-50 h-[92vh] rounded-t-[2.5rem] border-t border-x border-slate-700/60 shadow-2xl animate-in slide-in-from-bottom duration-300 lg:static lg:h-auto lg:rounded-none lg:border-none lg:shadow-none lg:animate-none" : "hidden lg:flex"
      )}>
          
          <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto mt-4 mb-2 lg:hidden shrink-0" />
          
          <button onClick={() => setIsMobileSheetOpen(false)} className="lg:hidden absolute top-4 right-5 p-2 text-slate-500 hover:text-white bg-slate-800/50 rounded-full">
              <X className="w-4 h-4" />
          </button>

          <header className="px-6 lg:px-12 pt-4 lg:pt-12 pb-6 shrink-0 border-b border-slate-800/50 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-slate-500 mb-2 invisible lg:visible">
                  <h2 className="text-[10px] font-black uppercase tracking-widest">{activeHub.title}</h2>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                 <activeHub.icon className={clsx("w-6 h-6 lg:hidden", getHubTheme(activeHub.id).text)} />
                 {activeHub.title}
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1.5">{activeHub.description}</p>
          </header>

          <div className="px-6 lg:px-12 pt-2 lg:pt-0 shrink-0">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-800/50 gap-6">
                  {activeHub.modules.map(mod => (
                      <button 
                        key={mod.id}
                        onClick={() => setActiveModuleId(mod.id)}
                        className={clsx(
                            "py-4 text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 relative top-px",
                            activeModuleId === mod.id ? "border-white text-white" : "border-transparent text-slate-500 hover:text-slate-300"
                        )}
                      >
                          {mod.title}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 pb-32 hide-scrollbar">
              <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                  {renderModuleForm(activeModuleId)}
              </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-12 z-20 flex justify-end pointer-events-none">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 h-14 w-full lg:w-auto px-10 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 pointer-events-auto"
              >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                  Sauvegarder
              </button>
          </div>
      </main>
    </div>
  );
}

// ------ UI Forms Renderers ------

const renderModuleForm = (moduleId: string) => {
    switch (moduleId) {
        /* GLOBALS */
        case 'general': return (
            <>
                <TextInput label="Nom de la plateforme" defaultValue="Ndara Afrique" />
                <TextInput label="Slogan principal" defaultValue="L'excellence africaine sans frontières" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SelectInput label="Langue système" value="fr" options={[{l: 'Français', v: 'fr'}, {l: 'English', v: 'en'}, {l: 'Sango', v: 'sg'}]} />
                    <SelectInput label="Fuseau horaire" value="Africa/Douala" options={[{l: 'Africa/Douala', v: 'Africa/Douala'}, {l: 'Africa/Abidjan', v: 'Africa/Abidjan'}]} />
                </div>
            </>
        );
        case 'appearance': return (
            <>
                <Toggle label="Mode Sombre par défaut" description="Force le dark mode pour tous les utilisateurs non connectés" checked={true} />
                <SelectInput label="Thème visuel" value="emerald" options={[{l: 'Émeraude Ndara', v: 'emerald'}, {l: 'Cosmic Slate', v: 'slate'}, {l: 'Oasis AMOLED', v: 'black'}]} />
            </>
        );
        case 'maintenance': return (
            <>
                <Toggle label="Mode Maintenance" description="Rend le site inaccessible avec une page 'Revenez plus tard'" checked={false} />
                <Toggle label="Sauvegarde automatique (Firestore)" description="Export quotidien vers Google Cloud Storage" checked={true} />
                <Toggle label="Activer les logs détaillés" description="Augmente la fidélité des événements enregistrés dans le journal de sécurité" checked={true} />
            </>
        );
        
        /* ACTORS */
        case 'users': return (
            <>
                <Toggle label="Inscriptions Ouvertes" description="Permettre aux visiteurs de créer un compte librement" checked={true} />
                <Toggle label="Validation Email Obligatoire" description="Bloque la connexion avant confirmation du mail" checked={false} />
                <SelectInput label="Rôle par défaut" value="student" options={[{l: 'Étudiant', v: 'student'}]} />
            </>
        );
        case 'instructors': return (
            <>
                <Toggle label="Inscriptions Formateurs Activées" description="Formulaire de soumission de candidature public" checked={true} />
                <Toggle label="Validation manuelle requise" description="Les nouvelles candidatures doivent être approuvées" checked={true} />
            </>
        );

        /* PEDAGOGY */
        case 'courses': return (
            <>
                <Toggle label="Validation admin des cours" description="Les cours soumis par les formateurs passent en brouillon avant publication" checked={true} />
                <Toggle label="Exiger une vidéo de présentation" checked={true} />
                <TextInput type="number" label="Prix minimum d'une formation (XAF)" defaultValue="1000" />
            </>
        );
        case 'certificates': return (
            <>
                <Toggle label="Génération automatique" description="Délivre le certificat dès que le cours est à 100%" checked={true} />
                <Toggle label="Aposer un Code QR cryptographique" description="Permet la vérification d'authenticité via blockchain ou base centralisée" checked={true} />
                <SelectInput label="Design du certificat" value="modern" options={[{l: 'Modern Elite', v: 'modern'}, {l: 'Classic University', v: 'classic'}]} />
            </>
        );

        /* FINTECH */
        case 'payments': return (
            <>
                <Toggle label="Activer les paiements en ligne" description="Moteur transactionnel global" checked={true} />
                <SelectInput label="Devise de référence" value="XAF" options={[{l: 'Franc CFA (XAF)', v: 'XAF'}, {l: 'Franc CFA (XOF)', v: 'XOF'}]} />
                <Toggle label="Passerelle Mobile Money (CINETPay, MeSomb)" checked={true} />
                <Toggle label="Passerelle Carte Bancaire (Stripe/Flutterwave)" checked={true} />
            </>
        );
        case 'commissions': return (
            <>
                <TextInput type="number" label="Commission Plateforme NDARA (%)" defaultValue="20" />
                <Toggle label="Paiement automatique des formateurs" description="Transfert automatique vers leur Wallet le 1er du mois" checked={false} />
            </>
        );

        /* SECURITY */
        case 'security_config': return (
            <>
                <Toggle label="Authentification 2FA renforcée (Admins)" checked={false} />
                <TextInput type="number" label="Tentatives de login max (avant ban)" defaultValue="5" />
                <Toggle label="Activer le blocage IP dynamique" checked={true} />
            </>
        );
        case 'api_integrations': return (
            <>
                <TextInput label="Clé API OpenAI (GPT-4 / Whisper)" type="password" placeholder="sk-..." />
                <TextInput label="Google OAuth Client ID" type="text" placeholder="123456789-xxxx.apps.googleusercontent.com" />
            </>
        );
        case 'storage': return (
            <>
                <SelectInput label="Fournisseur Cloud CDN" value="firebase" options={[{l: 'Google Cloud Storage / Firebase', v: 'firebase'}]} />
                <TextInput type="number" label="Taille max des vidéos (Mo)" defaultValue="2000" />
                <Toggle label="Optimisation automatique des images" checked={true} />
            </>
        );

        /* GROWTH */
        case 'ai': return (
            <>
                <Toggle label="Activer l'IA Pédagogique Mathias" description="Le tuteur virtuel intelligent" checked={true} />
                <Toggle label="Correction automatique des Quiz par l'IA" checked={true} />
                <SelectInput label="Modèle Cognitif" value="gemini" options={[{l: 'Gemini 1.5 Flash (Google)', v: 'gemini'}]} />
            </>
        );
        case 'notifications': return (
            <>
                <Toggle label="Envoi des Emails Transactionnels" checked={true} />
                <Toggle label="Cloud Messaging (Push Mobile)" checked={true} />
                <Toggle label="Intégration WhatsApp Business API" checked={false} />
            </>
        );
        case 'moderation': return (
            <>
                <Toggle label="Filtre profanité automatique" checked={true} />
                <Toggle label="Approbation manuelle des commentaires" checked={false} />
            </>
        );
        case 'cms': return (
            <>
                <Toggle label="Activer le Blog / Articles" checked={true} />
                <Toggle label="Afficher la FAQ publique" checked={true} />
            </>
        );
        case 'marketing': return (
            <>
                <Toggle label="Système de codes promotionnels" checked={true} />
                <Toggle label="Programme d'affiliation (Parrainage)" checked={true} />
                <TextInput type="number" label="Taux de retour Affilié (%)" defaultValue="10" />
            </>
        );
        case 'analytics': return (
            <>
                <Toggle label="Télémétrie d'usage interne" checked={true} />
                <TextInput label="Google Analytics 4 Measurement ID" placeholder="G-XXXXXXXXXX" />
            </>
        );

        default: return (
            <div className="p-10 border border-dashed border-slate-800 rounded-3xl text-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Module sélectionné : {moduleId}</p>
            </div>
        );
    }
}

// ------ Custom Input Components ------

function Toggle({ label, description, checked }: any) {
  const [isOn, setIsOn] = useState(checked);
  return (
    <div className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-slate-900 border border-slate-800/60 shadow-sm">
       <div className="flex-1">
         <span className="text-xs font-black text-white uppercase tracking-tight block">{label}</span>
         {description && <span className="text-[10px] text-slate-500 mt-1 block font-medium leading-relaxed">{description}</span>}
       </div>
       <button 
         onClick={() => setIsOn(!isOn)}
         className={clsx(
           "w-12 h-7 shrink-0 rounded-full p-1 transition-colors relative border",
           isOn ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
         )}
       >
         <div className={clsx(
            "w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
            isOn ? "translate-x-5" : "translate-x-0"
         )} />
       </button>
    </div>
  );
}

function TextInput({ label, defaultValue = "", type = "text", placeholder = "" }: any) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
         <input 
            type={type} 
            defaultValue={defaultValue} 
            placeholder={placeholder}
            className="w-full h-14 bg-slate-900 border border-slate-800/60 rounded-2xl px-5 text-white text-sm font-medium focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-700 shadow-sm"
         />
      </div>
   )
}

function SelectInput({ label, value, options }: any) {
    return (
      <div className="space-y-2">
         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
         <div className="relative shadow-sm">
             <select defaultValue={value} className="w-full h-14 bg-slate-900 border border-slate-800/60 rounded-2xl px-5 text-white text-sm font-medium focus:outline-none focus:border-white/20 transition-colors appearance-none">
                 {options.map((opt:any) => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
             </select>
             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <ChevronDown className="w-4 h-4" />
             </div>
         </div>
      </div>
    )
}

