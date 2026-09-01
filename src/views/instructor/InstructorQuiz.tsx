import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { HelpCircle, Plus, AlertCircle } from 'lucide-react';

export const InstructorQuiz: React.FC = () => {
  const [questions] = useState([
    { id: 'q1', text: 'Qu\'est ce que le Virtual DOM ?', options: ['Un objet JS', 'Une base de données', 'Un navigateur'], correct: 0 }
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Gestion des Quiz</h1>
          <p className="text-sm text-gray-500">Créez des évaluations pour vos modules.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto py-3">
          <Plus className="w-5 h-5 mr-2" /> Nouveau Quiz
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-blue-800 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les bonnes réponses configurées ici sont stockées côté serveur. Les résultats finaux des étudiants sont calculés de manière sécurisée par le backend pour éviter toute triche.</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">Question {idx + 1}: {q.text}</h3>
              </div>
              <div className="space-y-2 ml-8">
                {q.options.map((opt, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${i === q.correct ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    {opt} {i === q.correct && '(Bonne réponse)'}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
