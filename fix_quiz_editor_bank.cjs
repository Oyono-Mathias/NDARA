const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', 'utf8');

if (!code.includes('QuestionBankModal')) {
  code = code.replace(
    /import \{ QuestionBuilder \} from "\.\/QuestionBuilder";/,
    'import { QuestionBuilder } from "./QuestionBuilder";\nimport { QuestionBankModal } from "./QuestionBankModal";\nimport { BookOpen } from "lucide-react";'
  );

  code = code.replace(
    /const \[isSaving, setIsSaving\] = useState\(false\);/,
    'const [isSaving, setIsSaving] = useState(false);\n  const [isBankOpen, setIsBankOpen] = useState(false);'
  );

  code = code.replace(
    /Questions \(\{quiz\.questions\?\.length \|\| 0\}\)\n          <\/button>/,
    `Questions ({quiz.questions?.length || 0})
          </button>`
  );

  // Add the "Banque" button next to "Paramètres" in tabs
  code = code.replace(
    /<button \n            onClick=\{\(\) => setActiveTab\('settings'\)\}/,
    `<button 
            onClick={() => setIsBankOpen(true)}
            className="pb-4 px-4 text-sm font-bold uppercase tracking-wider border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 ml-auto flex items-center gap-2"
          >
            <BookOpen size={16} /> Banque
          </button>
          <button 
            onClick={() => setActiveTab('settings')}`
  );

  // Add the modal rendering at the end of the component
  code = code.replace(
    /    <\/div>\n  \);\n\}\n$/,
    `      {isBankOpen && (
        <QuestionBankModal 
          onClose={() => setIsBankOpen(false)}
          currentQuestions={quiz.questions || []}
          onImport={(imported) => {
            setQuiz(prev => ({ ...prev, questions: [...(prev.questions || []), ...imported] }));
          }}
        />
      )}
    </div>
  );
}
`
  );

  fs.writeFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', code);
}
