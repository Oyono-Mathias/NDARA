const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', 'utf8');

code = code.replace(
  /<div className="flex gap-2">[\s\S]*?<\/div>/,
  `<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button onClick={() => addQuestion('single')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <CheckCircle2 size={16} /> Choix Unique
              </button>
              <button onClick={() => addQuestion('multiple')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <List size={16} /> Choix Multiples
              </button>
              <button onClick={() => addQuestion('true_false')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <CheckCircle2 size={16} /> Vrai / Faux
              </button>
              <button onClick={() => addQuestion('short_answer')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <Plus size={16} /> Rép. Courte
              </button>
              <button onClick={() => addQuestion('long_answer')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <Plus size={16} /> Rép. Longue
              </button>
              <button onClick={() => addQuestion('order')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <List size={16} /> Ordonner
              </button>
              <button onClick={() => addQuestion('match')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <List size={16} /> Associer
              </button>
              <button onClick={() => addQuestion('fill_blank')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <Plus size={16} /> Compléter
              </button>
            </div>`
);

fs.writeFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', code);
