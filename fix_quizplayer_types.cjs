const fs = require('fs');
let code = fs.readFileSync('src/views/QuizPlayer.tsx', 'utf8');

const additionalImports = `import { ArrowUp, ArrowDown } from 'lucide-react';\n`;
if (!code.includes('ArrowUp')) {
    code = code.replace(/import \{ CheckCircle2/, additionalImports + 'import { CheckCircle2');
}

const renderReplacement = `
      case 'long_answer':
        return (
           <div className="mt-6">
             <textarea 
               value={ans || ''}
               onChange={e => handleAnswerChange(e.target.value)}
               placeholder="Détaillez votre réponse..."
               className="w-full bg-[#1e293b] border border-white/10 rounded-2xl p-6 text-lg text-white focus:outline-none focus:border-primary shadow-inner min-h-[150px]"
             />
           </div>
        );
      case 'order': {
        const items = ans || currentQuestion.options.map((o: any) => ({ id: o.id, text: o.text }));
        
        const moveItem = (idx: number, dir: number) => {
           const newItems = [...items];
           if (idx + dir < 0 || idx + dir >= newItems.length) return;
           const temp = newItems[idx];
           newItems[idx] = newItems[idx + dir];
           newItems[idx + dir] = temp;
           handleAnswerChange(newItems);
        };
        
        return (
           <div className="mt-6 space-y-3">
             {items.map((item: any, i: number) => (
                <div key={item.id} className="flex items-center gap-4 bg-[#1e293b] border border-white/5 p-4 rounded-xl">
                   <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowUp size={16}/></button>
                      <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowDown size={16}/></button>
                   </div>
                   <div className="font-bold text-lg text-slate-300">{item.text}</div>
                </div>
             ))}
           </div>
        );
      }
      case 'match':
      case 'drag_drop': {
         const leftItems = currentQuestion.options;
         // Generate scrambled right items once
         const [rightItems] = useState(() => [...currentQuestion.options.map((o: any) => ({ id: o.id, text: o.matchId }))].sort(() => Math.random() - 0.5));
         const pairs = ans || {}; // leftId -> rightId
         
         return (
            <div className="mt-6 space-y-4">
               {leftItems.map((left: any) => (
                  <div key={left.id} className="flex flex-col md:flex-row items-center gap-4">
                     <div className="w-full md:w-1/2 p-4 bg-[#1e293b] border border-white/5 rounded-xl font-bold text-slate-300">
                        {left.text}
                     </div>
                     <div className="text-slate-500 hidden md:block">{"->"}</div>
                     <select 
                        value={pairs[left.id] || ""}
                        onChange={(e) => handleAnswerChange({ ...pairs, [left.id]: e.target.value })}
                        className="w-full md:w-1/2 bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                     >
                        <option value="">Sélectionnez une correspondance...</option>
                        {rightItems.map((r: any, ri: number) => (
                           <option key={ri} value={r.id}>{r.text}</option>
                        ))}
                     </select>
                  </div>
               ))}
            </div>
         );
      }
`;

code = code.replace(/case 'long_answer':[\s\S]*?<\/div>\s*\);\s*(default:)/, renderReplacement + '\n      $1');

fs.writeFileSync('src/views/QuizPlayer.tsx', code);
