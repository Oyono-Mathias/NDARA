import React from "react";
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TouchArea } from '../../components/ui/TouchArea';
import { profileService } from '../../services/profile/profileService';
import { ArrowLeft, UserCircle, Loader2, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

export function EditProfileView() {
  const { appUser, firebaseUser, reloadUser } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(appUser?.displayName || '');
  const [firstName, setFirstName] = useState(appUser?.firstName || '');
  const [lastName, setLastName] = useState(appUser?.lastName || '');
  const [username, setUsername] = useState(appUser?.username || '');
  const [dateOfBirth, setDateOfBirth] = useState(appUser?.dateOfBirth || '');
  const [gender, setGender] = useState(appUser?.gender || '');
  const [country, setCountry] = useState(appUser?.country || '');
  const [city, setCity] = useState(appUser?.city || '');
  const [phone, setPhone] = useState(appUser?.phone || '');
  const [bio, setBio] = useState(appUser?.bio || '');
  const [profession, setProfession] = useState(appUser?.profession || '');
  const [educationLevel, setEducationLevel] = useState(appUser?.educationLevel || '');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!appUser || !firebaseUser) return null;

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await profileService.uploadProfilePicture(file, firebaseUser.uid, (progress) => {
        setUploadProgress(progress);
      });
      await reloadUser();
    } catch (err: any) {
      setError('Erreur lors du téléchargement de l\'image.');
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await profileService.updateProfileInfo(firebaseUser.uid, {
        displayName,
        firstName,
        lastName,
        username,
        dateOfBirth,
        gender: gender as any,
        country,
        city,
        phone,
        bio,
        profession,
        educationLevel
      });
      await reloadUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde des modifications.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-24">
      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <TouchArea as="button" onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-4">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </TouchArea>
            <h1 className="text-lg font-black uppercase tracking-widest text-white">Modifier Profil</h1>
          </div>
          <TouchArea 
            as="button" 
            onClick={handleSubmit} 
            disabled={isSaving || isUploading}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </TouchArea>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-8">
        
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center pt-4">
          <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
            {appUser.photoURL ? (
              <img src={appUser.photoURL} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-xl" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-900 shadow-xl text-slate-400">
                <UserCircle className="w-12 h-12" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] font-bold uppercase text-white">Modifier</span>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/80 rounded-full flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-1" />
                <span className="text-[10px] font-bold text-emerald-500">{Math.round(uploadProgress)}%</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">Appuyez pour changer de photo</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-300">Profil mis à jour avec succès.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Informations Générales</h3>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom d'affichage</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Prénom</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pseudo</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Date de naissance</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sexe</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 appearance-none">
                <option value="">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
                <option value="prefer_not_to_say">Préfère ne pas dire</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Contact & Localisation</h3>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pays</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ville</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Professionnel</h3>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Profession</label>
              <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Niveau d'étude</label>
              <input type="text" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none" />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
