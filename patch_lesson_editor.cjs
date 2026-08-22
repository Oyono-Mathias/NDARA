const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/course-content/LessonEditor.tsx', 'utf8');

// Add Quiz fields
// Wait, I will just use a simple regex replacement for the missing parts

// Description is needed for Document
code = code.replace(
  /\{type === 'document' && \([\s\S]*?\}\)/,
  `{type === 'document' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">URL du document (PDF, etc.)</label>
                <input type="text" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Description courte</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
            </div>
          )}`
);

// Quiz editor
const quizEditor = `
          {type === 'quiz' && (
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm leading-relaxed">
                <strong>Format du Quiz :</strong> Entrez les questions au format JSON ou texte libre structuré dans le contenu.
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Contenu du Quiz (Questions/Réponses)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder={\`[\n  {\n    "question": "Quelle est la capitale ?",\n    "options": ["Paris", "Londres"],\n    "correct": 0\n  }\n]\`} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs resize-none" />
              </div>
            </div>
          )}
`;

code = code.replace(
  /\{type === 'text' && \(/,
  `${quizEditor}\n          {type === 'text' && (`
);

fs.writeFileSync('src/components/instructor/course-content/LessonEditor.tsx', code);
