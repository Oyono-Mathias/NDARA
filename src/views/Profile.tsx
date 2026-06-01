import React, { useState, useEffect, useMemo } from 'react';
import { useRole } from '../context/RoleContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
    Settings, 
    ShieldCheck, 
    Code, 
    ChevronRight, 
    UserCircle, 
    Wallet, 
    Lock, 
    LifeBuoy, 
    Languages, 
    Moon, 
    LogOut,
    Check,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';

// Dummy implementation of I18N hooks for the purpose of the app
function useTranslations(key: string) {
    return (str: string) => {
        const trans: Record<string, string> = {
            'title': 'Profil',
            'ndara_term': 'Ndara',
            'certified': 'Certifié',
            'student': 'Étudiant',
            'stats.courses': 'Cours',
            'stats.diplomas': 'Diplômes',
            'stats.reviews': 'Avis',
            'preferences': 'Préférences',
            'identity_card': 'Carte d\'Identité Bio',
            'wallet': 'Portefeuille',
            'wallet_desc': 'Gérer vos finances',
            'security': 'Sécurité',
            'security_desc': 'Protéger votre compte',
            'support': 'Support technique',
            'support_desc': 'Besoin d\'aide ?',
            'language': 'Langue',
            'dark_mode': 'Mode sombre',
            'logout': 'Déconnexion',
            'logout_confirm': 'Se déconnecter',
            'logout_desc': 'Êtes-vous sûr de vouloir vous déconnecter ?',
            'cancel': 'Annuler',
            'confirm': 'Confirmer'
        };
        return trans[str] || str;
    };
}
function useLocale() { return 'fr'; }

const africanCountries = [
    { code: 'CM', emoji: '🇨🇲' },
    { code: 'ZA', emoji: '🇿🇦' },
    { code: 'CF', emoji: '🇨🇫' }
];

