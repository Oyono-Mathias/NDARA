const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ModerationLogsService } from "../../services/db";
import { useRole } from "../../context/RoleContext";
import { toast } from "../../hooks/use-toast";

const subcategoriesData: Record<string, string[]> = {
    business: ['Entrepreneuriat', 'Gestion de projet', 'Leadership', 'Finance personnelle', 'Comptabilité'],
    tech: ['Développement Web', 'Applications Mobiles', 'Intelligence Artificielle', 'Cybersécurité', 'Cloud Computing'],
    marketing: ['Marketing Digital', 'SEO & Référencement', 'Réseaux Sociaux', 'Email Marketing', 'Publicité en ligne'],
    finance: ['Trading Forex', 'Crypto-monnaies', 'Bourse', 'Analyse technique', 'Gestion de portefeuille'],
    design: ['UI/UX Design', 'Graphisme', 'Motion Design', 'Design 3D', 'Photographie'],
    agriculture: ['Agriculture moderne', 'Élevage', 'Transformation agroalimentaire', 'Irrigation', 'Bio']
};

export function InstructorCourseCreate() {
    const navigate = useNavigate();
    const { currentUser } = useRole();

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [objectives, setObjectives] = useState<string[]>(['']);
    const [prerequisites, setPrerequisites] = useState<string[]>(['']);
    const [audiences, setAudiences] = useState<string[]>(['']);
    
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [difficulty, setDifficulty] = useState('intermediate');
    
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    
    const [isFree, setIsFree] = useState(false);
    const [price, setPrice] = useState<number | ''>('');
    const [promoPrice, setPromoPrice] = useState<number | ''>('');
    
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-save simulation
    useEffect(() => {
        const interval = setInterval(() => setLastSaved(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-slug
    useEffect(() => {
        if (!slugTouched && title) {
            setSlug(title.toLowerCase()
                .replace(/[àâä]/g, 'a')
                .replace(/[éèêë]/g, 'e')
                .replace(/[ïî]/g, 'i')
                .replace(/[ôö]/g, 'o')
                .replace(/[ùûü]/g, 'u')
                .replace(/[ç]/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, ''));
        }
    }, [title, slugTouched]);

    // Handlers for Arrays
    const handleArrayChange = (setter: any, array: string[], index: number, value: string) => {
        const newArr = [...array];
        newArr[index] = value;
        setter(newArr);
    };
    const addArrayItem = (setter: any, array: string[]) => setter([...array, '']);
    const removeArrayItem = (setter: any, array: string[], index: number) => {
        if (array.length > 1) setter(array.filter((_, i) => i !== index));
    };

    // Tags
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
                setTagInput('');
            }
        }
    };
    const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

    // Images
    const handleFile = (file: File) => {
        setCoverImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setCoverImageUrl(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    // AI Mock
    const generateWithAI = (field: 'title' | 'description') => {
        if (field === 'title') {
            const titles = ['Devenir un pro du Trading en 30 jours', 'Trading Forex : La méthode complète', 'Maîtrisez les marchés financiers', 'Crypto & Trading : Guide du débutant'];
            setTitle(titles[Math.floor(Math.random() * titles.length)]);
            toast({ title: '✨ Titre généré par IA !' });
        } else {
            setDescription(\`Apprenez le trading professionnel avec notre formation complète. Ce cours vous guidera pas à pas, des bases du trading aux stratégies avancées utilisées par les professionnels.\\n\\nCe que vous apprendrez :\\n• Les fondamentaux des marchés financiers\\n• L'analyse technique et fondamentale\\n• La gestion des risques et du capital\\n• Les stratégies de trading rentables\\n• La psychologie du trader professionnel\\n\\nQue vous soyez débutant ou intermédiaire, cette formation vous donnera les outils nécessaires pour réussir sur les marchés financiers.\`);
            toast({ title: '✨ Description générée par IA !' });
        }
    };

    // Form Submission
    const createDraft = async () => {
        if (!title.trim()) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez entrer un titre pour le cours' });
            return;
        }
        
        setIsSubmitting(true);
        try {
            let finalImageUrl = '';
            if (coverImage) {
                const { uploadToR2 } = await import("../../lib/r2Upload");
                finalImageUrl = await uploadToR2(coverImage, "course-covers");
            }

            const payload = {
                title: title.trim(),
                subtitle: subtitle.trim(),
                description: description.trim(),
                objectives: objectives.filter(o => o.trim() !== ''),
                prerequisites: prerequisites.filter(p => p.trim() !== ''),
                targetAudience: audiences.filter(a => a.trim() !== ''),
                category,
                subcategory,
                difficulty,
                tags,
                isFree,
                price: isFree ? 0 : Number(price || 0),
                promoPrice: promoPrice ? Number(promoPrice) : null,
                thumbnail: finalImageUrl,
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                instructorId: currentUser?.uid,
                status: "draft",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, "courses"), payload);
            
            if (currentUser) {
                await ModerationLogsService.create({
                    entityId: docRef.id,
                    entityType: 'course',
                    action: 'COURSE_CREATED',
                    actorId: currentUser.uid,
                    timestamp: Date.now()
                });
            }

            toast({ title: '✅ Brouillon créé avec succès !', description: 'Redirection vers l\\'éditeur de programme...' });
            setTimeout(() => {
                navigate(\`/instructor/courses/\${docRef.id}/edit\`);
            }, 1500);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de créer le brouillon' });
            setIsSubmitting(false);
        }
    };

    // Checklists & Computed
    const validObjectives = objectives.filter(o => o.trim()).length;
    const isDescValid = description.trim().length > 50;
    const isObjectivesValid = validObjectives >= 3;
    const isImageValid = !!coverImageUrl;
    const isPriceValid = isFree || (price && price > 0);
    const isCategoryValid = !!category;

    const CheckIcon = () => <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;

    return (
        <div className="pb-24 font-sans min-h-screen text-[#F8FAFC]">
            <style>{\`
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #0D1117; }
                ::-webkit-scrollbar-thumb { background: #30363D; border-radius: 2px; }
                
                .glass-card {
                    background: rgba(22, 27, 34, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(48, 54, 61, 0.5);
                }
                
                .input-field {
                    background: #0D1117;
                    border: 1px solid #30363D;
                    color: #F8FAFC;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: #10B981;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                    outline: none;
                }
                .input-field::placeholder { color: #6B7280; }
                
                .drop-zone {
                    background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(48,54,61,0.1) 10px, rgba(48,54,61,0.1) 20px);
                    border: 2px dashed #30363D;
                    transition: all 0.3s;
                }
                .drop-zone:hover, .drop-zone.dragover {
                    border-color: #10B981;
                    background: rgba(16, 185, 129, 0.05);
                }
                
                .toggle-checkbox:checked + .toggle-label { background-color: #10B981; }
                .toggle-checkbox:checked + .toggle-label .toggle-dot { transform: translateX(100%); }
                
                .tag-item { animation: fadeIn 0.2s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .objective-item, .prerequisite-item { animation: slideIn 0.2s ease-out; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                
                .step-active { background: #10B981; color: #fff; border-color: #10B981; }
                .step-completed { background: #10B981; color: #fff; border-color: #10B981; }
                .step-inactive { background: transparent; color: #6B7280; border-color: #30363D; }
                
                .ai-btn {
                    background: linear-gradient(135deg, #8B5CF6, #3B82F6);
                    transition: all 0.3s;
                }
                .ai-btn:hover {
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
                    transform: translateY(-1px);
                }
                
                .sticky-bottom {
                    position: sticky;
                    bottom: 0;
                    background: linear-gradient(to top, #06080F 80%, transparent);
                    padding-top: 20px;
                }
                
                textarea { resize: none; }
                
                .char-counter { transition: color 0.2s; }
                .char-counter.warning { color: #F59E0B; }
                .char-counter.error { color: #EF4444; }
            \`}</style>

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06080F]/95 backdrop-blur-xl border-b border-[#30363D]/50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#161B22] transition-colors">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-xs">N</div>
                                <span className="text-sm font-bold text-white">NDARA</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 hidden sm:inline">
                                {lastSaved ? \`Sauvegardé à \${lastSaved.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}\` : 'Brouillon'}
                            </span>
                            <button className="px-3 py-1.5 bg-[#161B22] border border-[#30363D] text-gray-300 text-xs rounded-lg hover:bg-[#1E2530] transition-colors">Sauvegarder</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Stepper Progress */}
            <div className="max-w-5xl mx-auto px-4 pt-20 pb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-white">NOUVELLE FORMATION</h1>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Définissez les informations générales pour commencer</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-active flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Infos</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-inactive flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Programme</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-inactive flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Médias</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-inactive flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                        <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Prix</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-inactive flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                        <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Publier</span>
                    </div>
                </div>

                {/* Main Form */}
                <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Left: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Course Title */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">TITRE DU COURS <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Devenir un pro du Trading" maxLength={80}
                                       className="input-field w-full px-4 py-3 rounded-xl text-sm sm:text-base" />
                                <button type="button" onClick={() => generateWithAI('title')} className="ai-btn absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1">
                                    ✨ IA
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-gray-500">Conseil : Soyez précis et accrocheur</span>
                                <span className={\`char-counter text-xs \${title.length > 72 ? 'error' : title.length > 60 ? 'warning' : 'text-gray-500'}\`}>{title.length}/80</span>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">SOUS-TITRE (ACCROCHE)</label>
                            <div className="relative">
                                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ex: La méthode complète pour maîtriser les marchés financiers en 30 jours" maxLength={120}
                                       className="input-field w-full px-4 py-3 rounded-xl text-sm" />
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-gray-500">Cette phrase apparaît sous le titre sur la marketplace</span>
                                <span className={\`char-counter text-xs \${subtitle.length > 108 ? 'error' : subtitle.length > 90 ? 'warning' : 'text-gray-500'}\`}>{subtitle.length}/120</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">DESCRIPTION <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détaillez le contenu et l'objectif de la formation..." maxLength={2000}
                                          className="input-field w-full px-4 py-3 rounded-xl text-sm"></textarea>
                                <button type="button" onClick={() => generateWithAI('description')} className="ai-btn absolute right-3 bottom-3 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1">
                                    ✨ Générer avec IA
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-gray-500">Décrivez ce que les étudiants vont apprendre</span>
                                <span className={\`char-counter text-xs \${description.length > 1800 ? 'error' : description.length > 1500 ? 'warning' : 'text-gray-500'}\`}>{description.length}/2000</span>
                            </div>
                        </div>

                        {/* Learning Objectives */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-semibold text-gray-300">OBJECTIFS D'APPRENTISSAGE <span className="text-red-400">*</span></label>
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Min. 3 objectifs</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">Les étudiants seront capables de...</p>
                            <div className="space-y-2 mb-3">
                                {objectives.map((obj, idx) => (
                                    <div key={idx} className="objective-item flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-emerald-400 text-xs">✓</span>
                                        </div>
                                        <input type="text" value={obj} onChange={(e) => handleArrayChange(setObjectives, objectives, idx, e.target.value)} placeholder="Ex: Analyser les graphiques boursiers" className="input-field flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm" />
                                        <button onClick={() => removeArrayItem(setObjectives, objectives, idx)} className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addArrayItem(setObjectives, objectives)} className="w-full py-2 border border-dashed border-[#30363D] rounded-lg text-xs text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                Ajouter un objectif
                            </button>
                        </div>

                        {/* Prerequisites */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-4">PRÉREQUIS</label>
                            <p className="text-xs text-gray-500 mb-3">Ce que les étudiants doivent avoir avant de commencer</p>
                            <div className="space-y-2 mb-3">
                                {prerequisites.map((req, idx) => (
                                    <div key={idx} className="prerequisite-item flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-orange-400 text-xs">!</span>
                                        </div>
                                        <input type="text" value={req} onChange={(e) => handleArrayChange(setPrerequisites, prerequisites, idx, e.target.value)} placeholder="Ex: Un ordinateur avec connexion internet" className="input-field flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm" />
                                        <button onClick={() => removeArrayItem(setPrerequisites, prerequisites, idx)} className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addArrayItem(setPrerequisites, prerequisites)} className="w-full py-2 border border-dashed border-[#30363D] rounded-lg text-xs text-gray-400 hover:text-orange-400 hover:border-orange-500/30 transition-colors flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                Ajouter un prérequis
                            </button>
                        </div>

                        {/* Target Audience */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-4">PUBLIC CIBLE</label>
                            <p className="text-xs text-gray-500 mb-3">À qui s'adresse ce cours ?</p>
                            <div className="space-y-2 mb-3">
                                {audiences.map((aud, idx) => (
                                    <div key={idx} className="objective-item flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-400 text-xs">👤</span>
                                        </div>
                                        <input type="text" value={aud} onChange={(e) => handleArrayChange(setAudiences, audiences, idx, e.target.value)} placeholder="Ex: Débutants en trading" className="input-field flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm" />
                                        <button onClick={() => removeArrayItem(setAudiences, audiences, idx)} className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addArrayItem(setAudiences, audiences)} className="w-full py-2 border border-dashed border-[#30363D] rounded-lg text-xs text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-colors flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                Ajouter un public cible
                            </button>
                        </div>

                        {/* Category & Level */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="glass-card rounded-2xl p-5">
                                <label className="block text-sm font-semibold text-gray-300 mb-2">CATÉGORIE <span className="text-red-400">*</span></label>
                                <select value={category} onChange={e => {setCategory(e.target.value); setSubcategory('');}} className="input-field w-full px-4 py-3 rounded-xl text-sm">
                                    <option value="">Sélectionner...</option>
                                    <option value="business">💼 Business & Entrepreneuriat</option>
                                    <option value="tech">💻 Technologie</option>
                                    <option value="marketing">📢 Marketing Digital</option>
                                    <option value="finance">💰 Finance & Trading</option>
                                    <option value="design">🎨 Design</option>
                                    <option value="agriculture">🌾 Agriculture</option>
                                </select>
                            </div>
                            <div className="glass-card rounded-2xl p-5">
                                <label className="block text-sm font-semibold text-gray-300 mb-2">SOUS-CATÉGORIE</label>
                                <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="input-field w-full px-4 py-3 rounded-xl text-sm">
                                    <option value="">Sélectionner...</option>
                                    {category && subcategoriesData[category]?.map(sub => (
                                        <option key={sub} value={sub.toLowerCase().replace(/\\s+/g, '-')}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Difficulty Level */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-3">NIVEAU DE DIFFICULTÉ <span className="text-red-400">*</span></label>
                            <div className="grid grid-cols-3 gap-3">
                                <label className="difficulty-option cursor-pointer">
                                    <input type="radio" name="difficulty" value="beginner" checked={difficulty === 'beginner'} onChange={() => setDifficulty('beginner')} className="hidden peer" />
                                    <div className="peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 border border-[#30363D] rounded-xl p-3 text-center transition-all">
                                        <span className="text-xl block mb-1">🌱</span>
                                        <span className="text-xs font-semibold text-gray-300 peer-checked:text-emerald-400">Débutant</span>
                                    </div>
                                </label>
                                <label className="difficulty-option cursor-pointer">
                                    <input type="radio" name="difficulty" value="intermediate" checked={difficulty === 'intermediate'} onChange={() => setDifficulty('intermediate')} className="hidden peer" />
                                    <div className="peer-checked:bg-blue-500/20 peer-checked:border-blue-500 border border-[#30363D] rounded-xl p-3 text-center transition-all">
                                        <span className="text-xl block mb-1">⭐</span>
                                        <span className="text-xs font-semibold text-gray-300 peer-checked:text-blue-400">Intermédiaire</span>
                                    </div>
                                </label>
                                <label className="difficulty-option cursor-pointer">
                                    <input type="radio" name="difficulty" value="advanced" checked={difficulty === 'advanced'} onChange={() => setDifficulty('advanced')} className="hidden peer" />
                                    <div className="peer-checked:bg-purple-500/20 peer-checked:border-purple-500 border border-[#30363D] rounded-xl p-3 text-center transition-all">
                                        <span className="text-xl block mb-1">🚀</span>
                                        <span className="text-xs font-semibold text-gray-300 peer-checked:text-purple-400">Expert</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">TAGS (MOTS-CLÉS)</label>
                            <p className="text-xs text-gray-500 mb-3">Appuyez sur Entrée pour ajouter un tag</p>
                            <div className="input-field rounded-xl px-4 py-3 flex flex-wrap gap-2 items-center cursor-text" onClick={() => document.getElementById('tagInput')?.focus()}>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(t => (
                                        <span key={t} className="tag-item inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg border border-emerald-500/20">
                                            {t}
                                            <button onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors">×</button>
                                        </span>
                                    ))}
                                </div>
                                <input type="text" id="tagInput" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Ajouter un tag..." className="bg-transparent text-sm flex-1 min-w-[100px] outline-none" />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-semibold text-gray-300">PRIX DU COURS</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="toggle-checkbox hidden" />
                                    <div className="toggle-label w-10 h-5 bg-[#30363D] rounded-full relative transition-colors">
                                        <div className="toggle-dot w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                                    </div>
                                    <span className="text-xs text-gray-400">Gratuit</span>
                                </label>
                            </div>

                            {!isFree && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5">PRIX (XAF) <span className="text-red-400">*</span></label>
                                        <input type="number" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} placeholder="0" min="0" className="input-field w-full px-4 py-3 rounded-xl text-lg font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5">PRIX PROMOTIONNEL (optionnel)</label>
                                        <input type="number" value={promoPrice} onChange={e => setPromoPrice(e.target.value ? Number(e.target.value) : '')} placeholder="Ex: 10000" min="0" className="input-field w-full px-4 py-3 rounded-xl text-sm" />
                                        <p className="text-xs text-gray-500 mt-1">Le prix original sera barré sur la marketplace</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cover Image Upload */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">IMAGE DE COUVERTURE <span className="text-red-400">*</span></label>
                            <p className="text-xs text-gray-500 mb-4">Dimensions recommandées : 1280 x 720px (Ratio 16:9)</p>
                            
                            <div className={\`drop-zone rounded-xl p-8 text-center cursor-pointer \${isDragOver ? 'dragover' : ''}\`} onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}>
                                {!coverImageUrl ? (
                                    <div>
                                        <div className="w-16 h-16 rounded-2xl bg-[#30363D] flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        </div>
                                        <p className="text-sm text-gray-300 font-medium mb-1">Cliquez pour sélectionner une image</p>
                                        <p className="text-xs text-gray-500">ou glissez-déposez ici</p>
                                        <p className="text-xs text-gray-600 mt-2">PNG, JPG ou WEBP • Max 5MB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <img src={coverImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-3" />
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-4 py-2 bg-[#30363D] rounded-lg text-xs text-gray-300 hover:bg-[#30363D]/80 transition-colors">Changer</button>
                                            <button onClick={(e) => { e.stopPropagation(); setCoverImage(null); setCoverImageUrl(''); }} className="px-4 py-2 bg-red-500/10 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors">Supprimer</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            
                            <div className="mt-4 p-3 bg-[#111827] rounded-lg flex items-center gap-3">
                                <div className="w-16 h-9 bg-[#30363D] rounded flex items-center justify-center flex-shrink-0">
                                    <div className="w-12 h-7 bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-300">Ratio 16:9 recommandé</p>
                                    <p className="text-[10px] text-gray-500">1280 × 720 pixels minimum</p>
                                </div>
                            </div>
                        </div>

                        {/* Slug */}
                        <div className="glass-card rounded-2xl p-5 sm:p-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">URL SIMPLIFIÉE (SLUG)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">ndara.io/courses/</span>
                                <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} placeholder="trading-pro (auto-généré si vide)" className="input-field w-full pl-36 pr-4 py-3 rounded-xl text-sm" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">Généré automatiquement à partir du titre. Peut être modifié.</p>
                        </div>

                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                            
                            {/* Preview Card */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-[#30363D]">
                                    <h3 className="text-sm font-bold text-white">👁️ Aperçu en direct</h3>
                                    <p className="text-xs text-gray-500">Voici à quoi ressemblera votre cours</p>
                                </div>
                                
                                <div className="p-5">
                                    <div className="w-full h-32 bg-[#30363D] rounded-xl mb-4 overflow-hidden relative">
                                        {coverImageUrl ? (
                                            <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-3xl">📚</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white line-clamp-2">{title || 'Titre du cours'}</h4>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{subtitle || 'Sous-titre du cours'}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-[8px] font-bold">MO</div>
                                            <span className="text-xs text-gray-400">Dr. Formateur</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-400 text-xs">⭐</span>
                                            <span className="text-xs text-white font-semibold">Nouveau</span>
                                            <span className="text-xs text-gray-500">(0 avis)</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-lg font-semibold">
                                                {difficulty === 'beginner' ? 'Débutant' : difficulty === 'advanced' ? 'Expert' : 'Intermédiaire'}
                                            </span>
                                            {category && (
                                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded-lg font-semibold">
                                                    {category}
                                                </span>
                                            )}
                                        </div>

                                        {validObjectives > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1.5">Les étudiants apprendront à :</p>
                                                <div className="space-y-1">
                                                    {objectives.filter(o => o.trim()).slice(0, 2).map((obj, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <span className="text-emerald-400 text-[10px]">✓</span>
                                                            <span className="text-[10px] text-gray-300 line-clamp-1">{obj}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-[#30363D]">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-lg font-black text-emerald-400">
                                                        {isFree || !price ? 'Gratuit' : \`\${Number(promoPrice || price).toLocaleString()} F\`}
                                                    </span>
                                                    {promoPrice && price && promoPrice < price && (
                                                        <span className="text-xs text-gray-500 line-through ml-2">{Number(price).toLocaleString()} F</span>
                                                    )}
                                                </div>
                                                <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg">S'inscrire</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Completion Checklist */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-white mb-3">✅ Checklist de publication</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={\`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 \${isTitleValid ? 'bg-emerald-500' : 'bg-[#30363D]'}\`}>
                                            {isTitleValid && <CheckIcon />}
                                        </div>
                                        <span className="text-xs text-gray-300">Titre du cours</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={\`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 \${isDescValid ? 'bg-emerald-500' : 'bg-[#30363D]'}\`}>
                                            {isDescValid && <CheckIcon />}
                                        </div>
                                        <span className="text-xs text-gray-400">Description</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={\`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 \${isObjectivesValid ? 'bg-emerald-500' : 'bg-[#30363D]'}\`}>
                                            {isObjectivesValid && <CheckIcon />}
                                        </div>
                                        <span className="text-xs text-gray-400">Objectifs (min. 3)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={\`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 \${isImageValid ? 'bg-emerald-500' : 'bg-[#30363D]'}\`}>
                                            {isImageValid && <CheckIcon />}
                                        </div>
                                        <span className="text-xs text-gray-400">Image de couverture</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={\`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 \${isPriceValid ? 'bg-emerald-500' : 'bg-[#30363D]'}\`}>
                                            {isPriceValid && <CheckIcon />}
                                        </div>
                                        <span className="text-xs text-gray-400">Prix défini</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={\`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 \${isCategoryValid ? 'bg-emerald-500' : 'bg-[#30363D]'}\`}>
                                            {isCategoryValid && <CheckIcon />}
                                        </div>
                                        <span className="text-xs text-gray-400">Catégorie sélectionnée</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Sticky Bottom Action */}
                <div className="sticky-bottom">
                    <div className="max-w-5xl mx-auto px-4 pb-6">
                        <div className="flex gap-3">
                            <button className="flex-1 py-3.5 bg-[#161B22] border border-[#30363D] text-white text-sm font-semibold rounded-xl hover:bg-[#1E2530] transition-colors">
                                Sauvegarder le brouillon
                            </button>
                            <button onClick={createDraft} disabled={isSubmitting} className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                                Créer le brouillon
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
`;

fs.writeFileSync('src/views/instructor/InstructorCourseCreate.tsx', code);
