import { QuizQuestion } from "../../../../types/models";
import { Trash2, X, Plus, GripVertical, Image as ImageIcon } from "lucide-react";

interface QuestionBuilderProps {
  key?: string | number;
  question: QuizQuestion;
  index: number;
  updateQuestion: (index: number, q: QuizQuestion) => void;
  removeQuestion: (index: number) => void;
}

export function QuestionBuilder({ question, index, updateQuestion, removeQuestion }: QuestionBuilderProps) {
  
  const handleTextChange = (text: string) => updateQuestion(index, { ...question, text });

  const renderOptions = () => {
    switch (question.type) {
      case 'true_false':
        return (
          <div className="flex gap-4">
            {question.options.map((opt, oIdx) => (
              <label key={opt.id} className={`flex-1 p-4 rounded-xl border cursor-pointer transition flex items-center justify-center gap-2 ${opt.isCorrect ? 'border-primary bg-primary/10 text-primary' : 'border-slate-800 bg-slate-900 text-slate-400'}`}>
                <input 
                  type="radio" 
                  name={`q_${question.id}_tf`} 
                  checked={opt.isCorrect}
                  onChange={() => {
                    const newOpts = question.options.map(o => ({ ...o, isCorrect: false }));
                    newOpts[oIdx].isCorrect = true;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  className="hidden"
                />
                <span className="font-bold">{opt.text}</span>
              </label>
            ))}
          </div>
        );
        
      case 'single':
      case 'multiple':
        const isMultiple = question.type === 'multiple';
        return (
          <div className="space-y-2 pl-4 border-l-2 border-slate-800">
            {question.options.map((opt, oIdx) => (
              <div key={opt.id} className="flex items-center gap-3">
                <input 
                  type={isMultiple ? "checkbox" : "radio"}
                  checked={opt.isCorrect}
                  name={isMultiple ? undefined : `q_${question.id}_opt`}
                  onChange={(e) => {
                    let newOpts = [...question.options];
                    if (!isMultiple) {
                      newOpts = newOpts.map(o => ({ ...o, isCorrect: false }));
                    }
                    newOpts[oIdx].isCorrect = e.target.checked;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  className="w-4 h-4 accent-primary"
                />
                <input 
                  value={opt.text}
                  onChange={e => {
                    const newOpts = [...question.options];
                    newOpts[oIdx].text = e.target.value;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  placeholder={`Option ${oIdx + 1}`}
                  className="flex-1 bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                />
                <button 
                  onClick={() => {
                    const newOpts = [...question.options];
                    newOpts.splice(oIdx, 1);
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  className="text-slate-600 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const newOpts = [...question.options];
                newOpts.push({ id: Date.now().toString(), text: "", isCorrect: false });
                updateQuestion(index, { ...question, options: newOpts });
              }}
              className="text-xs text-primary font-bold uppercase mt-2 hover:opacity-80"
            >
              + Ajouter option
            </button>
          </div>
        );

      case 'short_answer':
      case 'long_answer':
      case 'fill_blank':
        return (
          <div className="space-y-2 pl-4 border-l-2 border-slate-800">
            <label className="text-xs text-slate-500 font-bold uppercase">Réponse(s) correcte(s) acceptée(s) :</label>
             {question.options.map((opt, oIdx) => (
              <div key={opt.id} className="flex items-center gap-3">
                 <input 
                  value={opt.text}
                  onChange={e => {
                    const newOpts = [...question.options];
                    newOpts[oIdx].text = e.target.value;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  placeholder="Réponse exacte attendue"
                  className="flex-1 bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                />
                <button 
                  onClick={() => {
                    const newOpts = [...question.options];
                    newOpts.splice(oIdx, 1);
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  className="text-slate-600 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const newOpts = [...question.options];
                newOpts.push({ id: Date.now().toString(), text: "", isCorrect: true });
                updateQuestion(index, { ...question, options: newOpts });
              }}
              className="text-xs text-primary font-bold uppercase mt-2 hover:opacity-80"
            >
              + Ajouter réponse alternative
            </button>
            <p className="text-[10px] text-slate-500 mt-2">Pour "Compléter", utilisez ___ dans la question.</p>
          </div>
        );

      case 'order':
        return (
          <div className="space-y-2 pl-4 border-l-2 border-slate-800">
            <label className="text-xs text-slate-500 font-bold uppercase">Éléments dans le bon ordre :</label>
             {question.options.map((opt, oIdx) => (
              <div key={opt.id} className="flex items-center gap-3">
                 <div className="text-slate-600"><GripVertical size={16}/></div>
                 <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{oIdx + 1}</div>
                 <input 
                  value={opt.text}
                  onChange={e => {
                    const newOpts = [...question.options];
                    newOpts[oIdx].text = e.target.value;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  placeholder={`Élément ${oIdx + 1}`}
                  className="flex-1 bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                />
                <button 
                  onClick={() => {
                    const newOpts = [...question.options];
                    newOpts.splice(oIdx, 1);
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  className="text-slate-600 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const newOpts = [...question.options];
                newOpts.push({ id: Date.now().toString(), text: "", isCorrect: true, order: newOpts.length + 1 });
                updateQuestion(index, { ...question, options: newOpts });
              }}
              className="text-xs text-primary font-bold uppercase mt-2 hover:opacity-80"
            >
              + Ajouter élément
            </button>
          </div>
        );

      case 'match':
      case 'drag_drop':
        return (
           <div className="space-y-2 pl-4 border-l-2 border-slate-800">
            <label className="text-xs text-slate-500 font-bold uppercase">Paires (Élément {"->"} Correspondance) :</label>
             {question.options.map((opt, oIdx) => (
              <div key={opt.id} className="flex items-center gap-3">
                 <input 
                  value={opt.text}
                  onChange={e => {
                    const newOpts = [...question.options];
                    newOpts[oIdx].text = e.target.value;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  placeholder="Élément gauche"
                  className="flex-1 bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                />
                <span className="text-slate-500 text-xs">{"->"}</span>
                <input 
                  value={opt.matchId || ''}
                  onChange={e => {
                    const newOpts = [...question.options];
                    newOpts[oIdx].matchId = e.target.value;
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  placeholder="Élément droit"
                  className="flex-1 bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                />
                <button 
                  onClick={() => {
                    const newOpts = [...question.options];
                    newOpts.splice(oIdx, 1);
                    updateQuestion(index, { ...question, options: newOpts });
                  }}
                  className="text-slate-600 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const newOpts = [...question.options];
                newOpts.push({ id: Date.now().toString(), text: "", isCorrect: true, matchId: "" });
                updateQuestion(index, { ...question, options: newOpts });
              }}
              className="text-xs text-primary font-bold uppercase mt-2 hover:opacity-80"
            >
              + Ajouter paire
            </button>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-3xl border border-white/5 p-6 relative group mb-4">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button onClick={() => removeQuestion(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={16}/></button>
      </div>
      <div className="flex gap-4 items-start mb-6">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase font-black tracking-widest text-primary/80 px-2 py-1 bg-primary/10 rounded">Type: {question.type.replace('_', ' ')}</span>
          </div>
          
          <div className="flex gap-2 w-full">
            <input 
              value={question.text}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Votre question..."
              className="flex-1 bg-transparent border-b border-white/10 pb-2 text-lg text-white font-bold focus:outline-none focus:border-primary"
            />
            <button onClick={() => {
              const url = prompt('URL du média (image/video/audio) :');
              if (url) {
                updateQuestion(index, { ...question, media: { type: 'image', url } });
              }
            }} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
              <ImageIcon size={16} />
            </button>
          </div>
          {question.media && (
            <div className="relative inline-block mt-2">
              {question.media.type === 'image' && <img src={question.media.url} alt="Media" className="max-h-32 rounded-lg border border-white/10" />}
              <button onClick={() => updateQuestion(index, { ...question, media: undefined })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"><X size={12}/></button>
            </div>
          )}
          
          {renderOptions()}

          {/* Points & Explication */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
              <div>
              <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Points</label>
              <input type="number" value={question.points || 1} onChange={e => updateQuestion(index, { ...question, points: Number(e.target.value) })} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
              </div>
              <div>
              <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Difficulté</label>
              <select value={question.difficulty || 'medium'} onChange={e => updateQuestion(index, { ...question, difficulty: e.target.value as any })} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
              </div>
              <div>
              <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Indice (optionnel)</label>
              <input value={question.hint || ""} onChange={e => updateQuestion(index, { ...question, hint: e.target.value })} placeholder="Un petit indice..." className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
              </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Explication détaillée (affichée après correction)</label>
            <textarea value={question.explanation || ""} onChange={e => updateQuestion(index, { ...question, explanation: e.target.value })} placeholder="Explication après réponse..." className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white h-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
