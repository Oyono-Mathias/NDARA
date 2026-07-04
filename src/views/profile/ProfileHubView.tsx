import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TouchArea } from '../../components/ui/TouchArea';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { useState } from 'react';
import { 
  UserCircle, Settings, ShieldCheck, Languages, Moon, LogOut, ChevronRight, Loader2, ArrowLeft 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { authService } from '../../services/authService';

export function ProfileHubView() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      navigate('/auth/login');
    } catch (e) {
      console.error(e);
      setIsLoggingOut(false);
    }
  };

  if (!appUser) return null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-24">
      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center h-16 px-4">
          <TouchArea as="button" onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-4">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </TouchArea>
          <h1 className="text-lg font-black uppercase tracking-widest text-white">Mon Profil</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center pt-4">
          <div className="relative">
            {appUser.photoURL ? (
              <img src={appUser.photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[#0B0F19] shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-[#0B0F19] shadow-xl text-slate-400">
                <UserCircle className="w-12 h-12" />
              </div>
            )}
            <div className="absolute -bottom-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg left-1/2 -translate-x-1/2 whitespace-nowrap">
              {appUser.role === 'student' ? 'Étudiant' : appUser.role}
            </div>
          </div>
          <h2 className="text-xl font-bold mt-5 text-white">{appUser.displayName}</h2>
          <p className="text-sm text-slate-400">{appUser.email}</p>
        </div>

        <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden shadow-xl mt-6">
          <div className="px-5 py-4 border-b border-white/5 bg-white/5">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Compte</h3>
          </div>
          <div className="divide-y divide-white/5">
            <MenuLink 
              icon={UserCircle} label="Informations personnelles" desc="Modifier votre profil"
              color="bg-emerald-500/10 text-emerald-500" href="/student/profile/edit"
            />
            <MenuLink 
              icon={Settings} label="Préférences" desc="Langue, thème, notifications"
              color="bg-amber-500/10 text-amber-500" href="/student/profile/settings"
            />
            <MenuLink 
              icon={ShieldCheck} label="Sécurité" desc="Mot de passe et confidentialité"
              color="bg-blue-500/10 text-blue-500" href="/student/profile/settings#security"
            />
          </div>
        </div>

        <TouchArea 
          as="button" onClick={() => setShowLogoutAlert(true)}
          className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center uppercase text-xs tracking-widest active:scale-[0.98] transition-all gap-2 mt-8"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </TouchArea>

        <BottomSheet isOpen={showLogoutAlert} onClose={() => setShowLogoutAlert(false)}>
          <div className="text-center w-full">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4 border border-red-500/20">
              <LogOut className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Déconnexion</h2>
            <p className="text-slate-400 text-sm mb-6">Êtes-vous sûr de vouloir vous déconnecter de votre compte NDARA ?</p>
            <div className="flex flex-col gap-3">
              <TouchArea as="button" onClick={handleLogout} disabled={isLoggingOut} className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center">
                {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Oui, me déconnecter'}
              </TouchArea>
              <TouchArea as="button" onClick={() => setShowLogoutAlert(false)} className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center">
                Annuler
              </TouchArea>
            </div>
          </div>
        </BottomSheet>
      </main>
    </div>
  );
}

function MenuLink({ icon: Icon, label, desc, color, href }: { icon: any, label: string, desc: string, color: string, href: string }) {
  return (
    <Link to={href} className="block w-full focus:outline-none">
      <TouchArea className="flex items-center justify-between p-4 hover:bg-white/5 active:bg-white/10 transition-colors w-full group">
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm leading-tight mb-1">{label}</p>
            <p className="text-slate-500 text-xs font-medium">{desc}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
      </TouchArea>
    </Link>
  );
}
