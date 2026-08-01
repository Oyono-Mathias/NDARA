const fs = require('fs');

let quizEditor = fs.readFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', 'utf8');
quizEditor = quizEditor.replace(/\{\/\* @ts-ignore \*\/\}\n/g, ''); // revert
// We can just add key?: string to QuestionBuilderProps
let builder = fs.readFileSync('src/components/instructor/quiz/editor/QuestionBuilder.tsx', 'utf8');
builder = builder.replace(/interface QuestionBuilderProps \{/, 'interface QuestionBuilderProps {\n  key?: string | number;');
fs.writeFileSync('src/components/instructor/quiz/editor/QuestionBuilder.tsx', builder);
fs.writeFileSync('src/components/instructor/quiz/editor/QuizEditor.tsx', quizEditor);
