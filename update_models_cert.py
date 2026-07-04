with open('src/types/models.ts', 'r') as f:
    content = f.read()

new_models = """
export interface Certificate extends BaseModel {
  studentId: string;
  courseId: string;
  issuedAt: number;
  certificateNumber: string;
  pdfUrl?: string;
}

export interface QuizResult extends BaseModel {
  studentId: string;
  quizId: string;
  courseId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  completedAt: number;
}
"""

if "export interface Certificate" not in content:
    content += new_models

with open('src/types/models.ts', 'w') as f:
    f.write(content)
