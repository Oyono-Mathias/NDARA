import React, { useState, useEffect } from 'react';
import { 
  Settings, Palette, Wrench, Users, GraduationCap, BookOpen, Award, CreditCard, 
  Landmark, ShieldCheck, Shield, Key, HardDrive, BrainCircuit, Bell, MessageSquare, 
  Layout, TrendingUp, BarChart3, Globe, Save, Loader2, X, ChevronDown, Activity
} from 'lucide-react';
import clsx from 'clsx';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

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
  
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Health Data
  const [healthStats, setHealthStats] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [validatingVideo, setValidatingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<{provider: string, valid: boolean} | null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchHealthStats = async (currentConfig: any = config) => {
    setLoadingHealth(true);
    try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/admin/video/ping', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                bunnyApiKey: currentConfig.bunny_stream_api_key,
                bunnyLibraryId: currentConfig.bunny_stream_library_id,
                cfAccountId: currentConfig.cloudflare_account_id,
                cfApiToken: currentConfig.cloudflare_api_token
            })
        });
        const data = await res.json();
        
        let totalVideos = 0;
        let bunnyCount = 0;
        let cloudflareCount = 0;

        const { collection, getDocs } = await import('firebase/firestore');
        const coursesSnap = await getDocs(collection(db, 'courses'));
        coursesSnap.docs.forEach((docSnap: any) => {
            const courseData = docSnap.data();
            if (courseData.content && Array.isArray(courseData.content)) {
                courseData.content.forEach((module: any) => {
                    if (module.lessons && Array.isArray(module.lessons)) {
                        module.lessons.forEach((lesson: any) => {
                            if (lesson.videoUrl || lesson.videoId) {
                                totalVideos++;
                                if (lesson.provider === 'cloudflare') {
                                    cloudflareCount++;
                                } else {
                                    bunnyCount++;
                                }
                            }
                        });
                    }
                });
            }
        });

        if (data.success) {
            setHealthStats({
                stats: { totalVideos, bunnyCount, cloudflareCount },
                ping: data.ping
            });
        }
    } catch(err) {
        console.error("Failed to fetch health stats", err);
    }
    setLoadingHealth(false);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global_config');
        const docSnap = await getDoc(docRef);
        let loadedConfig = {};
        if (docSnap.exists()) {
          loadedConfig = docSnap.data();
          setConfig(loadedConfig);
        } else {
          const defaultConfig = {
            platform_name: "Ndara Afrique",
            slogan: "L'excellence africaine sans frontières",
            language: "fr",
            timezone: "Africa/Douala",
            enforce_dark_mode: true,
            theme: "emerald",
            maintenance_mode: false,
            auto_backup: true,
            verbose_logs: true,
            open_registration: true,
            email_validation_required: false,
            default_role: "student",
            instructor_registration: true,
            manual_validation_required: true,
            admin_validation_courses: true,
            video_required: true,
            min_price: 1000,
            auto_generation_cert: true,
            qr_code: true,
            cert_design: "modern",
            enable_payments: true,
            currency: "XAF",
            mm_gateway: true,
            card_gateway: true,
            platform_commission: 20,
            auto_payout: false,
            enforce_2fa: false,
            max_login_attempts: 5,
            dynamic_ip_block: true,
            openai_api_key: "",
            google_client_id: "",
            active_video_provider: "bunny",
            cdn_provider: "firebase",
            max_video_size: 2000,
            auto_image_optimization: true,
            enable_tutor: true,
            auto_quiz_grading: true,
            ai_model: "gemini",
            transactional_emails: true,
            cloud_messaging: true,
            whatsapp_api: false,
            profanity_filter: true,
            manual_comments_approval: false,
            enable_blog: true,
            public_faq: true,
            promo_codes: true,
            affiliate_program: true,
            affiliate_return_rate: 10,
            internal_telemetry: true,
            ga4_id: ""
          };
          loadedConfig = defaultConfig;
          setConfig(defaultConfig);
          await setDoc(docRef, defaultConfig);
        }
        fetchHealthStats(loadedConfig);
      } catch (error) {
        console.error("Error fetching settings: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const activeHub = HUBS.find(h => h.id === activeHubId)!;

  const updateObj = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleValidateProvider = async (provider: 'bunny' | 'cloudflare') => {
      setValidatingVideo(true);
      setStatusMsg(null);
      try {
          const token = await auth.currentUser?.getIdToken();
          const pData = provider === 'cloudflare' 
            ? { provider, accountId: config.cloudflare_account_id, apiKey: config.cloudflare_api_token }
            : { provider, libraryId: config.bunny_stream_library_id, apiKey: config.bunny_stream_api_key };
            
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
              setStatusMsg({ type: 'success', text: `Clés valides !` });
              updateObj('active_video_provider', provider);
          } else {
              setVideoStatus({ provider, valid: false });
              setStatusMsg({ type: 'error', text: data.error || `Clés invalides.` });
          }
      } catch (err) {
          setStatusMsg({ type: 'error', text: 'Erreur réseau.' });
      }
      setValidatingVideo(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', 'global_config');
      await updateDoc(docRef, config);
    } catch (error) {
       console.error("Error updating config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#090E17] text-white -m-4 md:-m-10 font-sans animate-in fade-in duration-700">
        <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-r border-slate-800/50 h-screen sticky top-0 z-20 flex-shrink-0 animate-pulse">
           <div className="p-8"><div className="w-48 h-8 bg-slate-800 rounded"></div></div>
           <div className="flex-1 p-4 space-y-4">
              {[...Array(6)].map((_, i) => <div key={i} className="w-full h-14 bg-slate-800/50 rounded-xl"></div>)}
           </div>
        </aside>
        <main className="flex-1 p-6 lg:p-12">
          <div className="space-y-4 max-w-3xl">
             <div className="h-10 w-64 bg-slate-800 rounded animate-pulse"></div>
             <div className="flex gap-4 border-b border-slate-800/50 pb-4">
               {[...Array(3)].map((_, i) => <div key={i} className="w-24 h-6 bg-slate-800 rounded animate-pulse"></div>)}
             </div>
             <div className="space-y-6 pt-4">
               {[...Array(4)].map((_, i) => <div key={i} className="h-24 w-full bg-slate-800/30 rounded-2xl animate-pulse"></div>)}
             </div>
          </div>
        </main>
      </div>
    );
  }

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

  function renderModuleForm(moduleId: string) {
    switch (moduleId) {
        /* GLOBALS */
        case 'general': return (
            <>
                <TextInput label="Nom de la plateforme" value={config.platform_name} onChange={(v: string) => updateObj('platform_name', v)} />
                <TextInput label="Slogan principal" value={config.slogan} onChange={(v: string) => updateObj('slogan', v)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SelectInput label="Langue système" value={config.language} onChange={(v: string) => updateObj('language', v)} options={[{l: 'Français', v: 'fr'}, {l: 'English', v: 'en'}, {l: 'Sango', v: 'sg'}]} />
                    <SelectInput label="Fuseau horaire" value={config.timezone} onChange={(v: string) => updateObj('timezone', v)} options={[{l: 'Africa/Douala', v: 'Africa/Douala'}, {l: 'Africa/Abidjan', v: 'Africa/Abidjan'}]} />
                </div>
            </>
        );
        case 'appearance': return (
            <>
                <Toggle label="Mode Sombre par défaut" description="Force le dark mode pour tous les utilisateurs non connectés" checked={config.enforce_dark_mode} onChange={(v: boolean) => updateObj('enforce_dark_mode', v)} />
                <SelectInput label="Thème visuel" value={config.theme} onChange={(v: string) => updateObj('theme', v)} options={[{l: 'Émeraude Ndara', v: 'emerald'}, {l: 'Cosmic Slate', v: 'slate'}, {l: 'Oasis AMOLED', v: 'black'}]} />
            </>
        );
        case 'maintenance': return (
            <>
                <Toggle label="Mode Maintenance" description="Rend le site inaccessible avec une page 'Revenez plus tard'" checked={config.maintenance_mode} onChange={(v: boolean) => updateObj('maintenance_mode', v)} />
                <Toggle label="Sauvegarde automatique (Firestore)" description="Export quotidien vers Google Cloud Storage" checked={config.auto_backup} onChange={(v: boolean) => updateObj('auto_backup', v)} />
                <Toggle label="Activer les logs détaillés" description="Augmente la fidélité des événements enregistrés dans le journal de sécurité" checked={config.verbose_logs} onChange={(v: boolean) => updateObj('verbose_logs', v)} />
            </>
        );
        
        /* ACTORS */
        case 'users': return (
            <>
                <Toggle label="Inscriptions Ouvertes" description="Permettre aux visiteurs de créer un compte librement" checked={config.open_registration} onChange={(v: boolean) => updateObj('open_registration', v)} />
                <Toggle label="Validation Email Obligatoire" description="Bloque la connexion avant confirmation du mail" checked={config.email_validation_required} onChange={(v: boolean) => updateObj('email_validation_required', v)} />
                <SelectInput label="Rôle par défaut" value={config.default_role} onChange={(v: string) => updateObj('default_role', v)} options={[{l: 'Étudiant', v: 'student'}]} />
            </>
        );
        case 'instructors': return (
            <>
                <Toggle label="Inscriptions Formateurs Activées" description="Formulaire de soumission de candidature public" checked={config.instructor_registration} onChange={(v: boolean) => updateObj('instructor_registration', v)} />
                <Toggle label="Validation manuelle requise" description="Les nouvelles candidatures doivent être approuvées" checked={config.manual_validation_required} onChange={(v: boolean) => updateObj('manual_validation_required', v)} />
            </>
        );

        /* PEDAGOGY */
        case 'courses': return (
            <>
                <Toggle label="Validation admin des cours" description="Les cours soumis par les formateurs passent en brouillon avant publication" checked={config.admin_validation_courses} onChange={(v: boolean) => updateObj('admin_validation_courses', v)} />
                <Toggle label="Exiger une vidéo de présentation" checked={config.video_required} onChange={(v: boolean) => updateObj('video_required', v)} />
                <TextInput type="number" label="Prix minimum d'une formation (XAF)" value={config.min_price} onChange={(v: any) => updateObj('min_price', Number(v))} />
            </>
        );
        case 'certificates': return (
            <>
                <Toggle label="Génération automatique" description="Délivre le certificat dès que le cours est à 100%" checked={config.auto_generation_cert} onChange={(v: boolean) => updateObj('auto_generation_cert', v)} />
                <Toggle label="Aposer un Code QR cryptographique" description="Permet la vérification d'authenticité via blockchain ou base centralisée" checked={config.qr_code} onChange={(v: boolean) => updateObj('qr_code', v)} />
                <SelectInput label="Design du certificat" value={config.cert_design} onChange={(v: string) => updateObj('cert_design', v)} options={[{l: 'Modern Elite', v: 'modern'}, {l: 'Classic University', v: 'classic'}]} />
            </>
        );

        /* FINTECH */
        case 'payments': return (
            <>
                <Toggle label="Activer les paiements en ligne" description="Moteur transactionnel global" checked={config.enable_payments} onChange={(v: boolean) => updateObj('enable_payments', v)} />
                <SelectInput label="Devise de référence" value={config.currency} onChange={(v: string) => updateObj('currency', v)} options={[{l: 'Franc CFA (XAF)', v: 'XAF'}, {l: 'Franc CFA (XOF)', v: 'XOF'}]} />
                <Toggle label="Passerelle Mobile Money (CINETPay, MeSomb)" checked={config.mm_gateway} onChange={(v: boolean) => updateObj('mm_gateway', v)} />
                <Toggle label="Passerelle Carte Bancaire (Stripe/Flutterwave)" checked={config.card_gateway} onChange={(v: boolean) => updateObj('card_gateway', v)} />
            </>
        );
        case 'commissions': return (
            <>
                <TextInput type="number" label="Commission Plateforme NDARA (%)" value={config.platform_commission} onChange={(v: any) => updateObj('platform_commission', Number(v))} />
                <Toggle label="Paiement automatique des formateurs" description="Transfert automatique vers leur Wallet le 1er du mois" checked={config.auto_payout} onChange={(v: boolean) => updateObj('auto_payout', v)} />
            </>
        );

        /* SECURITY */
        case 'security_config': return (
            <>
                <Toggle label="Authentification 2FA renforcée (Admins)" checked={config.enforce_2fa} onChange={(v: boolean) => updateObj('enforce_2fa', v)} />
                <TextInput type="number" label="Tentatives de login max (avant ban)" value={config.max_login_attempts} onChange={(v: any) => updateObj('max_login_attempts', Number(v))} />
                <Toggle label="Activer le blocage IP dynamique" checked={config.dynamic_ip_block} onChange={(v: boolean) => updateObj('dynamic_ip_block', v)} />
            </>
        );
        case 'api_integrations': return (
            <>
                <TextInput label="Clé API OpenAI (GPT-4 / Whisper)" type="password" placeholder="sk-..." value={config.openai_api_key} onChange={(v: string) => updateObj('openai_api_key', v)} />
                <TextInput label="Google OAuth Client ID" type="text" placeholder="123456789-xxxx.apps.googleusercontent.com" value={config.google_client_id} onChange={(v: string) => updateObj('google_client_id', v)} />
            </>
        );
        case 'storage': return (
            <>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><HardDrive className="w-4 h-4 text-emerald-400" /> Infrastructure Vidéo Globale</h3>
                    
                    <div className="mb-6 p-4 rounded-xl border border-slate-700 bg-[#0B0F19]">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" /> État des Services Vidéo
                         </h3>
                         <button onClick={fetchHealthStats} className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest font-bold" disabled={loadingHealth}>
                             {loadingHealth ? 'Actualisation...' : 'Actualiser'}
                         </button>
                      </div>
                      {healthStats ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-800 rounded-lg p-3 text-center border-b-2 border-slate-700">
                              <div className="text-2xl font-black text-white">{healthStats.stats.totalVideos}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Vidéos Uploadées</div>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-3 text-center border-b-2 border-emerald-500/50 relative overflow-hidden group">
                              <div className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                                 {healthStats.ping.bunny !== -1 ? <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> : <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>}
                                 {healthStats.stats.bunnyCount} <span className="text-xs font-normal text-slate-400">vidéos</span>
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Bunny Stream</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-1">{healthStats.ping.bunny !== -1 ? `${healthStats.ping.bunny}ms ping` : 'Non configuré'}</div>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-3 text-center border-b-2 border-amber-500/50 relative overflow-hidden group">
                              <div className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                                 {healthStats.ping.cloudflare !== -1 ? <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> : <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>}
                                 {healthStats.stats.cloudflareCount} <span className="text-xs font-normal text-slate-400">vidéos</span>
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Cloudflare</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-1">{healthStats.ping.cloudflare !== -1 ? `${healthStats.ping.cloudflare}ms ping` : 'Non configuré'}</div>
                            </div>
                          </div>
                      ) : (
                          <div className="text-sm text-slate-500 text-center py-6 border border-dashed border-slate-700 rounded-xl">Chargement de la télémétrie...</div>
                      )}
                    </div>

                    <Toggle 
                        label="Flux Vidéo Réseau Actif" 
                        description={config.active_video_provider === 'cloudflare' ? "Réseau Actif : Cloudflare Stream (Recommandé pour l'adaptabilité)" : "Réseau Actif : Bunny Stream (Mode hors ligne pris en charge)"} 
                        checked={config.active_video_provider === 'cloudflare'} 
                        onChange={(v: boolean) => updateObj('active_video_provider', v ? 'cloudflare' : 'bunny')} 
                    />
                </div>
                <SelectInput label="Fournisseur CDN (Images & Fichiers)" value={config.cdn_provider} onChange={(v: string) => updateObj('cdn_provider', v)} options={[{l: 'Google Cloud Storage / Firebase', v: 'firebase'}]} />
                <TextInput type="number" label="Taille max des uploads (Mo)" value={config.max_video_size} onChange={(v: any) => updateObj('max_video_size', Number(v))} />
                <Toggle label="Optimisation automatique des images" checked={config.auto_image_optimization} onChange={(v: boolean) => updateObj('auto_image_optimization', v)} />
            </>
        );

        /* GROWTH */
        case 'ai': return (
            <>
                <Toggle label="Activer l'IA Pédagogique Mathias" description="Le tuteur virtuel intelligent" checked={config.enable_tutor} onChange={(v: boolean) => updateObj('enable_tutor', v)} />
                <Toggle label="Correction automatique des Quiz par l'IA" checked={config.auto_quiz_grading} onChange={(v: boolean) => updateObj('auto_quiz_grading', v)} />
                <SelectInput label="Modèle Cognitif" value={config.ai_model} onChange={(v: string) => updateObj('ai_model', v)} options={[{l: 'Gemini 1.5 Flash (Google)', v: 'gemini'}]} />
            </>
        );
        case 'notifications': return (
            <>
                <Toggle label="Envoi des Emails Transactionnels" checked={config.transactional_emails} onChange={(v: boolean) => updateObj('transactional_emails', v)} />
                <Toggle label="Cloud Messaging (Push Mobile)" checked={config.cloud_messaging} onChange={(v: boolean) => updateObj('cloud_messaging', v)} />
                <Toggle label="Intégration WhatsApp Business API" checked={config.whatsapp_api} onChange={(v: boolean) => updateObj('whatsapp_api', v)} />
            </>
        );
        case 'moderation': return (
            <>
                <Toggle label="Filtre profanité automatique" checked={config.profanity_filter} onChange={(v: boolean) => updateObj('profanity_filter', v)} />
                <Toggle label="Approbation manuelle des commentaires" checked={config.manual_comments_approval} onChange={(v: boolean) => updateObj('manual_comments_approval', v)} />
            </>
        );
        case 'cms': return (
            <>
                <Toggle label="Activer le Blog / Articles" checked={config.enable_blog} onChange={(v: boolean) => updateObj('enable_blog', v)} />
                <Toggle label="Afficher la FAQ publique" checked={config.public_faq} onChange={(v: boolean) => updateObj('public_faq', v)} />
            </>
        );
        case 'marketing': return (
            <>
                <Toggle label="Système de codes promotionnels" checked={config.promo_codes} onChange={(v: boolean) => updateObj('promo_codes', v)} />
                <Toggle label="Programme d'affiliation (Parrainage)" checked={config.affiliate_program} onChange={(v: boolean) => updateObj('affiliate_program', v)} />
                <TextInput type="number" label="Taux de retour Affilié (%)" value={config.affiliate_return_rate} onChange={(v: any) => updateObj('affiliate_return_rate', Number(v))} />
            </>
        );
        case 'analytics': return (
            <>
                <Toggle label="Télémétrie d'usage interne" checked={config.internal_telemetry} onChange={(v: boolean) => updateObj('internal_telemetry', v)} />
                <TextInput label="Google Analytics 4 Measurement ID" placeholder="G-XXXXXXXXXX" value={config.ga4_id} onChange={(v: string) => updateObj('ga4_id', v)} />
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

function Toggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-slate-900 border border-slate-800/60 shadow-sm">
       <div className="flex-1">
         <span className="text-xs font-black text-white uppercase tracking-tight block">{label}</span>
         {description && <span className="text-[10px] text-slate-500 mt-1 block font-medium leading-relaxed">{description}</span>}
       </div>
       <button 
         onClick={() => onChange(!checked)}
         className={clsx(
           "w-12 h-7 shrink-0 rounded-full p-1 transition-colors relative border",
           checked ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
         )}
       >
         <div className={clsx(
            "w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-5" : "translate-x-0"
         )} />
       </button>
    </div>
  );
}

function TextInput({ label, value = "", type = "text", placeholder = "", onChange }: any) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
         <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 bg-slate-900 border border-slate-800/60 rounded-2xl px-5 text-white text-sm font-medium focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-700 shadow-sm"
         />
      </div>
   )
}

function SelectInput({ label, value, options, onChange }: any) {
    return (
      <div className="space-y-2">
         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
         <div className="relative shadow-sm">
             <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-14 bg-slate-900 border border-slate-800/60 rounded-2xl px-5 text-white text-sm font-medium focus:outline-none focus:border-white/20 transition-colors appearance-none">
                 {options.map((opt:any) => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
             </select>
             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <ChevronDown className="w-4 h-4" />
             </div>
         </div>
      </div>
    )
}
}