export function ProfileView() {
  const { currentUser, isUserLoading } = useRole();
  const t = useTranslations('Profile');
  const common = useTranslations('Common');
  const navigate = useNavigate();
  const location = useLocation();
  const locale = useLocale();
  const theme = 'dark';
  const setTheme = (t: string) => document.documentElement.classList.toggle('dark', t === 'dark');
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [counters, setCounters] = useState({ enrollments: 0, certificates: 0, reviews: 0 });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubEnroll = onSnapshot(query(collection(db, 'enrollments'), where('studentId', '==', currentUser.uid)), (snap) => {
        const total = snap.size;
        const certs = snap.docs.filter(d => d.data().progress === 100).length;
        setCounters(prev => ({ ...prev, enrollments: total, certificates: certs }));
    });

    const unsubReviews = onSnapshot(query(collection(db, 'course_reviews'), where('studentId', '==', currentUser.uid)), (snap) => {
        setCounters(prev => ({ ...prev, reviews: snap.size }));
    });

    return () => { unsubEnroll(); unsubReviews(); };
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
        await auth.signOut();
        navigate('/');
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoggingOut(false);
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLocale = e.target.value;
      if (newLocale === locale) return;
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const countryEmoji = useMemo(() => {
      if (!currentUser?.countryCode) return "🌍";
      const country = africanCountries.find(c => c.code === currentUser.countryCode);
      return country?.emoji || "🌍";
  }, [currentUser?.countryCode]);

  const currentFlag = useMemo(() => {
      if (locale === 'fr') return "🇨🇲";
      if (locale === 'en') return "🇿🇦";
      return "🇨🇫";
  }, [locale]);

  if (isUserLoading || !currentUser) {
    return (
        <div className="h-screen flex items-center justify-center bg-[#0f172a]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  const user = currentUser;

  return (
    <div className="flex flex-col gap-0 pb-32 bg-[#0f172a] min-h-screen relative">
      <div className="grain-overlay" />
      
      <header className="fixed top-0 w-full max-w-md z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/5 safe-area-pt">
        <div className="flex items-center justify-between px-6 py-4">
            <h1 className="font-black text-xl text-white uppercase tracking-tight">{t('title')}</h1>
            <button className="rounded-full bg-slate-900 text-slate-400 p-2" onClick={() => navigate('/student/account')}>
                <Settings className="h-5 w-5" />
            </button>
        </div>
      </header>

      <main className="flex-1 px-6 pt-24 space-y-8 animate-in fade-in duration-700">
        
        {/* --- USER HEADER --- */}
        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="p-8 text-center flex flex-col items-center relative z-10">
                <div className="relative mb-4">
                    <div className="p-[3px] rounded-full bg-gradient-to-tr from-primary via-blue-500 to-purple-500">
                        <div className="h-24 w-24 border-4 border-slate-900 shadow-2xl rounded-full overflow-hidden bg-slate-800 flex justify-center items-center">
                            {user.profilePictureURL ? (
                                <img src={user.profilePictureURL} className="object-cover w-full h-full" alt="Profile" />
                            ) : (
                                <span className="text-3xl font-black text-slate-500 uppercase">{user.fullName?.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                        <Check className="text-slate-950 h-3 w-3 stroke-[4px]" />
                    </div>
                </div>

                <h2 className="font-black text-2xl text-white uppercase tracking-tight leading-none mb-1">
                    {user.fullName}
                </h2>
                <p className="text-amber-500 font-bold text-sm tracking-widest mb-4">@{user.username}</p>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 shadow-inner">
                    <span className="text-lg">{countryEmoji}</span>
                    <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
                        {user.countryName || common('ndara_term')}
                    </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center bg-amber-500/20 text-amber-500 border border-primary/30 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3 mr-1.5" /> {common('certified')}
                    </span>
                    <span className="inline-flex items-center bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                        <Code className="h-3 w-3 mr-1.5" /> {common('student')}
                    </span>
                </div>
            </div>
        </div>

        {/* --- WALLET SHORTCUT --- */}
        <Link to="/student/wallet" className="block active:scale-[0.98] transition-all">
            <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Solde {common('ndara_term')}</p>
                        <p className="text-2xl font-black text-white">{(user.balance || 0).toLocaleString()} <span className="text-xs">XOF</span></p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-amber-500 transition-colors">
                    <ArrowUpRight size={20} />
                </div>
            </div>
        </Link>

        {/* --- DYNAMIC STATS --- */}
        <section className="grid grid-cols-3 gap-3">
            <StatBox label={t('stats.courses')} value={counters.enrollments.toString()} color="text-amber-500" />
            <StatBox label={t('stats.diplomas')} value={counters.certificates.toString()} color="text-orange-400" />
            <StatBox label={t('stats.reviews')} value={counters.reviews.toString()} color="text-blue-400" />
        </section>

        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{t('preferences')}</h3>
            </div>
            
            <div className="divide-y divide-white/5">
                <MenuLink 
                    icon={UserCircle} 
                    label={t('identity_card')} 
                    desc="Modifier votre profil" 
                    color="bg-blue-500/10 text-blue-400"
                    href="/student/account"
                />
                <MenuLink 
                    icon={Wallet} 
                    label={t('wallet')} 
                    desc={t('wallet_desc')} 
                    color="bg-emerald-500/10 text-emerald-400"
                    href="/student/wallet"
                />
                <MenuLink 
                    icon={Lock} 
                    label={t('security')} 
                    desc={t('security_desc')} 
                    color="bg-red-500/10 text-red-400"
                    href="/student/account"
                />
                <MenuLink 
                    icon={LifeBuoy} 
                    label={t('support')} 
                    desc={t('support_desc')} 
                    color="bg-purple-500/10 text-purple-400"
                    href="/student/support"
                />
            </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <Languages className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-white text-sm uppercase tracking-tight">{t('language')}</span>
                    </div>
                    <select value={locale} onChange={handleLanguageChange} className="bg-slate-950 border border-white/10 rounded-full h-12 px-4 text-xs font-black uppercase tracking-widest text-amber-500 min-w-[120px] focus:outline-none">
                        <option value="fr">🇨🇲 Français</option>
                        <option value="en">🇿🇦 English</option>
                        <option value="sg">🇨🇫 Sango</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <Moon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-white text-sm uppercase tracking-tight">{t('dark_mode')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                </div>
            </div>
        </div>

        <button 
            onClick={() => setShowLogoutAlert(true)}
            className="w-full h-16 rounded-[2rem] bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-black flex items-center justify-center justify-center uppercase text-xs tracking-[0.2em] shadow-2xl shadow-red-500/20 active:scale-[0.98] transition-all gap-2 mb-12"
        >
            <LogOut className="h-5 w-5" />
            {t('logout')}
        </button>

        {showLogoutAlert && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-[90%] sm:max-w-md mx-auto w-full text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                        <LogOut size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-4">{t('logout_confirm')}</h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8">
                        {t('logout_desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => setShowLogoutAlert(false)} 
                            className="bg-slate-950 border border-white/10 hover:bg-slate-800 text-white rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest flex-1 transition"
                        >
                            {t('cancel')}
                        </button>
                        <button 
                            onClick={handleLogout} 
                            disabled={isLoggingOut}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest flex-1 flex items-center justify-center shadow-lg shadow-red-600/20 transition"
                        >
                            {isLoggingOut ? <Loader2 className="animate-spin w-5 h-5" /> : t('confirm')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="pb-12 text-center">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Ndara Afrique v2.5 • Fintech Education</p>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-4 text-center shadow-xl active:scale-95 transition-transform">
            <p className={cn("text-2xl font-black leading-none mb-2", color)}>{value}</p>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function MenuLink({ icon: Icon, label, desc, color, href }: { icon: any, label: string, desc: string, color: string, href: string }) {
    return (
        <Link to={href} className="flex items-center justify-between p-5 hover:bg-white/5 active:scale-[0.98] transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" , color)}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="font-black text-white text-sm uppercase tracking-tight leading-none mb-1 group-hover:text-amber-500 transition-colors">{label}</p>
                    <p className="text-slate-500 text-[10px] font-medium">{desc}</p>
                </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}
