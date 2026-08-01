const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/quiz/QuizPageClient.tsx', 'utf8');

if (!code.includes('QuizSubmissions')) {
  code = code.replace(
    /import \{ QuizEditor \} from "\.\/editor\/QuizEditor";/,
    'import { QuizEditor } from "./editor/QuizEditor";\nimport { QuizSubmissions } from "./QuizSubmissions";'
  );

  code = code.replace(
    /const \[editingCourseTitle, setEditingCourseTitle\] = useState<string>\(""\);/,
    'const [editingCourseTitle, setEditingCourseTitle] = useState<string>("");\n  const [viewingSubmissionsQuizId, setViewingSubmissionsQuizId] = useState<string | null>(null);'
  );

  code = code.replace(
    /<button onClick=\{\(\) => handleEdit\(quiz\)\} className="p-1\.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition"><Edit2 size=\{14\}\/><\/button>/,
    `<button onClick={() => setViewingSubmissionsQuizId(quiz.id)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-emerald-400 transition" title="Voir les copies"><Eye size={14}/></button>
                  <button onClick={() => handleEdit(quiz)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition" title="Éditer"><Edit2 size={14}/></button>`
  );

  code = code.replace(
    /if \(isEditorOpen\) \{/,
    `if (viewingSubmissionsQuizId) {
    return <QuizSubmissions quizId={viewingSubmissionsQuizId} onClose={() => setViewingSubmissionsQuizId(null)} />;
  }

  if (isEditorOpen) {`
  );

  fs.writeFileSync('src/components/instructor/quiz/QuizPageClient.tsx', code);
}
