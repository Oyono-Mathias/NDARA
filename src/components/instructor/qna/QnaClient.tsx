import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { MessageCircleQuestion, Send } from 'lucide-react';

export function QnaClient() {
    const { currentUser } = useRole();
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(collection(db, 'course_qna'), where('instructorId', '==', currentUser.uid));
        const unsub = onSnapshot(q, snap => {
            setQuestions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [currentUser?.uid]);

    return (
        <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl mt-6">
            <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">Questions & Réponses</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 italic">Répondez aux questions posées par vos étudiants dans les cours.</p>
            
            {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 bg-[#0f172a] rounded-2xl border border-dashed border-white/10">
                   <MessageCircleQuestion className="h-10 w-10 text-slate-500 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucune question pour l'instant</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map(q => (
                        <div key={q.id} className="p-4 bg-[#0f172a] border border-white/10 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-sm text-white">{q.studentName || 'Étudiant Anonyme'}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{q.courseTitle}</p>
                                </div>
                                <span className={q.isAnswered ? "text-emerald-500 text-[10px] font-bold uppercase" : "text-amber-500 text-[10px] font-bold uppercase"}>
                                    {q.isAnswered ? 'Répondu' : 'En attente'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-4">{q.question}</p>
                            
                            {!q.isAnswered ? (
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-[#1e293b] border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-slate-600"
                                        placeholder="Votre réponse..."
                                    />
                                    <button className="h-10 px-4 bg-primary text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition">
                                        <Send size={16} /> Envoyer
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">Votre réponse :</p>
                                    <p className="text-sm text-slate-300">{q.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
