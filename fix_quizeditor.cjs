const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', 'utf8');

// replace the manual question rendering with QuestionBuilder
code = code.replace(
  /\{quiz\.questions\?\.map\(\(q, idx\) => \([\s\S]*?\}\)\)/,
  `{quiz.questions?.map((q, idx) => (
              <QuestionBuilder 
                key={q.id || idx} 
                question={q} 
                index={idx} 
                updateQuestion={updateQuestion} 
                removeQuestion={removeQuestion} 
              />
            ))}`
);

// add import for QuestionBuilder
if (!code.includes('QuestionBuilder')) {
  code = code.replace(/import \{ TopAppBar \}/, 'import { QuestionBuilder } from "./QuestionBuilder";\nimport { TopAppBar }');
}

fs.writeFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', code);
