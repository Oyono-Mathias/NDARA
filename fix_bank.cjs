const fs = require('fs');

// Add QuestionBankItem to models
let codeModels = fs.readFileSync('src/types/models.ts', 'utf8');
if (!codeModels.includes('QuestionBankItem')) {
  const bankStr = `export interface QuestionBankItem extends QuizQuestion {
  instructorId: string;
  category: string;
  tags: string[];
  createdAt: any;
}\n\nexport interface QuizQuestion`;
  codeModels = codeModels.replace('export interface QuizQuestion', bankStr);
  fs.writeFileSync('src/types/models.ts', codeModels);
}

// Add collection to rules
let codeRules = fs.readFileSync('firestore.rules', 'utf8');
if (!codeRules.includes('match /question_bank/')) {
  const rulesStr = `    match /question_bank/{id} {
      allow create: if isAuthenticated() && (isAdmin() || request.auth.uid == request.resource.data.instructorId);
      allow update, delete: if isAuthenticated() && (isAdmin() || request.auth.uid == resource.data.instructorId);
      allow read: if isAuthenticated() && (isAdmin() || request.auth.uid == resource.data.instructorId);
    }
    match /courses/`;
  codeRules = codeRules.replace('    match /courses/', rulesStr);
  fs.writeFileSync('firestore.rules', codeRules);
}
