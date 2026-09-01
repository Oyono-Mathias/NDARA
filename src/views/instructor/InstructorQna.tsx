import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageSquare, Loader2, Check } from 'lucide-react';

interface Question {
  id: string;
  student: string;
  course: string;
  question: string;
  date: string;
  answered: boolean;
}

export const InstructorQna: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setQuestions([
        { id: 'q1', student: 'Paul', course: 'React Avancé', question: 'Comment gérer le state global sans Redux ?', date: '2026-08-28', answered: false },
        { id: 'q2', student: 'Marie', course: 'Firebase Pro', question: 'Les règles Firestore sont-elles rétroactives ?', date: '2026-08-27', answered: true },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Questions & Réponses</h1>
        <p className="text-sm text-gray-500">Interagissez avec vos étudiants.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <Card key={q.id} className={`border-none shadow-sm ring-1 ${q.answered ? 'ring-gray-100 bg-gray-50' : 'ring-orange-200 bg-white'}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${q.answered ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-600'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-gray-500 mb-1">{q.student} • {q.course}</p>
                      {q.answered && <Check className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className={`text-sm ${q.answered ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{q.question}</p>
                    
                    {!q.answered && (
                      <div className="mt-4">
                        <textarea 
                          rows={2} 
                          placeholder="Votre réponse..." 
                          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-2"
                        />
                        <Button variant="primary" className="text-sm py-2">Envoyer la réponse</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
