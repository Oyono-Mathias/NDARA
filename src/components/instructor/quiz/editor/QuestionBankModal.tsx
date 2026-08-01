import { logger } from '../../../../lib/logger';
import { useConfirm } from '../../../../components/ui/ConfirmDialog';
import { toast } from '../../../../hooks/use-toast';
import React from 'react';
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useRole } from "../../../../context/RoleContext";
import { QuizQuestion, QuestionBankItem } from "../../../../types/models";
import { X, Search, Plus, Filter, BookOpen, Copy, Eye } from "lucide-react";

interface QuestionBankModalProps {
  onClose: () => void;
  onImport: (questions: QuizQuestion[]) => void;
  currentQuestions: QuizQuestion[];
}

export function QuestionBankModal({ onClose, onImport, currentQuestions }: QuestionBankModalProps) {
  const confirm = useConfirm();

  const { currentUser: instructor } = useRole();
  const [bankQuestions, setBankQuestions] = useState<QuestionBankItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!instructor?.uid) return;
    const fetchBank = async () => {
      const q = query(collection(db, "question_bank"), where("instructorId", "==", instructor.uid));
      const snap = await getDocs(q);
      setBankQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionBankItem)));
    };
    fetchBank();
  }, [instructor?.uid]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleImport = () => {
    const selected = bankQuestions.filter(q => selectedIds.has(q.id)).map(q => {
      // Remove bank-specific fields
      const { instructorId, category, tags, createdAt, id, ...rest } = q as any;
      return { ...rest, id: Date.now().toString() + Math.random() } as QuizQuestion;
    });
    onImport(selected);
    onClose();
  };

  
  const handleDuplicate = async (e: React.MouseEvent, q: QuestionBankItem) => {
      e.stopPropagation();
      e.preventDefault();
      if (!instructor?.uid) return;
      try {
          const { id, createdAt, ...rest } = q as any;
          await addDoc(collection(db, "question_bank"), {
             ...rest,
             text: rest.text + " (Copie)",
             createdAt: serverTimestamp()
          });
          // Optimistic update
          setBankQuestions(prev => [{...rest, text: rest.text + " (Copie)", id: Date.now().toString()} as QuestionBankItem, ...prev]);
      } catch(err) {
          logger.error(err);
      }
  };

  const handleSaveToBank = async () => {
    if (!instructor?.uid || currentQuestions.length === 0) return;
    if (!(await confirm(`Sauvegarder les ${currentQuestions.length} questions actuelles dans la banque ?`))) return;
    
    try {
      for (const q of currentQuestions) {
        await addDoc(collection(db, "question_bank"), {
          ...q,
          instructorId: instructor.uid,
          category: "Général",
          tags: [],
          createdAt: serverTimestamp()
        });
      }
      toast({ title: 'Information', description: String("Questions sauvegardées dans la banque !") });
      onClose();
    } catch (e) {
      logger.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: String("Erreur de sauvegarde.") });
    }
  };

  const filtered = bankQuestions.filter(q => 
    (q.text.toLowerCase().includes(searchTerm.toLowerCase()) || q.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === "" || q.category === categoryFilter)
  );

  const categories = Array.from(new Set(bankQuestions.map(q => q.category).filter(Boolean)));

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] w-full max-w-4xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" />
            <h2 className="text-xl font-black text-white">Banque de Questions</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6 border-b border-white/5 flex gap-4 bg-[#1e293b]">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full bg-[#0f172a] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary border border-white/5"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleSaveToBank} className="px-4 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-700 transition">
            Exporter act. ({currentQuestions.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#0f172a]">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-12">Aucune question trouvée.</div>
          ) : (
            
            filtered.map(q => (
              <div key={q.id} className={`flex flex-col rounded-2xl border transition ${selectedIds.has(q.id) ? 'border-primary bg-primary/5' : 'border-white/5 bg-[#1e293b] hover:border-white/10'}`}>
                <label className="flex items-start gap-4 p-4 cursor-pointer w-full">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(q.id)}
                    onChange={() => toggleSelect(q.id)}
                    className="mt-1 w-5 h-5 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{q.type.replace('_', ' ')}</span>
                      {q.category && <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5">{q.category}</span>}
                      {q.difficulty && <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${q.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-400' : q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{q.difficulty}</span>}
                    </div>
                    <p className="text-white font-medium">{q.text}</p>
                    
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {q.tags.map(t => <span key={t} className="text-[9px] bg-[#0f172a] text-slate-500 px-1.5 py-0.5 rounded uppercase">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewId(previewId === q.id ? null : q.id); }} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition" title="Aperçu">
                        <Eye size={16}/>
                     </button>
                     <button onClick={(e) => handleDuplicate(e, q)} className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-lg transition" title="Dupliquer">
                        <Copy size={16}/>
                     </button>
                  </div>
                </label>
                {previewId === q.id && (
                   <div className="p-4 bg-[#0f172a] border-t border-white/5 rounded-b-2xl">
                      <p className="text-sm text-slate-400 mb-2 font-bold uppercase tracking-widest text-[10px]">Options de réponse :</p>
                      <ul className="space-y-1">
                         {q.options?.map((opt: any, i: number) => (
                            <li key={i} className={`text-sm ${opt.isCorrect ? 'text-primary font-bold' : 'text-slate-300'}`}>
                               {opt.isCorrect && "✓ "} {opt.text} {opt.matchId && ` -> ${opt.matchId}`}
                            </li>
                         ))}
                      </ul>
                      {q.explanation && <p className="mt-3 text-sm text-slate-500 bg-slate-800 p-2 rounded-lg"><span className="font-bold">Explication:</span> {q.explanation}</p>}
                   </div>
                )}
              </div>
            ))

          )}
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#1e293b]">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-400 font-bold text-sm hover:text-white">Annuler</button>
          <button 
            onClick={handleImport}
            disabled={selectedIds.size === 0}
            className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} /> Importer ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}
