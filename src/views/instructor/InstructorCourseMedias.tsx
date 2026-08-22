import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCourseBuilder } from "../../hooks/catalog/useCatalogAdmin";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, FileText, Play, Check, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { uploadVideoToBunny } from "../../lib/bunnyUpload";
import { uploadToR2 } from "../../lib/r2Upload";
import { Lesson } from "../../types/models";
import { motion, AnimatePresence } from "motion/react";

export function InstructorCourseMedias() {
    const { id: courseId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { chapters, lessons, loading, updateLesson } = useCourseBuilder(courseId!);

    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const [uploadingState, setUploadingState] = useState<Record<string, { progress: number, status: 'uploading' | 'processing' | 'done' | 'error' }>>({});
    const [localTextContent, setLocalTextContent] = useState<Record<string, string>>({});

    const activeLessons = lessons.filter(l => l.status !== 'archived').sort((a, b) => a.order - b.order);
    const activeChapters = chapters.sort((a, b) => a.order - b.order);

    // Initial sync for text content
    useEffect(() => {
        const initialText: Record<string, string> = {};
        activeLessons.forEach(l => {
            if (l.type === 'text' && l.content) {
                initialText[l.id] = l.content;
            }
        });
        setLocalTextContent(prev => ({ ...initialText, ...prev }));
    }, [lessons]);

    const toggleLesson = (lessonId: string) => {
        setExpandedLesson(prev => prev === lessonId ? null : lessonId);
    };

    const hasValidContent = (lesson: Lesson) => {
        if (lesson.type === 'video' && lesson.videoUrl) return true;
        if (lesson.type === 'text' && lesson.content && lesson.content.trim().length > 10) return true;
        if (lesson.type === 'document' && lesson.documentUrl) return true;
        if (lesson.type === 'quiz' || lesson.type === 'exercise') return true; // Assuming config elsewhere or just valid for now
        return false;
    };

    const validLessonsCount = activeLessons.filter(hasValidContent).length;
    const progressPercent = activeLessons.length > 0 ? Math.round((validLessonsCount / activeLessons.length) * 100) : 0;
    const canContinue = activeLessons.length > 0 && validLessonsCount >= Math.ceil(activeLessons.length / 2);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, lesson: Lesson) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 0, status: 'uploading' } }));
        
        try {
            const { videoId, iframeUrl } = await uploadVideoToBunny(file, (progress) => {
                setUploadingState(prev => ({ ...prev, [lesson.id]: { progress, status: 'uploading' } }));
            });
            
            setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 100, status: 'processing' } }));
            
            await updateLesson(lesson.id, { videoUrl: iframeUrl });
            
            setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 100, status: 'done' } }));
            toast({ title: '✅ Vidéo attachée avec succès' });
            
        } catch (error: any) {
            console.error(error?.message || "Upload error");
            setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 0, status: 'error' } }));
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Échec de l\'upload vidéo' });
        }
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, lesson: Lesson) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 0, status: 'uploading' } }));
        
        try {
            const fileUrl = await uploadToR2(file, `courses/${courseId}/lessons`, (progress) => {
                setUploadingState(prev => ({ ...prev, [lesson.id]: { progress, status: 'uploading' } }));
            });
            
            await updateLesson(lesson.id, { documentUrl: fileUrl });
            
            setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 100, status: 'done' } }));
            toast({ title: '✅ Document attaché avec succès' });
            
        } catch (error: any) {
            console.error(error?.message || "Upload error");
            setUploadingState(prev => ({ ...prev, [lesson.id]: { progress: 0, status: 'error' } }));
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Échec de l\'upload du document' });
        }
    };

    const handleSaveText = async (lesson: Lesson) => {
        const text = localTextContent[lesson.id] || '';
        if (text.trim().length < 10) {
            toast({ variant: 'destructive', title: 'Contenu trop court', description: 'Le texte doit contenir au moins 10 caractères.' });
            return;
        }

        try {
            await updateLesson(lesson.id, { content: text });
            toast({ title: '✅ Contenu sauvegardé' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur de sauvegarde' });
        }
    };
    
    const handleRemoveMedia = async (lesson: Lesson, field: 'videoUrl' | 'documentUrl' | 'content') => {
        try {
            await updateLesson(lesson.id, { [field]: null });
            if (field === 'content') {
                setLocalTextContent(prev => ({ ...prev, [lesson.id]: '' }));
            }
            toast({ title: '🗑️ Média retiré' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur de suppression' });
        }
    };

    const handleContinue = () => {
        if (!canContinue) {
            toast({ variant: 'destructive', title: 'Prérequis manquants', description: 'Au moins 50% des leçons doivent avoir un contenu.' });
            return;
        }
        navigate(`/instructor/courses/${courseId}/parametres`);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-white"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="pb-24 font-sans min-h-screen text-[#F8FAFC]">
            <style>{`
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #0D1117; }
                ::-webkit-scrollbar-thumb { background: #30363D; border-radius: 2px; }
                
                .glass-card {
                    background: rgba(22, 27, 34, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(48, 54, 61, 0.5);
                }
                
                .step-active { background: #3B82F6; color: #fff; border-color: #3B82F6; animation: pulse 2s infinite; }
                .step-completed { background: #10B981; color: #fff; border-color: #10B981; }
                .step-inactive { background: transparent; color: #6B7280; border-color: #30363D; }
                
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
                }
                
                .lesson-row { transition: all 0.2s; }
                .lesson-row:hover { background: rgba(59, 130, 246, 0.05); }
                .lesson-row.expanded { background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3B82F6; }
                
                .drop-zone {
                    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%2330363DFF' stroke-width='2' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
                    transition: all 0.3s;
                }
                .drop-zone:hover, .drop-zone.dragover {
                    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%233B82F6FF' stroke-width='2' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
                    background-color: rgba(59, 130, 246, 0.05);
                }
                
                .progress-bar-fill {
                    transition: width 0.5s ease-out;
                    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
                }
                
                .sticky-bottom {
                    position: sticky;
                    bottom: 0;
                    background: linear-gradient(to top, #06080F 80%, transparent);
                    padding-top: 20px;
                }
                
                .status-badge-uploading { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
                .status-badge-processing { background: rgba(249, 115, 22, 0.2); color: #FB923C; animation: pulse-orange 2s infinite; }
                .status-badge-done { background: rgba(16, 185, 129, 0.2); color: #34D399; }
                .status-badge-error { background: rgba(239, 68, 68, 0.2); color: #F87171; }
                
                @keyframes pulse-orange {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .type-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                .type-video { background: rgba(239, 68, 68, 0.1); }
                .type-text { background: rgba(59, 130, 246, 0.1); }
                .type-quiz { background: rgba(249, 115, 22, 0.1); }
                .type-exercise { background: rgba(139, 92, 246, 0.1); }
                .type-document { background: rgba(16, 185, 129, 0.1); }
            `}</style>

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06080F]/95 backdrop-blur-xl border-b border-[#30363D]/50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#161B22] transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-xs text-white">N</div>
                                <span className="text-sm font-bold text-white">NDARA</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg font-semibold">📂 Étape 3/5</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 pt-20 pb-8">
                
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-black text-white">MÉDIAS & CONTENU</h1>
                    <p className="text-sm text-gray-400 mt-1">Uploadez vos vidéos, textes et documents pour chaque leçon</p>
                </div>

                {/* Progress Stepper */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-completed flex items-center justify-center text-xs font-bold flex-shrink-0">
                            <Check className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Infos</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-completed flex items-center justify-center text-xs font-bold flex-shrink-0">
                            <Check className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Programme</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full step-active flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <span className="text-xs font-semibold text-blue-400 hidden sm:inline">Médias</span>
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

                {/* Progression Indicator */}
                <div className="glass-card rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📊</span>
                            <div>
                                <p className="text-sm font-bold text-white">Progression des médias</p>
                                <p className="text-xs text-gray-500">
                                    {canContinue ? 'Minimum requis atteint' : 'Au moins 50% requis'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{validLessonsCount} / {activeLessons.length}</p>
                            <p className="text-xs text-gray-500">Leçons configurées</p>
                        </div>
                    </div>
                    <div className="h-2 bg-[#30363D] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${canContinue ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-6 mb-6">
                    {activeChapters.map((chapter, chapterIndex) => {
                        const chapterLessons = activeLessons.filter(l => l.chapterId === chapter.id);
                        if (chapterLessons.length === 0) return null;
                        
                        const completedCount = chapterLessons.filter(hasValidContent).length;

                        return (
                            <div key={chapter.id} className="space-y-4">
                                {/* Chapter Header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-emerald-400 text-xs font-bold">{chapterIndex + 1}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white">{chapter.title}</h3>
                                    <span className="text-xs text-gray-500 ml-auto">{completedCount}/{chapterLessons.length} complété</span>
                                </div>

                                {chapterLessons.map(lesson => {
                                    const isValid = hasValidContent(lesson);
                                    const isExpanded = expandedLesson === lesson.id;
                                    const uploadState = uploadingState[lesson.id];
                                    
                                    let typeIcon = '📄';
                                    let typeClass = 'type-text';
                                    if (lesson.type === 'video') { typeIcon = '🎬'; typeClass = 'type-video'; }
                                    if (lesson.type === 'quiz') { typeIcon = '📝'; typeClass = 'type-quiz'; }
                                    if (lesson.type === 'document') { typeIcon = '📎'; typeClass = 'type-document'; }

                                    return (
                                        <div key={lesson.id} className="glass-card rounded-2xl overflow-hidden">
                                            <div 
                                                className={`lesson-row px-4 sm:px-5 py-4 flex items-center gap-3 cursor-pointer ${isExpanded ? 'expanded' : ''}`} 
                                                onClick={() => toggleLesson(lesson.id)}
                                            >
                                                <div className={`type-icon ${typeClass}`}>{typeIcon}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{lesson.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {uploadState?.status === 'uploading' && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold status-badge-uploading">Upload ({Math.round(uploadState.progress)}%)</span>}
                                                        {uploadState?.status === 'processing' && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold status-badge-processing">Traitement...</span>}
                                                        {!uploadState && isValid && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold status-badge-done">Configuré</span>}
                                                        {!uploadState && !isValid && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold status-badge-error">Vide</span>}
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            
                                            {/* Lesson Content Area */}
                                            {isExpanded && (
                                                <div className="px-4 sm:px-5 pb-5 border-t border-[#30363D]/50 pt-4 bg-[#0D1117]/50">
                                                    
                                                    {lesson.type === 'video' && (
                                                        <>
                                                            {!lesson.videoUrl && !uploadState && (
                                                                <div 
                                                                    className="drop-zone rounded-xl p-6 text-center cursor-pointer relative" 
                                                                    onClick={() => document.getElementById(`file-${lesson.id}`)?.click()}
                                                                >
                                                                    <input 
                                                                        type="file" 
                                                                        id={`file-${lesson.id}`} 
                                                                        className="hidden" 
                                                                        accept="video/*" 
                                                                        onChange={(e) => handleVideoUpload(e, lesson)}
                                                                    />
                                                                    <div className="w-12 h-12 rounded-xl bg-[#30363D] flex items-center justify-center mx-auto mb-3">
                                                                        <Play className="w-5 h-5 text-gray-400" />
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 font-medium mb-1">Cliquez pour uploader votre vidéo</p>
                                                                    <p className="text-xs text-gray-500">MP4, MOV ou WEBM • Optimisé HLS</p>
                                                                </div>
                                                            )}
                                                            
                                                            {uploadState && uploadState.status !== 'done' && (
                                                                <div className="text-left bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <p className="text-sm text-white font-medium truncate">Traitement vidéo...</p>
                                                                        <span className="text-xs text-blue-400 font-semibold">{Math.round(uploadState.progress)}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-[#30363D] rounded-full overflow-hidden">
                                                                        <div className="h-full progress-bar-fill rounded-full" style={{ width: `${uploadState.progress}%` }}></div>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-2">Veuillez patienter...</p>
                                                                </div>
                                                            )}

                                                            {(lesson.videoUrl || uploadState?.status === 'done') && (
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
                                                                    <div className="w-16 h-10 bg-[#30363D] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                        <span className="text-xl">🎬</span>
                                                                    </div>
                                                                    <div className="text-left flex-1 min-w-0">
                                                                        <p className="text-sm text-emerald-400 font-semibold flex items-center gap-1 truncate">
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            Vidéo configurée
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 truncate">Hébergée sur le réseau sécurisé NDARA</p>
                                                                    </div>
                                                                    <button onClick={() => handleRemoveMedia(lesson, 'videoUrl')} className="p-2 w-full sm:w-auto rounded-lg hover:bg-red-500/10 text-red-400 transition-colors flex items-center justify-center gap-2 mt-2 sm:mt-0">
                                                                        <Trash2 className="w-4 h-4" />
                                                                        <span className="sm:hidden text-xs">Supprimer</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {lesson.type === 'document' && (
                                                        <>
                                                            {!lesson.documentUrl && !uploadState && (
                                                                <div 
                                                                    className="drop-zone rounded-xl p-6 text-center cursor-pointer relative" 
                                                                    onClick={() => document.getElementById(`doc-${lesson.id}`)?.click()}
                                                                >
                                                                    <input 
                                                                        type="file" 
                                                                        id={`doc-${lesson.id}`} 
                                                                        className="hidden" 
                                                                        accept=".pdf,.doc,.docx,.zip,.xls,.xlsx" 
                                                                        onChange={(e) => handleDocumentUpload(e, lesson)}
                                                                    />
                                                                    <div className="w-12 h-12 rounded-xl bg-[#30363D] flex items-center justify-center mx-auto mb-3">
                                                                        <FileText className="w-5 h-5 text-gray-400" />
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 font-medium mb-1">Cliquez pour ajouter un document</p>
                                                                    <p className="text-xs text-gray-500">PDF, ZIP, DOC • Max 50MB</p>
                                                                </div>
                                                            )}
                                                            
                                                            {uploadState && uploadState.status !== 'done' && (
                                                                <div className="text-left bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <p className="text-sm text-white font-medium truncate">Envoi du document...</p>
                                                                        <span className="text-xs text-blue-400 font-semibold">{Math.round(uploadState.progress)}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-[#30363D] rounded-full overflow-hidden">
                                                                        <div className="h-full progress-bar-fill rounded-full" style={{ width: `${uploadState.progress}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {(lesson.documentUrl || uploadState?.status === 'done') && (
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
                                                                    <div className="w-10 h-10 bg-[#30363D] rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <FileText className="w-5 h-5 text-emerald-400" />
                                                                    </div>
                                                                    <div className="text-left flex-1 min-w-0">
                                                                        <p className="text-sm text-emerald-400 font-semibold flex items-center gap-1 truncate">
                                                                            Document attaché
                                                                        </p>
                                                                        <p className="text-xs text-blue-400 truncate hover:underline cursor-pointer" onClick={() => window.open(lesson.documentUrl, '_blank')}>Voir le fichier</p>
                                                                    </div>
                                                                    <button onClick={() => handleRemoveMedia(lesson, 'documentUrl')} className="p-2 w-full sm:w-auto rounded-lg hover:bg-red-500/10 text-red-400 transition-colors flex items-center justify-center gap-2 mt-2 sm:mt-0">
                                                                        <Trash2 className="w-4 h-4" />
                                                                        <span className="sm:hidden text-xs">Supprimer</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {lesson.type === 'text' && (
                                                        <>
                                                            <label className="block text-xs text-gray-400 mb-2">Contenu de la leçon (Supporte le Markdown)</label>
                                                            <textarea 
                                                                rows={5} 
                                                                value={localTextContent[lesson.id] || ''}
                                                                onChange={(e) => setLocalTextContent(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                                                                placeholder="Rédigez le contenu de votre article ici..." 
                                                                className="w-full bg-[#111827] border border-[#30363D] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            />
                                                            <div className="flex items-center justify-end mt-3 gap-2">
                                                                {lesson.content && (
                                                                    <button onClick={() => handleRemoveMedia(lesson, 'content')} className="px-4 py-2 bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-colors">Vider</button>
                                                                )}
                                                                <button onClick={() => handleSaveText(lesson)} className="px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-500/20 transition-colors">
                                                                    Sauvegarder
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}

                                                    {(lesson.type === 'quiz' || lesson.type === 'exercise') && (
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <AlertCircle className="w-5 h-5 text-blue-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-blue-400 font-medium">Contenu {lesson.type === 'quiz' ? 'Quiz' : 'Exercice'}</p>
                                                                <p className="text-xs text-gray-400">Le contenu est géré dans l'éditeur dédié.</p>
                                                            </div>
                                                            <Link to={`/instructor/quiz/${lesson.id}`} className="px-4 py-2 w-full sm:w-auto bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-500/20 transition-colors text-center mt-2 sm:mt-0">
                                                                Ouvrir l'éditeur
                                                            </Link>
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {activeLessons.length === 0 && (
                        <div className="text-center py-12 glass-card rounded-2xl">
                            <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm font-medium">Aucune leçon disponible.</p>
                            <p className="text-gray-500 text-xs mt-1">Retournez à l'étape Programme pour structurer votre cours.</p>
                            <button onClick={() => navigate(`/instructor/courses/${courseId}/program`)} className="mt-4 px-4 py-2 bg-[#30363D] hover:bg-[#1E2530] rounded-lg text-sm text-white transition-colors">
                                Retourner au Programme
                            </button>
                        </div>
                    )}
                </div>

                {/* Tips Card */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                    <h3 className="text-sm font-bold text-white mb-3">💡 Conseils pour les médias</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">ℹ️</span>
                            <span className="text-xs text-gray-400">Les vidéos sont automatiquement optimisées pour le streaming mobile (HLS)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">ℹ️</span>
                            <span className="text-xs text-gray-400">Pour les PDF, limitez la taille à <span className="text-white">50MB</span> pour une lecture rapide</span>
                        </li>
                    </ul>
                </div>

                {/* Sticky Bottom Action */}
                <div className="sticky-bottom">
                    <div className="max-w-5xl mx-auto px-4 pb-6">
                        <div className="flex gap-3">
                            <button onClick={() => navigate(`/instructor/courses/${courseId}/program`)} className="flex-1 py-3.5 bg-[#161B22] border border-[#30363D] text-white text-sm font-semibold rounded-xl hover:bg-[#1E2530] transition-colors flex justify-center items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Programme
                            </button>
                            <button 
                                onClick={handleContinue} 
                                className={`flex-1 py-3.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all
                                ${canContinue ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg hover:shadow-blue-500/20' : 'bg-[#161B22] border border-[#30363D] opacity-50 cursor-not-allowed'}`}
                            >
                                Paramètres <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
