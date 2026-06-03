import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, updateDoc, onSnapshot, collectionGroup, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { ClipboardCheck, Plus, CheckCircle, FileText, X, Send, AlertCircle, Loader2, CheckCircle2, Bot } from 'lucide-react';

export function AssignmentsClient() {
    const { currentUser: instructor } = useRole();
    const [courses, setCourses] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    
    // View state
    const [activeTab, setActiveTab] = useState<'create' | 'grade'>('grade');
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    
    // Create state
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Grade state
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isGrading, setIsGrading] = useState(false);
    const [gradeSuccess, setGradeSuccess] = useState(false);

    useEffect(() => {
        if (!instructor?.uid) return;

        // Fetch courses
        const qCourses = query(collection(db, 'courses'), where('instructorId', '==', instructor.uid));
        const unsubCourses = onSnapshot(qCourses, (snap) => {
             setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch assignments
        const qAssignments = query(collectionGroup(db, 'assignments'), where('instructorId', '==', instructor.uid));
        const unsubAssignments = onSnapshot(qAssignments, (snap) => {
             setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch submissions (Limité à 100 pour préserver le billing)
        const qSubmissions = query(
            collection(db, 'devoirs'), 
            where('instructorId', '==', instructor.uid),
            limit(100)
        );
        const unsubSubmissions = onSnapshot(qSubmissions, (snap) => {
             // Tri côté client par date pour contourner l'erreur potentielle d'index composite Firebase manquant
             const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
             subs.sort((a: any, b: any) => {
                 const dA = a.createdAt?.toMillis?.() || 0;
                 const dB = b.createdAt?.toMillis?.() || 0;
                 return dB - dA;
             });
             setSubmissions(subs);
             setIsLoadingSubmissions(false);
        });

        return () => {
            unsubCourses();
            unsubAssignments();
            unsubSubmissions();
        };
    }, [instructor?.uid]);

    const handleCreateAssignment = async () => {
        if (!selectedCourse || !newTitle.trim() || !newDescription.trim() || !instructor?.uid) return;
        setIsCreating(true);
        try {
            const courseObj = courses.find(c => c.id === selectedCourse);
            const ref = doc(collection(db, `courses/${selectedCourse}/assignments`));
            await setDoc(ref, {
                id: ref.id,
                title: newTitle,
                description: newDescription,
                courseId: selectedCourse,
                courseTitle: courseObj?.title || 'Formation',
                instructorId: instructor.uid,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdAt: serverTimestamp()
            });
            setNewTitle("");
            setNewDescription("");
            setDueDate("");
            setActiveTab('grade');
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleAIGrade = async () => {
        if (!selectedSubmission) return;
        setIsGeneratingAI(true);
        try {
            const res = await fetch("/api/ai/grade-assignment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentPrompt: selectedSubmission.assignmentTitle || selectedSubmission.title || "",
                    studentSubmission: selectedSubmission.submissionContent || "Non fourni",
                })
            });
            const data = await res.json();
            if (data && !data.error) {
                if (data.suggestedGrade) {
                    const parsedGrade = parseFloat(String(data.suggestedGrade).replace(/[^\d.]/g, ''));
                    if (!isNaN(parsedGrade)) setGrade(parsedGrade.toString());
                }
                if (data.feedbackDraft) {
                    let draft = data.feedbackDraft + "\n\n";
                    if (data.strengths?.length) draft += "Points forts : " + data.strengths.join(", ") + "\n";
                    if (data.improvements?.length) draft += "Axes d'amélioration : " + data.improvements.join(", ");
                    setFeedback(draft);
                }
            } else {
                console.error("AI Generation Error:", data.error);
            }
        } catch (error) {
            console.error("Error generating AI grading:", error);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleGrade = async () => {
        if (!selectedSubmission || !grade) return;
        setIsGrading(true);
        setGradeSuccess(false);
        try {
            const ref = doc(db, 'devoirs', selectedSubmission.id);
            await updateDoc(ref, {
                status: 'graded',
                grade: Number(grade),
                feedback: feedback,
                gradedAt: serverTimestamp()
            });
            setGradeSuccess(true);
            
            setTimeout(() => {
                setGradeSuccess(false);
                setSelectedSubmission(null);
                setGrade("");
                setFeedback("");
            }, 2000);
        } catch (error) {
            console.error("Error grading:", error);
        } finally {
            setIsGrading(false);
        }
    };

    const pendingSubmissions = useMemo(() => submissions.filter(s => s.status === 'submitted' || !s.status), [submissions]);
    const gradedSubmissions = useMemo(() => submissions.filter(s => s.status === 'graded'), [submissions]);

    return (
        <div className="space-y-8 mt-4">
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button 
                    onClick={() => setActiveTab('grade')} 
                    className={`font-black uppercase tracking-widest text-xs pb-2 border-b-2 transition-all ${activeTab === 'grade' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    Submissions ({pendingSubmissions.length})
                </button>
                <button 
                    onClick={() => setActiveTab('create')} 
                    className={`font-black uppercase tracking-widest text-xs pb-2 border-b-2 transition-all ${activeTab === 'create' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    Créer un Devoir
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl animate-in fade-in">
                    <h2 className="font-black uppercase tracking-tight text-xl mb-6 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" /> Nouveau Devoir
                    </h2>
                    
                    <div className="space-y-4 max-w-2xl">
                        <select 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-white"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Sélectionner une formation</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>

                        <input 
                            placeholder="Titre du devoir..."
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-white"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                        />

                        <textarea 
                            placeholder="Consignes détaillées..."
                            rows={4}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-white resize-none"
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                        />

                        <input 
                            type="date"
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-slate-400"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                        />

                        <button 
                            onClick={handleCreateAssignment}
                            disabled={!selectedCourse || !newTitle || !newDescription || isCreating}
                            className="w-full h-14 bg-primary text-[#0f172a] font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition"
                        >
                            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier l'exercice"}
                        </button>
                    </div>

                    {assignments.length > 0 && (
                        <div className="mt-12">
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Devoirs existants</h3>
                            <div className="space-y-2">
                                {assignments.map(a => (
                                    <div key={a.id} className="p-4 bg-slate-900 rounded-xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white text-sm">{a.title}</p>
                                            <p className="text-xs text-slate-500">{a.courseTitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'grade' && (
                <div className="space-y-6">
                    {selectedSubmission ? (
                        <div className="relative p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-2xl animate-in zoom-in-95 duration-300">
                            {/* Écran de succès */}
                            {gradeSuccess && (
                                <div className="absolute inset-0 z-20 bg-emerald-500/10 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 border border-emerald-500/50">
                                    <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <p className="text-emerald-400 font-black tracking-widest uppercase text-lg">Correction Publiée</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-tight">{selectedSubmission.assignmentTitle || selectedSubmission.title}</h3>
                                    <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">Étudiant: {selectedSubmission.studentName || selectedSubmission.studentId}</p>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition tracking-tight shrink-0">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-4 tracking-widest">Travail Rendu</p>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedSubmission.submissionContent || "Fichier joint (non géré dans cet aperçu)"}</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Évaluation</p>
                                    <button 
                                        onClick={handleAIGrade}
                                        disabled={isGeneratingAI}
                                        className="h-8 px-4 bg-primary/20 text-primary border border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:bg-primary hover:text-black disabled:opacity-50 transition"
                                    >
                                        {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                                        {isGeneratingAI ? "Génération en cours..." : "Générer une correction IA (Mathias)"}
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input 
                                        type="number"
                                        placeholder="Note /20"
                                        min="0" max="20"
                                        className="w-full md:w-32 bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-center font-black text-xl text-white focus:ring-1 focus:ring-primary"
                                        value={grade}
                                        onChange={e => setGrade(e.target.value)}
                                    />
                                    <textarea 
                                        placeholder="Feedbacks et retours pour l'étudiant..."
                                        className="flex-1 bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white resize-none focus:ring-1 focus:ring-primary"
                                        rows={3}
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={handleGrade}
                                    disabled={!grade || isGrading || gradeSuccess}
                                    className="w-full h-14 bg-green-500 text-[#0f172a] font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-green-400 disabled:opacity-50 transition"
                                >
                                    {isGrading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Valider la note <CheckCircle size={16} /></>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* EN ATTENTE */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest border-b border-white/5 pb-2">À Corriger ({pendingSubmissions.length})</h3>
                                {isLoadingSubmissions ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                    </div>
                                ) : pendingSubmissions.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-dashed border-white/10">
                                        <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/50 mb-2" />
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tout est corrigé</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingSubmissions.map(sub => (
                                            <div key={sub.id} className="p-4 bg-[#1e293b] rounded-2xl border border-primary/20 hover:border-primary/50 cursor-pointer transition animate-in slide-in-from-left-4" onClick={() => setSelectedSubmission(sub)}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{sub.assignmentTitle || sub.title}</p>
                                                        <p className="text-xs text-slate-400 mt-1">{sub.studentName || sub.studentId}</p>
                                                    </div>
                                                    <span className="bg-primary/20 text-primary text-[10px] font-black uppercase px-2 py-1 rounded">Nouveau</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* DEJA CORRIGES */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest border-b border-white/5 pb-2">Historique Corrigé ({gradedSubmissions.length})</h3>
                                <div className="space-y-3">
                                    {gradedSubmissions.slice(0, 50).map(sub => (
                                        <div key={sub.id} className="p-4 bg-slate-900 rounded-2xl border border-white/5 opacity-70">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-300 text-sm">{sub.assignmentTitle || sub.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{sub.studentName || sub.studentId}</p>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    <span className="text-green-500 font-black bg-green-500/10 px-2 py-1 rounded-md">{sub.grade}/20</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


