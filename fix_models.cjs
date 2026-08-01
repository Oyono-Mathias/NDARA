const fs = require('fs');
let code = fs.readFileSync('src/types/models.ts', 'utf8');

const newQuizStr = `export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false' | 'short_answer' | 'long_answer' | 'order' | 'drag_drop' | 'match' | 'fill_blank';
  text: string;
  options: { id: string; text: string; isCorrect: boolean; matchId?: string; order?: number }[];
  explanation?: string;
  hint?: string;
  timeLimit?: number;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
}

export interface Quiz extends BaseModel {
  courseId: string;
  courseTitle?: string;
  instructorId: string;
  lessonId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  questions: QuizQuestion[];
  settings: {
    durationMinutes?: number;
    singleAttempt?: boolean;
    passingScore?: number;
    randomOrder?: boolean;
    immediateFeedback?: boolean;
    showAnswers?: boolean;
    autoCertificate?: boolean;
  };
}`;

code = code.replace(/export interface Quiz extends BaseModel \{[\s\S]*?\n\}/, newQuizStr);
fs.writeFileSync('src/types/models.ts', code);
