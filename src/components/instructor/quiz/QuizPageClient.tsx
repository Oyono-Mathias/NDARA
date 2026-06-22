import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { CheckSquare, Plus, Save, ChevronDown, ListCheck, X } from 'lucide-react';

export function QuizPageClient() {
    const { currentUser: instructor } = useRole();
    const [courses, setCourses] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    
    // UI state
    const [isCreating, setIsCreating] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [quizTitle, setQuizTitle] = useState("");
    const [questions, setQuestions] = useState<{text: string, options: {text: string, isCorrect: boolean}[]}[]>([
        { text: "", options: [{text: "", isCorrect: true}, {text: "", isCorrect: false}] }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!instructor?.uid) return;

        // Fetch courses for dropdown
        const qCourses = query(collection(db, 'courses'), where('instructorId', '==', instructor.uid));
        const unsubCourses = onSnapshot(qCourses, (snap) => {
             setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch existing quizzes
        const qQuizzes = query(collectionGroup(db, 'quizzes'), where('instructorId', '==', instructor.uid));
        const unsubQuizzes = onSnapshot(qQuizzes, (snap) => {
             setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubCourses();
            unsubQuizzes();
        };
    }, [instructor?.uid]);

    const handleAddOption = (qIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.push({ text: "", isCorrect: false });
        setQuestions(newQ);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: "", options: [{text: "", isCorrect: true}, {text: "", isCorrect: false}] }]);
    };

    const handleSaveQuiz = async () => {
        if (!quizTitle.trim() || !selectedCourseId || !instructor?.uid) return;
        setIsSaving(true);
        try {
            const courseObj = courses.find(c => c.id === selectedCourseId);
            const quizRef = doc(collection(db, `courses/${selectedCourseId}/quizzes`));
            
            // Save metadata
            await setDoc(quizRef, {
                id: quizRef.id,
                title: quizTitle,
                courseId: selectedCourseId,
                courseTitle: courseObj?.title || 'Formation',
                instructorId: instructor.uid,
                createdAt: serverTimestamp(),
            });

            // Save questions in subcollection
            for (let i = 0; i < questions.length; i++) {
                const qRef = doc(collection(quizRef, 'questions'));
                await setDoc(qRef, {
                    id: qRef.id,
                    text: questions[i].text,
                    options: questions[i].options,
                    order: i
                });
            }

            // Reset
            setIsCreating(false);
            setQuizTitle("");
            setSelectedCourseId("");
            setQuestions([{ text: "", options: [{text: "", isCorrect: true}, {text: "", isCorrect: false}] }]);
        } catch (error: any) {
            console.error("Erreur lors de la création du quiz:", error);
            alert("Erreur lors de la création : " + (error.message || "Permissions insuffisantes."));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 mt-4">
            {!isCreating ? (
                <>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="w-full md:w-auto h-12 px-6 bg-primary text-[#0f172a] font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition shadow-xl"
                    >
                        <Plus className="h-4 w-4" /> Créer un nouveau Quiz
                    </button>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.length === 0 ? (
                            <div className="col-span-full p-12 text-center bg-[#1e293b]/40 rounded-[2rem] border border-dashed border-white/10">
                                <ListCheck className="mx-auto h-12 w-12 text-slate-500 opacity-50 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun quiz existant</p>
                            </div>
                        ) : (
                            quizzes.map(quiz => (
                                <div key={quiz.id} className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 shadow-xl hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                                     <h3 className="font-black text-white uppercase tracking-tight text-lg leading-tight mb-2">{quiz.title}</h3>
                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{quiz.courseTitle}</p>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4 relative">
                    <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition">
                        <X size={18} />
                    </button>
                    
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Nouveau Quiz</h2>
                    
                    <div className="max-w-3xl space-y-8">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Formation associée</label>
                                <select 
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/50"
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="">-- Choisir une formation --</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Titre du Quiz</label>
                                <input 
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/50"
                                    placeholder="Ex: Évaluation Chapitre 1"
                                    value={quizTitle}
                                    onChange={e => setQuizTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-8">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">Questions <span className="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-1 rounded">{questions.length}</span></h3>
                            
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative">
                                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[#0f172a] font-black text-xs">{qIndex + 1}</span>
                                    
                                    <div className="space-y-4">
                                        <input 
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white font-bold focus:outline-none focus:border-primary transition"
                                            placeholder="Saisir la question ici..."
                                            value={q.text}
                                            onChange={e => {
                                                const nQ = [...questions];
                                                nQ[qIndex].text = e.target.value;
                                                setQuestions(nQ);
                                            }}
                                        />
                                        
                                        <div className="space-y-3 pt-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-2xl border ${opt.isCorrect ? 'border-primary/50 bg-primary/5' : 'border-slate-800 bg-slate-950'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name={`q_${qIndex}_correct`} 
                                                        checked={opt.isCorrect}
                                                        onChange={() => {
                                                            const nQ = [...questions];
                                                            nQ[qIndex].options.forEach(o => o.isCorrect = false);
                                                            nQ[qIndex].options[oIndex].isCorrect = true;
                                                            setQuestions(nQ);
                                                        }}
                                                        className="w-4 h-4 text-primary focus:ring-primary/50 accent-primary"
                                                    />
                                                    <input 
                                                        className="flex-1 bg-transparent text-sm focus:outline-none text-slate-300"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={opt.text}
                                                        onChange={e => {
                                                            const nQ = [...questions];
                                                            nQ[qIndex].options[oIndex].text = e.target.value;
                                                            setQuestions(nQ);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            
                                            <button 
                                                onClick={() => handleAddOption(qIndex)}
                                                className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1 hover:text-white transition mt-2 ml-1"
                                            >
                                                <Plus size={12} /> Ajouter une option
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={handleAddQuestion}
                                className="w-full h-14 border border-dashed border-slate-700 rounded-2xl text-slate-400 font-bold uppercase text-xs hover:border-primary/50 hover:text-primary transition"
                            >
                                + Nouvelle Question
                            </button>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                            <button onClick={() => setIsCreating(false)} className="px-6 h-14 bg-slate-900 rounded-2xl text-slate-400 font-bold uppercase text-xs hover:text-white transition">
                                Annuler
                            </button>
                            <button 
                                onClick={handleSaveQuiz}
                                disabled={!quizTitle || !selectedCourseId || isSaving}
                                className="px-8 h-14 bg-primary text-[#0f172a] rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition shadow-xl shadow-primary/20"
                            >
                                {isSaving ? "Enregistrement..." : <><Save size={16} /> Générer le Quiz</>}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
