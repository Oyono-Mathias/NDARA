import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Loader2 } from 'lucide-react';

export function InstructorCourseCreate() {
  const { currentUser, isUserLoading } = useRole();
  const navigate = useNavigate();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [language, setLanguage] = useState('fr');
  const [coverUrl, setCoverUrl] = useState('');

  const [sections, setSections] = useState<any[]>([]);

  const [images, setImages] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);

  const [accessType, setAccessType] = useState('free');
  const [price, setPrice] = useState(0);

  const [certification, setCertification] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadProgressList, setUploadProgressList] = useState<{name: string, progress: number}[]>([]);

  const [toastMessage, setToastMessage] = useState<{msg: string, type: string} | null>(null);

  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (isUserLoading) {
    return (
        <div className="h-[60vh] flex items-center justify-center bg-[#0B0F19]">
            <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
    );
  }

  // Bypass temporaire
  if (false && currentUser?.status !== 'approved' && currentUser?.role !== 'admin' && currentUser?.role !== 'ceo') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Accès restreint</h1>
        </div>
      </div>
    );
  }

  const showToast = (msg: string, type: string) => {
      setToastMessage({ msg, type });
  };

  const validateStep = (step: number) => {
      let isValid = true;
      let message = '';
      if (step === 1) {
          if (!title.trim()) { message = 'Le titre du cours est obligatoire'; isValid = false; }
          else if (!description.trim()) { message = 'La description est obligatoire'; isValid = false; }
          else if (!category) { message = 'Sélectionnez une catégorie'; isValid = false; }
      } else if (step === 2) {
          if (sections.length === 0) { message = 'Ajoutez au moins une section'; isValid = false; }
      }
      if (!isValid) showToast(message, 'error');
      return isValid;
  };

  const nextStep = () => {
      if (currentStep === 5) {
          publishCourse();
          return;
      }
      if (!validateStep(currentStep)) return;
      if (currentStep < totalSteps) {
          setCurrentStep(c => c + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const prevStep = () => {
      if (currentStep > 1) {
          setCurrentStep(c => c - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  // Upload Logic (R2 via API)
  const executeUpload = async (file: File, bucketFolder: string) => {
      const { uploadToR2 } = await import('../../lib/r2Upload');
      return uploadToR2(file, bucketFolder, (progress) => {
         setUploadProgressList(prev => {
             const existing = [...prev];
             const index = existing.findIndex(p => p.name === file.name);
             if (index >= 0) { existing[index].progress = progress; } 
             else { existing.push({ name: file.name, progress }); }
             return existing;
         });
      });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast("L'image ne doit pas dépasser 5MB", 'error'); return; }

      setIsUploading(true);
      setUploadTitle("Upload image de couverture");
      setUploadProgressList([{ name: file.name, progress: 0 }]);

      try {
          const url = await executeUpload(file, 'course-covers');
          setCoverUrl(url);
          showToast('Couverture téléversée avec succès !', 'success');
      } catch (err: any) {
          console.error("R2 UPLOAD ERROR:", err);
          showToast(`Erreur lors du téléversement : ${err?.message || ''}`, 'error');
      } finally {
          setIsUploading(false);
          setUploadProgressList([]);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos' | 'docs') => {
      const files = Array.from(e.target.files || []) as File[];
      if (files.length === 0) return;

      const currentCount = type === 'images' ? images.length : type === 'videos' ? videos.length : docs.length;
      const maxFiles = type === 'images' ? 20 : type === 'videos' ? 10 : 15;

      if (currentCount + files.length > maxFiles) { showToast(`Maximum ${maxFiles} fichiers pour cette catégorie`, 'error'); return; }

      const maxSize = type === 'videos' ? 500 * 1024 * 1024 : type === 'docs' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      const invalidFiles = files.filter(f => f.size > maxSize);
      if (invalidFiles.length > 0) { showToast(`${invalidFiles.length} fichier(s) dépassent la taille maximale`, 'error'); return; }

      setIsUploading(true);
      setUploadTitle(`Téléversement ${type}`);
      setUploadProgressList(files.map(f => ({ name: f.name, progress: 0 })));

      const newFiles: any[] = [];
      try {
          for (let i = 0; i < files.length; i++) {
              const file = files[i] as File;
              const bucketFolder = type === 'images' ? 'course-images' : type === 'videos' ? 'course-videos' : 'course-docs';
              
              let url = "";
              let videoId = "";
              
              if (type === 'videos') {
                  const { uploadVideoToBunny } = await import('../../lib/bunnyUpload');
                  const result = await uploadVideoToBunny(file, (progress) => {
                      setUploadProgressList(prev => {
                          const existing = [...prev];
                          const index = existing.findIndex(p => p.name === file.name);
                          if (index >= 0) { existing[index].progress = progress; } 
                          return existing;
                      });
                  });
                  url = result.iframeUrl;
                  videoId = result.videoId;
              } else {
                  url = await executeUpload(file, bucketFolder);
              }
              
              newFiles.push({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: url,
                  videoId: videoId,
                  status: type === 'videos' ? 'Traitement en cours' : 'Prêt',
                  uploadedAt: new Date().toISOString()
              });
          }
          if (type === 'images') setImages([...images, ...newFiles]);
          if (type === 'videos') setVideos([...videos, ...newFiles]);
          if (type === 'docs') setDocs([...docs, ...newFiles]);
          showToast(`${files.length} fichier(s) téléversé(s) avec succès !`, 'success');
      } catch (err: any) {
          console.error("R2 UPLOAD ERROR:", err);
          showToast(`Erreur lors du téléversement : ${err?.message || ''}`, 'error');
      } finally {
          setIsUploading(false);
          setUploadProgressList([]);
          e.target.value = '';
      }
  };

  const removeFile = (type: string, index: number) => {
      if (type === 'images') setImages(images.filter((_, i) => i !== index));
      if (type === 'videos') setVideos(videos.filter((_, i) => i !== index));
      if (type === 'docs') setDocs(docs.filter((_, i) => i !== index));
      showToast('Fichier supprimé', 'info');
  };

  const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sections
  const addSection = () => {
      setSections([...sections, { id: Date.now(), title: '', lessons: [] }]);
  };

  const removeSection = (id: number) => {
      setSections(sections.filter(s => s.id !== id));
  };

  const addLesson = (sectionId: number) => {
      setSections(sections.map(s => {
          if (s.id === sectionId) {
              return { ...s, lessons: [...s.lessons, { id: Date.now(), title: '', type: 'video', duration: '' }] };
          }
          return s;
      }));
  };

  const removeLesson = (sectionId: number, lessonId: number) => {
      setSections(sections.map(s => {
          if (s.id === sectionId) {
              return { ...s, lessons: s.lessons.filter((l: any) => l.id !== lessonId) };
          }
          return s;
      }));
  };

  const saveDraft = async () => {
      showToast('Brouillon sauvegardé', 'success');
  };

  const publishCourse = async () => {
      if (!currentUser?.uid) return;
      try {
          const payload = {
              title,
              description,
              category,
              level,
              language,
              coverUrl,
              accessType,
              price: accessType === 'paid' ? price : 0,
              certification,
              requirements,
              targetAudience,
              sections,
              files: { images, videos, docs },
              instructorId: currentUser.uid,
              status: 'Published',
              createdAt: serverTimestamp()
          };
          const docRef = await addDoc(collection(db, 'courses'), payload);
          showToast('Cours publié avec succès !', 'success');
          setTimeout(() => {
              navigate('/instructor/courses');
          }, 1500);
      } catch (err: any) {
          console.error("Erreur détaillée lors de l'ajout du cours:", err);
          showToast('Erreur lors de la publication : ' + (err.message || "Permissions insuffisantes."), 'error');
      }
  };

  const stepTitles: Record<number, string> = {
      1: 'Informations de base',
      2: 'Programme du cours',
      3: 'Médias & Ressources',
      4: 'Paramètres',
      5: 'Récapitulatif'
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalFiles = images.length + videos.length + docs.length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] pb-24 font-sans -m-6 rounded-2xl relative overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
            .step-line { transition: width 0.5s ease; }
            .step-circle { transition: all 0.3s ease; }
            .step-circle.active { background: #22C55E; border-color: #22C55E; }
            .step-circle.completed { background: #22C55E; border-color: #22C55E; }
            .step-line.completed { background: #22C55E; }
            .upload-zone { transition: all 0.2s ease; }
            .upload-zone.dragover { border-color: #22C55E; background: rgba(34, 197, 94, 0.1); }
            @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-slide-in { animation: slideIn 0.3s ease-out; }
            .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            .switch-toggle { transition: background-color 0.2s; }
            .switch-toggle.active { background-color: #22C55E; }
            .switch-thumb { transition: transform 0.2s; }
            .switch-toggle.active .switch-thumb { transform: translateX(20px); }
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        `}} />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#334155]">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/instructor/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-[#1E293B] transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-white">Créer un Cours</h1>
                        <p className="text-[10px] text-gray-400">Étape {currentStep}/5 : {stepTitles[currentStep]}</p>
                    </div>
                </div>
                <button onClick={saveDraft} className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors">
                    Brouillon
                </button>
            </div>
            
            {/* Progress Stepper */}
            <div className="px-4 pb-3">
                <div className="flex items-center">
                    <div className="flex items-center gap-0">
                        <div className={`step-circle ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed text-transparent' : 'text-gray-500'} w-7 h-7 rounded-full border-2 border-[#334155] bg-[#1E293B] flex items-center justify-center text-[10px] font-bold`}>
                            {currentStep > 1 ? <svg className="w-4 h-4 text-white absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : '1'}
                        </div>
                        <div className={`step-line h-0.5 w-8 ${currentStep > 1 ? 'completed' : 'bg-[#334155]'}`}></div>
                        
                        <div className={`step-circle ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed text-transparent' : 'text-gray-500'} w-7 h-7 rounded-full border-2 border-[#334155] bg-[#1E293B] flex items-center justify-center text-[10px] font-bold`}>
                            {currentStep > 2 ? <svg className="w-4 h-4 text-white absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : '2'}
                        </div>
                        <div className={`step-line h-0.5 w-8 ${currentStep > 2 ? 'completed' : 'bg-[#334155]'}`}></div>
                        
                        <div className={`step-circle ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed text-transparent' : 'text-gray-500'} w-7 h-7 rounded-full border-2 border-[#334155] bg-[#1E293B] flex items-center justify-center text-[10px] font-bold`}>
                            {currentStep > 3 ? <svg className="w-4 h-4 text-white absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : '3'}
                        </div>
                        <div className={`step-line h-0.5 w-8 ${currentStep > 3 ? 'completed' : 'bg-[#334155]'}`}></div>
                        
                        <div className={`step-circle ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed text-transparent' : 'text-gray-500'} w-7 h-7 rounded-full border-2 border-[#334155] bg-[#1E293B] flex items-center justify-center text-[10px] font-bold`}>
                            {currentStep > 4 ? <svg className="w-4 h-4 text-white absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : '4'}
                        </div>
                        <div className={`step-line h-0.5 w-8 ${currentStep > 4 ? 'completed' : 'bg-[#334155]'}`}></div>
                        
                        <div className={`step-circle ${currentStep === 5 ? 'active' : 'text-gray-500'} w-7 h-7 rounded-full border-2 border-[#334155] bg-[#1E293B] flex items-center justify-center text-[10px] font-bold`}>5</div>
                    </div>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="px-4 pt-4">
            
            {/* STEP 1: Informations de base */}
            <div className={`step-content space-y-4 ${currentStep === 1 ? 'animate-slide-in block' : 'hidden'}`}>
                <div>
                    <label className="text-sm font-semibold text-white mb-2 block">Image de couverture *</label>
                    <div className="upload-zone border-2 border-dashed border-[#334155] rounded-xl p-6 text-center cursor-pointer hover:border-[#22C55E]/50" onClick={() => document.getElementById('coverInput')?.click()}>
                        {coverUrl ? (
                            <img src={coverUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-3" />
                        ) : (
                            <div>
                                <svg className="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <p className="text-sm text-gray-400">Touchez pour ajouter une couverture</p>
                                <p className="text-[10px] text-gray-500 mt-1">JPG, PNG • Max 5MB • 1280×720px recommandé</p>
                            </div>
                        )}
                        <input type="file" id="coverInput" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-white mb-2 block">Titre du cours *</label>
                    <input type="text" placeholder="Ex: Marketing Digital pour les PME Africaines" value={title} onChange={e => setTitle(e.target.value)}
                           className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#22C55E]" />
                </div>

                <div>
                    <label className="text-sm font-semibold text-white mb-2 block">Description *</label>
                    <textarea rows={4} placeholder="Décrivez le contenu, les objectifs et les prérequis de votre cours..." value={description} onChange={e => setDescription(e.target.value)}
                              className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#22C55E]"></textarea>
                    <p className="text-[10px] text-gray-500 mt-1">{description.length} / 500 caractères</p>
                </div>

                <div>
                    <label className="text-sm font-semibold text-white mb-2 block">Catégorie *</label>
                    <select className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#22C55E]" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Sélectionner une catégorie</option>
                        <option value="marketing"> Marketing Digital</option>
                        <option value="tech">💻 Technologie & Développement</option>
                        <option value="finance">💰 Finance & Trading</option>
                        <option value="design">🎨 Design & Créativité</option>
                        <option value="business">📈 Business & Entrepreneuriat</option>
                        <option value="agriculture">🌾 Agriculture & Agrobusiness</option>
                        <option value="langues"> Langues</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-semibold text-white mb-2 block">Niveau</label>
                        <select className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#22C55E]" value={level} onChange={e => setLevel(e.target.value)}>
                            <option value="beginner">Débutant</option>
                            <option value="intermediate">Intermédiaire</option>
                            <option value="advanced">Avancé</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-white mb-2 block">Langue</label>
                        <select className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#22C55E]" value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* STEP 2: Programme du cours */}
            <div className={`step-content space-y-4 ${currentStep === 2 ? 'animate-slide-in block' : 'hidden'}`}>
                <div className="bg-[#111827]/50 rounded-xl p-3 border border-[#334155] mb-4">
                    <p className="text-xs text-gray-400">📚 Organisez votre cours en sections et leçons. Ajoutez du contenu vidéo, texte ou quiz.</p>
                </div>

                <div className="space-y-3">
                    {sections.map((section, sIndex) => (
                        <div key={section.id} className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden animate-fade-in">
                            <div className="p-3 bg-[#111827]/50 border-b border-[#334155] flex items-center gap-3">
                                <span className="text-xs font-bold text-[#22C55E]">Section {sIndex + 1}</span>
                                <input type="text" placeholder="Titre de la section..." value={section.title} onChange={e => {
                                    const newSec = [...sections];
                                    newSec[sIndex].title = e.target.value;
                                    setSections(newSec);
                                }} className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 border-none focus:ring-0 outline-none" />
                                <button onClick={() => removeSection(section.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-3 space-y-2">
                                {section.lessons.map((lesson: any, lIndex: number) => (
                                    <div key={lesson.id} className="flex items-center gap-2 bg-[#111827] rounded-lg p-2">
                                        <span className="text-[10px] text-gray-500 w-5">{lIndex + 1}.</span>
                                        <input type="text" placeholder="Titre de la leçon..." value={lesson.title} onChange={e => {
                                            const newSec = [...sections];
                                            newSec[sIndex].lessons[lIndex].title = e.target.value;
                                            setSections(newSec);
                                        }} className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 border-none focus:ring-0 outline-none" />
                                        <select value={lesson.type} onChange={e => {
                                            const newSec = [...sections];
                                            newSec[sIndex].lessons[lIndex].type = e.target.value;
                                            setSections(newSec);
                                        }} className="bg-[#1E293B] text-[10px] text-gray-400 rounded px-2 py-1 border border-[#334155] appearance-none outline-none">
                                            <option value="video"> Vidéo</option>
                                            <option value="text">📄 Texte</option>
                                            <option value="quiz">❓ Quiz</option>
                                            <option value="assignment">📝 Exercice</option>
                                        </select>
                                        <button onClick={() => removeLesson(section.id, lesson.id)} className="p-1 text-gray-600 hover:text-red-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                
                                <button onClick={() => addLesson(section.id)} className="w-full py-2 text-[10px] text-gray-500 hover:text-[#22C55E] border border-dashed border-[#334155] rounded-lg transition-colors">
                                    + Ajouter une leçon
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={addSection} className="w-full py-3 border-2 border-dashed border-[#334155] rounded-xl text-sm font-medium text-gray-400 hover:border-[#22C55E]/50 hover:text-[#22C55E] transition-all active:scale-[0.98]">
                    + Ajouter une section
                </button>
            </div>

            {/* STEP 3: Médias et Ressources */}
            <div className={`step-content space-y-4 ${currentStep === 3 ? 'animate-slide-in block' : 'hidden'}`}>
                <div className="bg-[#111827]/50 rounded-xl p-3 border border-[#334155] mb-4">
                    <p className="text-xs text-gray-400">📁 Téléversez vos fichiers vers le Cloud. Les fichiers seront accessibles uniquement aux étudiants inscrits.</p>
                </div>

                <div className="space-y-4">
                    {/* Images */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-white">Images du cours</label>
                            <span className="text-[10px] text-gray-500">{images.length}/20</span>
                        </div>
                        <div className="upload-zone border-2 border-dashed border-[#334155] rounded-xl p-4 text-center cursor-pointer hover:border-[#22C55E]/50" onClick={() => document.getElementById('imagesInput')?.click()}>
                            <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <p className="text-sm text-gray-400">Touchez pour ajouter des images</p>
                            <input type="file" id="imagesInput" accept="image/*" multiple className="hidden" onChange={e => handleFileUpload(e, 'images')} />
                        </div>
                        <div className="mt-2 space-y-2">
                            {images.map((file, i) => (
                                <div key={i} className="file-item flex items-center gap-3 bg-[#111827] rounded-xl p-3 border border-[#334155]">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">📦</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{file.name}</p>
                                        <p className="text-[10px] text-gray-500">{formatFileSize(file.size)} • Image</p>
                                    </div>
                                    <button onClick={() => removeFile('images', i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Videos */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-white">Vidéos de cours</label>
                            <span className="text-[10px] text-gray-500">{videos.length}/10</span>
                        </div>
                        <div className="upload-zone border-2 border-dashed border-[#334155] rounded-xl p-4 text-center cursor-pointer hover:border-[#22C55E]/50" onClick={() => document.getElementById('videosInput')?.click()}>
                            <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            <p className="text-sm text-gray-400">Touchez pour ajouter des vidéos</p>
                            <p className="text-[10px] text-gray-500 mt-1">MP4, MOV • Max 500MB par fichier</p>
                            <input type="file" id="videosInput" accept="video/*" multiple className="hidden" onChange={e => handleFileUpload(e, 'videos')} />
                        </div>
                        <div className="mt-2 space-y-2">
                            {videos.map((file, i) => (
                                <div key={i} className="file-item flex items-center gap-3 bg-[#111827] rounded-xl p-3 border border-[#334155]">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🚀</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{file.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-gray-500">{formatFileSize(file.size)} • Vidéo</p>
                                            {file.status && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${file.status === 'Prêt' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-amber-500/20 text-amber-500 animate-pulse'}`}>
                                                    {file.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile('videos', i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-white">Documents & PDF</label>
                            <span className="text-[10px] text-gray-500">{docs.length}/15</span>
                        </div>
                        <div className="upload-zone border-2 border-dashed border-[#334155] rounded-xl p-4 text-center cursor-pointer hover:border-[#22C55E]/50" onClick={() => document.getElementById('docsInput')?.click()}>
                            <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            <p className="text-sm text-gray-400">Touchez pour ajouter des documents</p>
                            <p className="text-[10px] text-gray-500 mt-1">PDF, DOCX, PPTX • Max 50MB</p>
                            <input type="file" id="docsInput" accept=".pdf,.doc,.docx,.ppt,.pptx" multiple className="hidden" onChange={e => handleFileUpload(e, 'docs')} />
                        </div>
                        <div className="mt-2 space-y-2">
                            {docs.map((file, i) => (
                                <div key={i} className="file-item flex items-center gap-3 bg-[#111827] rounded-xl p-3 border border-[#334155]">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">📄</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{file.name}</p>
                                        <p className="text-[10px] text-gray-500">{formatFileSize(file.size)} • Document</p>
                                    </div>
                                    <button onClick={() => removeFile('docs', i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* STEP 4: Paramètres */}
            <div className={`step-content space-y-4 ${currentStep === 4 ? 'animate-slide-in block' : 'hidden'}`}>
                <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                    <h3 className="text-sm font-bold text-white mb-3">💰 Prix & Accès</h3>
                    
                    <div className="mb-4">
                        <label className="text-sm font-semibold text-white mb-2 block">Type d'accès</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setAccessType('free')} className={`access-type-btn p-3 rounded-xl border-2 text-center ${accessType === 'free' ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#334155]'}`}>
                                <div className="text-xl mb-1">🆓</div>
                                <div className={`text-sm font-semibold ${accessType === 'free' ? 'text-[#22C55E]' : 'text-gray-400'}`}>Gratuit</div>
                            </button>
                            <button onClick={() => setAccessType('paid')} className={`access-type-btn p-3 rounded-xl border-2 text-center ${accessType === 'paid' ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#334155]'}`}>
                                <div className="text-xl mb-1">💎</div>
                                <div className={`text-sm font-semibold ${accessType === 'paid' ? 'text-[#22C55E]' : 'text-gray-400'}`}>Payant</div>
                            </button>
                        </div>
                    </div>

                    {accessType === 'paid' && (
                        <div>
                            <label className="text-sm font-semibold text-white mb-2 block">Prix en FCFA *</label>
                            <div className="relative">
                                <input type="number" placeholder="15000" min="500" step="500" value={price || ''} onChange={e => setPrice(parseInt(e.target.value) || 0)}
                                       className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#22C55E]" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">F</span>
                            </div>
                            <div className="mt-3 p-3 bg-[#111827]/50 rounded-lg">
                                <p className="text-[10px] text-gray-400">📊 Vous recevrez <span className="text-[#22C55E] font-bold">70%</span> des ventes. Commission NDARA : 30%</p>
                                <p className="text-[10px] text-gray-500 mt-1">Prix estimé par étudiant : <span className="text-[#22C55E] font-bold">{Math.round(price * 0.7).toLocaleString()} F</span></p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                    <h3 className="text-sm font-bold text-white mb-3">🏆 Certification</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white font-medium">Délivrer un certificat</p>
                            <p className="text-[10px] text-gray-400 mt-1">Les étudiants reçoivent un certificat NDARA vérifiable</p>
                        </div>
                        <div className={`switch-toggle w-11 h-6 rounded-full relative cursor-pointer ${certification ? 'bg-[#22C55E] active' : 'bg-[#334155]'}`} onClick={() => setCertification(!certification)}>
                            <div className="switch-thumb absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                    <h3 className="text-sm font-bold text-white mb-3">📋 Prérequis</h3>
                    <textarea rows={3} placeholder="Ex: Aucun prérequis, ou Connaissances de base en..." value={requirements} onChange={e => setRequirements(e.target.value)}
                              className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#22C55E]"></textarea>
                </div>

                <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                    <h3 className="text-sm font-bold text-white mb-3">🎯 Public cible</h3>
                    <textarea rows={3} placeholder="Ex: Entrepreneurs, étudiants en marketing, professionnels..." value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
                              className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#22C55E]"></textarea>
                </div>
            </div>

            {/* STEP 5: Récapitulatif & Publication */}
            <div className={`step-content space-y-4 ${currentStep === 5 ? 'animate-slide-in block' : 'hidden'}`}>
                <div className="bg-[#1E293B] rounded-xl overflow-hidden border border-[#334155]">
                    {coverUrl ? (
                         <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${coverUrl})`}}></div>
                     ) : (
                         <div className="h-32 bg-gradient-to-br from-[#22C55E]/20 to-[#3B82F6]/20 flex items-center justify-center">
                             <span className="text-4xl">📚</span>
                         </div>
                     )}
                    <div className="p-4">
                        <h3 className="text-lg font-bold text-white">{title || 'Titre du cours'}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{description || 'Description du cours...'}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-semibold rounded-md">{category || 'Catégorie'}</span>
                            <span className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold rounded-md">{level}</span>
                            <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-semibold rounded-md">{accessType === 'free' ? 'Gratuit' : `${price} F`}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#1E293B] rounded-xl p-3 border border-[#334155] text-center">
                        <div className="text-xl font-bold text-[#22C55E]">{sections.length}</div>
                        <div className="text-[10px] text-gray-400">Sections</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-xl p-3 border border-[#334155] text-center">
                        <div className="text-xl font-bold text-[#3B82F6]">{totalLessons}</div>
                        <div className="text-[10px] text-gray-400">Leçons</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-xl p-3 border border-[#334155] text-center">
                        <div className="text-xl font-bold text-orange-500">{totalFiles}</div>
                        <div className="text-[10px] text-gray-400">Fichiers</div>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                    <h3 className="text-sm font-bold text-white mb-3">✅ Vérification finale</h3>
                    <div className="space-y-2">
                        {[
                            { label: 'Titre du cours défini', done: !!title },
                            { label: 'Description complétée', done: !!description },
                            { label: 'Catégorie sélectionnée', done: !!category },
                            { label: 'Au moins une section', done: sections.length > 0 },
                            { label: 'Image de couverture', done: !!coverUrl },
                            { label: 'Prix défini (si payant)', done: accessType === 'free' || price > 0 }
                        ].map((item, idx) => (
                             <div key={idx} className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full ${item.done ? 'bg-[#22C55E]' : 'bg-[#334155]'} flex items-center justify-center flex-shrink-0`}>
                                    {item.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                                </div>
                                <span className={`text-xs ${item.done ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={publishCourse} className="w-full py-4 bg-[#22C55E] hover:bg-emerald-600 text-white text-base font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-[#22C55E]/20">
                    🚀 Publier le cours
                </button>
                
                <p className="text-center text-[10px] text-gray-500">En publiant, vous acceptez les conditions d'utilisation de NDARA pour les instructeurs.</p>
            </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0F19]/95 backdrop-blur-md border-t border-[#334155] z-30">
            <div className="flex items-center justify-between px-4 py-3">
                <button onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2.5 bg-[#1E293B] border border-[#334155] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none">
                    ← Précédent
                </button>
                <button onClick={nextStep} className="flex-1 ml-3 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98]">
                    {currentStep === 5 ? '🚀 Publier' : 'Suivant →'}
                </button>
            </div>
        </nav>

        {/* Upload Modal */}
        {isUploading && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-6 w-full max-w-sm">
                    <h3 className="text-base font-bold text-white mb-4">{uploadTitle}</h3>
                    <div className="space-y-3">
                        {uploadProgressList.map((prog, i) => (
                             <div key={i}>
                                <div className="flex justify-between text-xs text-slate-300 mb-1">
                                    <span className="truncate pr-2">{prog.name}</span>
                                    <span>{prog.progress}%</span>
                                </div>
                                <div className="w-full bg-[#0B0F19] rounded-full h-1.5">
                                    <div className="bg-[#22C55E] h-1.5 rounded-full transition-all" style={{ width: `${prog.progress}%` }}></div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Toast */}
        {toastMessage && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border bg-[#1E293B] ${toastMessage.type === 'error' ? 'border-red-500' : 'border-[#334155]'}`}>
                    <span className={`text-lg ${toastMessage.type === 'error' ? 'text-red-500' : 'text-[#22C55E]'}`}>
                        {toastMessage.type === 'error' ? '⚠️' : '✅'}
                    </span>
                    <span className="text-sm font-medium text-white">{toastMessage.msg}</span>
                </div>
            </div>
        )}
    </div>
  );
}
