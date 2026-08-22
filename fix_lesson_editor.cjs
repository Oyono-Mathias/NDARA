const fs = require('fs');
const file = 'src/components/instructor/course-content/LessonEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [duration,')) {
    code = code.replace(
        "const [documentUrl, setDocumentUrl] = useState(lesson.documentUrl || '');",
        "const [documentUrl, setDocumentUrl] = useState(lesson.documentUrl || '');\n  const [description, setDescription] = useState(lesson.description || '');\n  const [duration, setDuration] = useState(lesson.duration || 0);"
    );

    code = code.replace(
        "documentUrl,",
        "documentUrl,\n        description,\n        duration: Number(duration) || 0,"
    );
    
    code = code.replace(
        /\{\(type === 'text' \|\| type === 'video'\) && \([\s\S]*?<\/div>\s*\)\}/,
        `{type === 'text' && (
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block">Contenu textuel de la leçon</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white resize-none" />
            </div>
          )}
          {type === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Description courte</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Durée (en secondes)</label>
                <input type="number" min="0" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>
          )}`
    );
    fs.writeFileSync(file, code);
}
