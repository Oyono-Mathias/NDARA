import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TouchArea } from '../../components/ui/TouchArea';
import { profileService } from '../../services/profile/profileService';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { 
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Mail, Lock, 
  Bell, Globe, Moon, Eye, Trash2 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AccountSettingsView() {
  const { appUser, firebaseUser, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'light'|'dark'|'system'>(appUser?.preferences?.theme || 'dark');
  const [language, setLanguage] = useState(appUser?.language || 'fr');
  const [emailNotifs, setEmailNotifs] = useState(appUser?.preferences?.emailNotifications ?? true);
  const [pushNotifs, setPushNotifs] = useState(appUser?.preferences?.pushNotifications ?? true);
  const [profileVis, setProfileVis] = useState(appUser?.preferences?.profileVisibility ?? true);

  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  // Security States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [securityActionLoading, setSecurityActionLoading] = useState(false);
  const [securityError, setSecurityError] = useState<string|null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string|null>(null);

  // Forms
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  if (!appUser || !firebaseUser) return null;

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      await profileService.updatePreferences(firebaseUser.uid, {
        theme,
        emailNotifications: emailNotifs,
        pushNotifications: pushNotifs,
        profileVisibility: profileVis
      });
      await profileService.updateProfileInfo(firebaseUser.uid, { language });
      await reloadUser();
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const reauthenticate = async () => {
    if (!currentPassword) throw new Error("auth/wrong-password");
    await profileService.reauthenticate(currentPassword);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);
    setSecurityActionLoading(true);
    try {
      await reauthenticate();
      await profileService.changePassword(newPassword);
      setSecuritySuccess('Mot de passe mis à jour avec succès.');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setSecurityError(getFirebaseErrorMessage(err));
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);
    setSecurityActionLoading(true);
    try {
      await reauthenticate();
      await profileService.changeEmail(newEmail);
      setSecuritySuccess('Un email de vérification a été envoyé à la nouvelle adresse.');
      setShowEmailChange(false);
      setCurrentPassword('');
      setNewEmail('');
    } catch (err: any) {
      setSecurityError(getFirebaseErrorMessage(err));
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SUPPRIMER') {
      setSecurityError('Veuillez taper SUPPRIMER pour confirmer.');
      return;
    }
    setSecurityError(null);
    setSecurityActionLoading(true);
    try {
      await reauthenticate();
      await profileService.deleteAccount(firebaseUser.uid);
      navigate('/auth/login');
    } catch (err: any) {
      setSecurityError(getFirebaseErrorMessage(err));
      setSecurityActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-24">
      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center h-16 px-4">
          <TouchArea as="button" onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-4">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </TouchArea>
          <h1 className="text-lg font-black uppercase tracking-widest text-white">Paramètres</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-8 mt-4">
        
        {/* Preferences Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Préférences</h2>
            <TouchArea 
              as="button" onClick={handleSavePreferences} disabled={isSavingPrefs}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingPrefs ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sauvegarder'}
            </TouchArea>
          </div>

          {prefsSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300">Préférences enregistrées.</p>
            </div>
          )}

          <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-bold">Langue</span>
              </div>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-bold">Thème</span>
              </div>
              <select value={theme} onChange={e => setTheme(e.target.value as any)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none">
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="system">Système</option>
              </select>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-bold leading-none mb-1">Email Notifications</p>
                  <p className="text-[10px] text-slate-500">Mises à jour et alertes</p>
                </div>
              </div>
              <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-bold leading-none mb-1">Push Notifications</p>
                  <p className="text-[10px] text-slate-500">Alertes temps réel</p>
                </div>
              </div>
              <Toggle checked={pushNotifs} onChange={setPushNotifs} />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-bold leading-none mb-1">Profil Public</p>
                  <p className="text-[10px] text-slate-500">Visible par la communauté</p>
                </div>
              </div>
              <Toggle checked={profileVis} onChange={setProfileVis} />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-4 pt-4" id="security">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Sécurité</h2>
          
          {securitySuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-300">{securitySuccess}</p>
            </div>
          )}
          {securityError && !showPasswordChange && !showEmailChange && !showDeleteConfirm && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-300">{securityError}</p>
            </div>
          )}

          <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden divide-y divide-white/5">
            <TouchArea as="button" onClick={() => setShowEmailChange(true)} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none mb-1">Modifier l'email</p>
                  <p className="text-slate-500 text-[10px] font-medium">{firebaseUser.email}</p>
                </div>
              </div>
            </TouchArea>

            <TouchArea as="button" onClick={() => setShowPasswordChange(true)} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none mb-1">Mot de passe</p>
                  <p className="text-slate-500 text-[10px] font-medium">Changer votre mot de passe</p>
                </div>
              </div>
            </TouchArea>

            <TouchArea as="button" onClick={() => setShowDeleteConfirm(true)} className="w-full p-4 flex items-center justify-between hover:bg-rose-500/10 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold text-rose-500 text-sm leading-none mb-1">Supprimer le compte</p>
                  <p className="text-rose-500/60 text-[10px] font-medium">Action irréversible</p>
                </div>
              </div>
            </TouchArea>
          </div>
        </section>

        {/* Change Password Modal */}
        <BottomSheet isOpen={showPasswordChange} onClose={() => { setShowPasswordChange(false); setSecurityError(null); }}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Modifier le mot de passe</h3>
            {securityError && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl">{securityError}</p>}
            <input type="password" placeholder="Mot de passe actuel" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50" />
            <input type="password" placeholder="Nouveau mot de passe" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50" />
            <button type="submit" disabled={securityActionLoading} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex justify-center items-center">
              {securityActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer'}
            </button>
          </form>
        </BottomSheet>

        {/* Change Email Modal */}
        <BottomSheet isOpen={showEmailChange} onClose={() => { setShowEmailChange(false); setSecurityError(null); }}>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Modifier l'email</h3>
            {securityError && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl">{securityError}</p>}
            <input type="password" placeholder="Mot de passe actuel" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            <input type="email" placeholder="Nouvelle adresse email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            <button type="submit" disabled={securityActionLoading} className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl flex justify-center items-center">
              {securityActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer'}
            </button>
          </form>
        </BottomSheet>

        {/* Delete Account Modal */}
        <BottomSheet isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSecurityError(null); }}>
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Supprimer le compte</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">Cette action est irréversible. Toutes vos données seront perdues.</p>
            {securityError && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl text-left">{securityError}</p>}
            
            <input type="password" placeholder="Mot de passe actuel" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-rose-500/50 text-left" />
            
            <input type="text" placeholder="Tapez SUPPRIMER pour confirmer" required value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-rose-500/50 text-center uppercase" />
            
            <button onClick={handleDeleteAccount} disabled={securityActionLoading} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex justify-center items-center mt-2">
              {securityActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Supprimer définitivement'}
            </button>
          </div>
        </BottomSheet>

      </main>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <TouchArea 
      as="button" 
      onClick={() => onChange(!checked)}
      className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", checked ? "bg-emerald-500" : "bg-slate-700")}
    >
      <div className={cn("absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300", checked ? "translate-x-6" : "translate-x-0")} />
    </TouchArea>
  );
}
