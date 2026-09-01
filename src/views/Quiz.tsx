import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { HelpCircle, Clock, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Quiz: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Mock data
  const quizzes = [
    { id: 'q1', title: 'Test de connaissances : React Hooks', questions: 10, time: 15, course: 'Développement Web' },
    { id: 'q2', title: 'Évaluation finale : Marketing Digital', questions: 30, time: 45, course: 'Marketing' },
  ];

  if (!isAuthenticated) return <div className="p-8 text-center text-gray-500">Connexion requise</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Quiz & Évaluations</h1>
        <p className="text-gray-500 mt-2">Testez vos connaissances et validez vos acquis.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{quiz.course}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex-1">{quiz.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center"><HelpCircle className="w-4 h-4 mr-1.5" /> {quiz.questions} questions</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {quiz.time} min</div>
              </div>
              
              <Link to={`/quiz/${quiz.id}/player`}>
                <Button variant="primary" fullWidth>
                  <Play className="w-4 h-4 mr-2" /> Démarrer le quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
