import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { MessageCircleQuestion, Send, Loader2, CheckCircle2 } from 'lucide-react';

export function QnaClient() {
    const { currentUser } = useRole();
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Interactions state
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");
    const [loadingAnsweringId, setLoadingAnsweringId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?.uid) return;
        setIsLoading(true);

        const q = query(
            collection(db, 'course_qna'), 
            where('instructorId', '==', currentUser.uid),
            limit(50)
        );
        
        const unsub = onSnapshot(q, snap => {
            const qs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Tri local pour eviter l'erreur d'index composite manquant
            qs.sort((a: any, b: any) => {
                const dA = a.createdAt?.toMillis?.() || 0;
                const dB = b.createdAt?.toMillis?.() || 0;
                return dB - dA;
            });
            setQuestions(qs);
            setIsLoading(false);
        });
        
        return () => unsub();
    }, [currentUser?.uid]);

    const handleSendAnswer = async (questionId: string) => {
        if (!answerText.trim() || !questionId) return;
        
        setLoadingAnsweringId(questionId);
        try {
            await updateDoc(doc(db, 'course_qna', questionId), {
                answer: answerText,
                isAnswered: true,
                answeredAt: new Date()
            });
            setAnswerText("");
            setAnsweringId(null);
        } catch (error) {
            console.error("Error sending answer:", error);
        } finally {
            setLoadingAnsweringId(null);
        }
    };

    return (
        <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl mt-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            
            <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-primary" /> Questions & Réponses
            </h2>
            <p className="text-sm font-medium text-slate-400 mb-8 italic">Fil de discussion en direct ("Live Chat") avec vos étudiants.</p>
            
            {isLoading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="p-4 bg-[#0f172a] border border-white/5 rounded-2xl animate-pulse">
                            <div className="h-4 bg-white/10 w-1/4 rounded mb-2"></div>
                            <div className="h-3 bg-white/5 w-3/4 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 bg-[#0f172a] rounded-2xl border border-dashed border-white/10">
                   <MessageCircleQuestion className="h-10 w-10 text-slate-500 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucune question pour l'instant</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map(q => (
                        <div key={q.id} className="p-4 bg-[#0f172a] border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-sm text-white">{q.studentName || 'Étudiant Anonyme'}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{q.courseTitle}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${q.isAnswered ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                                    {q.isAnswered ? 'Résolue' : 'En attente'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-4 bg-white/5 p-3 rounded-xl border-l-2 border-slate-500">{q.question}</p>
                            
                            {!q.isAnswered ? (
                                answeringId === q.id ? (
                                    <div className="flex gap-2 animate-in fade-in-50">
                                        <input 
                                            autoFocus
                                            className="flex-1 bg-[#1e293b] border border-primary/30 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600"
                                            placeholder="Tapez votre réponse en direct..."
                                            value={answerText}
                                            onChange={(e) => setAnswerText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer(q.id)}
                                        />
                                        <button 
                                            onClick={() => handleSendAnswer(q.id)}
                                            disabled={!answerText.trim() || loadingAnsweringId === q.id}
                                            className="h-10 px-4 bg-primary text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition disabled:opacity-50"
                                        >
                                            {loadingAnsweringId === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send size={16} /> Envoyer</>}
                                        </button>
                                        <button 
                                            onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                                            className="h-10 px-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setAnsweringId(q.id)}
                                        className="text-xs font-bold uppercase tracking-widest text-primary hover:text-emerald-400 flex items-center gap-1 transition"
                                    >
                                        <Send size={14} /> Répondre à l'étudiant
                                    </button>
                                )
                            ) : q.needsValidation ? (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-black uppercase tracking-widest">
                                                Généré par Mathias IA
                                            </span>
                                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                                                Nécessite votre validation
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-300">{q.answer}</p>
                                    
                                    {answeringId === q.id ? (
                                        <div className="flex gap-2 mt-3 animate-in fade-in-50">
                                            <input 
                                                autoFocus
                                                className="flex-1 bg-[#1e293b] border border-primary/30 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600"
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                            />
                                            <button 
                                                onClick={async () => {
                                                    setLoadingAnsweringId(q.id);
                                                    await updateDoc(doc(db, 'course_qna', q.id), {
                                                        answer: answerText,
                                                        needsValidation: false,
                                                        validatedByInstructor: true
                                                    });
                                                    setAnsweringId(null);
                                                    setLoadingAnsweringId(null);
                                                }}
                                                disabled={!answerText.trim() || loadingAnsweringId === q.id}
                                                className="px-4 py-2 bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs rounded-xl"
                                            >
                                                Mettre à jour
                                            </button>
                                            <button onClick={() => setAnsweringId(null)} className="px-3 py-2 bg-slate-800 rounded-xl text-white">Annuler</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={async () => {
                                                    await updateDoc(doc(db, 'course_qna', q.id), {
                                                        needsValidation: false,
                                                        validatedByInstructor: true
                                                    });
                                                }}
                                                className="px-3 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-emerald-500/30 transition flex items-center gap-1"
                                            >
                                                <CheckCircle2 className="w-3 h-3" /> Valider
                                            </button>
                                            <button 
                                                onClick={() => { setAnsweringId(q.id); setAnswerText(q.answer); }}
                                                className="px-3 py-2 bg-slate-800 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-700 transition"
                                            >
                                                Modifier
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">
                                            {q.generatedBy === 'MathiasIA' && q.validatedByInstructor ? "Réponse IA Validée" : "Votre réponse (Transmise en temps réel)"}
                                        </p>
                                        <p className="text-sm text-slate-300">{q.answer}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
