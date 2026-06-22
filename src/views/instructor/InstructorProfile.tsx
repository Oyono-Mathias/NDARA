import React, { useState, useEffect } from "react";
import { useRole } from "../../context/RoleContext";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2, ArrowLeft, Twitter, Linkedin, Youtube, Instagram, Globe, Check, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InstructorProfile() {
    const { currentUser, loading: roleLoading } = useRole();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);

    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [bio, setBio] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [language, setLanguage] = useState("fr");

    const [socials, setSocials] = useState({
        website: "",
        twitter: "",
        linkedin: "",
        youtube: "",
        instagram: "",
        tiktok: ""
    });

    const [stats, setStats] = useState({
        courses: 0,
        students: 0,
        rating: 0
    });

    const [previewDevice, setPreviewDevice] = useState<'desktop'|'mobile'>('desktop');
    const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

    useEffect(() => {
        if (!roleLoading && currentUser) {
            loadProfile();
        }
    }, [roleLoading, currentUser]);

    const loadProfile = async () => {
        if (!currentUser) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setName(data.displayName || data.name || "");
                setTitle(data.professionalTitle || "");
                setBio(data.bio || "");
                setTags(data.expertiseTags || []);
                setLanguage(data.teachingLanguage || "fr");
                setSocials({
                    website: data.socials?.website || "",
                    twitter: data.socials?.twitter || "",
                    linkedin: data.socials?.linkedin || "",
                    youtube: data.socials?.youtube || "",
                    instagram: data.socials?.instagram || "",
                    tiktok: data.socials?.tiktok || ""
                });
                setStats({
                    courses: data.stats?.courses || 0,
                    students: data.stats?.students || 0,
                    rating: data.stats?.rating || 0,
                    followers: 0
                });
                
                // Fetch followers separately since it's a subcollection or separate collection
                import("firebase/firestore").then(({ collection, query, where, getDocs }) => {
                    const qFollowers = query(collection(db, 'user_follows'), where('instructorId', '==', currentUser.uid));
                    getDocs(qFollowers).then(snap => {
                        setStats(prev => ({ ...prev, followers: snap.size }));
                    }).catch(err => console.error("Error fetching followers:", err));
                });
            }
        } catch (error) {
            console.error(error);
            showToast("Erreur lors du chargement", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        if (!name || !title || !bio) {
            showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        if (bio.length < 50) {
            showToast('La biographie doit contenir au moins 50 caractères', 'error');
            return;
        }

        setIsSaving(true);
        try {
            if (!currentUser) return;
            const docRef = doc(db, 'users', currentUser.uid);
            await updateDoc(docRef, {
                displayName: name,
                professionalTitle: title,
                bio: bio,
                expertiseTags: tags,
                teachingLanguage: language,
                socials: socials
            });
            showToast('Profil enregistré avec succès !', 'success');
        } catch (e: any) {
            console.error(e);
            showToast('Erreur lors de la sauvegarde: ' + e.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTag = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (e) e.preventDefault();
        
        const val = tagInput.trim();
        if (val && !tags.includes(val)) {
            setTags([...tags, val]);
        }
        setTagInput("");
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    if (isLoading || roleLoading) {
        return <div className="h-screen bg-[#0B0F19] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
    }

    const initals = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#0B0F19] text-[#F8FAFC] font-sans antialiased">
            <style>{`
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: #111827; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
                .preview-badge { animation: pulse-ring 2s infinite; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
            `}</style>
            
            {/* Top Bar */}
            <header className="flex-shrink-0 bg-[#0B0F19] border-b border-[#334155] z-30">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/instructor/dashboard')} className="p-1.5 rounded-lg hover:bg-[#1E293B] transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-white">Modifier le Profil</h1>
                            <p className="text-[10px] text-gray-500">Instructeur • {name || 'Sans nom'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 preview-badge"></div>
                            <span className="text-[10px] text-emerald-400 font-semibold">Aperçu en direct</span>
                        </div>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <span className="mr-1">💾</span>}
                            Enregistrer
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Tabs */}
            <div className="lg:hidden flex border-b border-[#334155] bg-[#0B0F19] shrink-0">
                <button 
                    onClick={() => setMobileTab('edit')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobileTab === 'edit' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Informations
                </button>
                <button 
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobileTab === 'preview' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Aperçu Public
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                
                {/* LEFT: Edit Form */}
                <div className={`${mobileTab === 'preview' ? 'hidden lg:block' : 'block'} w-full lg:w-[420px] flex-shrink-0 bg-[#111827] border-r border-[#334155] overflow-y-auto`}>
                    <div className="p-4 space-y-5">
                        
                        {/* Profile Photo */}
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-xl font-bold mx-auto shadow-lg">
                                    {initals}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#111827]">
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                            </div>
                            <button className="mt-2 text-xs text-emerald-400 hover:underline block w-full">Changer la photo</button>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nom complet *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} 
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Titre professionnel *</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-500"
                                placeholder="Ex: Expert Marketing Digital" />
                            <p className="text-[10px] text-gray-500 mt-1">Apparaît sous votre nom sur votre page publique</p>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Biographie publique *</label>
                            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                placeholder="Décrivez votre expérience, vos compétences..." />
                            <div className="flex items-center justify-between mt-1.5">
                                <p className="text-[10px] text-gray-500">Minimum 50 caractères</p>
                                <p className={`text-[10px] ${bio.length > 500 ? 'text-red-400' : 'text-gray-500'}`}>{bio.length} / 500</p>
                            </div>
                        </div>

                        {/* Expertise Tags */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Domaines d'expertise</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg flex items-center gap-1.5 border border-emerald-500/20">
                                        {tag} <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                                    </span>
                                ))}
                            </div>
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Ajouter un domaine (Entrée)" 
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-500" />
                        </div>

                        {/* Stats Display */}
                        <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                            <h3 className="text-xs font-semibold text-gray-300 mb-3">📊 Statistiques (automatiques)</h3>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-400">{stats.courses}</div>
                                    <div className="text-[10px] text-gray-500">Cours</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-400">{stats.students}</div>
                                    <div className="text-[10px] text-gray-500">Étudiants</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-orange-400">{stats.rating.toFixed(1)}</div>
                                    <div className="text-[10px] text-gray-500">Note ⭐</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-pink-400">{stats.followers || 0}</div>
                                    <div className="text-[10px] text-gray-500">Abonnés</div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-300 mb-3">🔗 Liens Réseaux Sociaux</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <input type="url" value={socials.website} onChange={e => setSocials({...socials, website: e.target.value})} 
                                        className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"
                                        placeholder="https://votre-site.com" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center flex-shrink-0">
                                        <Twitter className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input type="url" value={socials.twitter} onChange={e => setSocials({...socials, twitter: e.target.value})} 
                                        className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"
                                        placeholder="https://x.com/votreprofil" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                                        <Linkedin className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <input type="url" value={socials.linkedin} onChange={e => setSocials({...socials, linkedin: e.target.value})} 
                                        className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"
                                        placeholder="https://linkedin.com/in/votreprofil" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <Youtube className="w-4 h-4 text-red-500" />
                                    </div>
                                    <input type="url" value={socials.youtube} onChange={e => setSocials({...socials, youtube: e.target.value})} 
                                        className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"
                                        placeholder="https://youtube.com/@votrechannel" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                                        <Instagram className="w-4 h-4 text-pink-500" />
                                    </div>
                                    <input type="url" value={socials.instagram} onChange={e => setSocials({...socials, instagram: e.target.value})} 
                                        className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"
                                        placeholder="https://instagram.com/votreprofil" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-700/10 flex items-center justify-center flex-shrink-0">
                                        <span className="w-4 h-4 text-white font-bold text-[10px] text-center mb-1">Tik<br/>Tok</span>
                                    </div>
                                    <input type="url" value={socials.tiktok} onChange={e => setSocials({...socials, tiktok: e.target.value})} 
                                        className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"
                                        placeholder="https://tiktok.com/@votreprofil" />
                                </div>
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Langue d'enseignement</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                                <option value="fr">🇫🇷 Français</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="both">Français & English</option>
                            </select>
                        </div>
                        <div className="pb-10"></div>
                    </div>
                </div>

                {/* RIGHT: Live Preview */}
                <div className={`${mobileTab === 'edit' ? 'hidden lg:block' : 'block'} flex-1 bg-[#0B0F19] overflow-y-auto p-4 lg:p-8`}>
                    <div className="max-w-2xl mx-auto">
                        
                        <div className="flex items-center justify-between mb-4 mt-8 lg:mt-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-bold text-white">Aperçu de la page publique</h2>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/20">LIVE</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-[#1E293B] text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:bg-[#1E293B]'}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                </button>
                                <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-[#1E293B] text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:bg-[#1E293B]'}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                </button>
                            </div>
                        </div>

                        <div className={`transition-all duration-300 bg-[#111827] border border-[#334155] rounded-2xl overflow-hidden shadow-2xl ${previewDevice === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'}`}>
                            
                            <div className="h-24 sm:h-32 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>
                            </div>

                            <div className="px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-[#111827] shadow-xl text-white">
                                            {initals}
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <h1 className="text-lg sm:text-xl font-bold text-white">{name || 'Votre Nom'}</h1>
                                        <p className={`text-sm font-medium ${title ? 'text-emerald-400' : 'text-gray-500'}`}>{title || 'Titre professionnel'}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                Instructor
                                            </span>
                                            <span className="text-[10px] text-gray-400">{language === 'fr' ? '🇫🇷 Français' : language === 'en' ? '🇬🇧 English' : '🇫🇷 & 🇬🇧'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pb-1">
                                        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                                            Voir les cours
                                        </button>
                                        <button className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-medium rounded-xl border border-[#334155] transition-colors">
                                            Contacter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 mt-4 pb-4 border-b border-[#334155]">
                                <div className="flex items-center justify-around">
                                    <div className="text-center">
                                        <div className="text-base sm:text-lg font-bold text-white">{stats.followers || 0}</div>
                                        <div className="text-[10px] text-gray-500">Abonnés</div>
                                    </div>
                                    <div className="w-px h-8 bg-[#334155]"></div>
                                    <div className="text-center">
                                        <div className="text-base sm:text-lg font-bold text-white">{stats.courses}</div>
                                        <div className="text-[10px] text-gray-500">Cours</div>
                                    </div>
                                    <div className="w-px h-8 bg-[#334155]"></div>
                                    <div className="text-center">
                                        <div className="text-base sm:text-lg font-bold text-white">{stats.students}</div>
                                        <div className="text-[10px] text-gray-500">Étudiants</div>
                                    </div>
                                    <div className="w-px h-8 bg-[#334155]"></div>
                                    <div className="text-center">
                                        <div className="text-base sm:text-lg font-bold text-orange-400">{stats.rating.toFixed(1)} ⭐</div>
                                        <div className="text-[10px] text-gray-500">Note moyenne</div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 py-5 border-b border-[#334155]">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">À propos</h3>
                                <p className={`text-sm leading-relaxed whitespace-pre-line ${bio ? 'text-gray-300' : 'text-gray-600 italic'}`}>
                                    {bio || 'Aucune biographie renseignée'}
                                </p>
                            </div>

                            <div className="px-4 sm:px-6 py-5 border-b border-[#334155]">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Domaines d'expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.length > 0 ? tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg border border-emerald-500/20 font-medium">
                                            {tag}
                                        </span>
                                    )) : (
                                        <p className="text-xs text-gray-600 italic">Aucun domaine renseigné</p>
                                    )}
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 py-5">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Réseaux sociaux</h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {socials.website && (
                                        <a href={socials.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all hover:scale-110">
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socials.twitter && (
                                        <a href={socials.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 flex items-center justify-center transition-all hover:scale-110">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socials.linkedin && (
                                        <a href={socials.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 flex items-center justify-center transition-all hover:scale-110">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socials.youtube && (
                                        <a href={socials.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all hover:scale-110">
                                            <Youtube className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socials.instagram && (
                                        <a href={socials.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 flex items-center justify-center transition-all hover:scale-110">
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socials.tiktok && (
                                        <a href={socials.tiktok} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-700/10 text-white hover:bg-gray-700/20 flex items-center justify-center transition-all hover:scale-110">
                                            <span className="text-[10px] font-bold">Tk</span>
                                        </a>
                                    )}
                                    {!Object.values(socials).some(Boolean) && (
                                        <p className="text-xs text-gray-600 italic">Aucun réseau social renseigné</p>
                                    )}
                                </div>
                            </div>

                        </div>
                        <div className="pb-24 lg:pb-10"></div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border bg-[#1E293B] ${
                    toast.type === 'success' ? 'border-emerald-500/30 text-emerald-400' :
                    toast.type === 'error' ? 'border-red-500/30 text-red-400' :
                    'border-blue-500/30 text-blue-400'
                }`}>
                    <span className="text-lg">
                        {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    <span className="text-sm font-medium text-white">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
