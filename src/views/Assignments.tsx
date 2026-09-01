import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Assignments: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Mock data for UI representation
  const assignments = [
    { id: 'a1', title: 'Créer un landing page en React', course: 'Développement Web', status: 'pending', dueDate: '2026-09-01' },
    { id: 'a2', title: 'Analyse SWOT d\'une startup', course: 'Business', status: 'submitted', dueDate: '2026-08-15' },
    { id: 'a3', title: 'Audit SEO', course: 'Marketing', status: 'graded', score: 18, dueDate: '2026-07-20' },
  ];

  if (!isAuthenticated) return <div className="p-8 text-center text-gray-500">Connexion requise</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Mes Devoirs</h1>
        <p className="text-gray-500 mt-2">Suivez vos travaux pratiques et évaluations.</p>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{assignment.course}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{assignment.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1.5" /> À rendre avant le {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="px-5 pb-5 sm:p-5 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-gray-50 sm:border-t-0 sm:border-l sm:w-48 bg-gray-50/50">
                  <div className="mb-0 sm:mb-3">
                    {assignment.status === 'pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">À faire</span>}
                    {assignment.status === 'submitted' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Soumis</span>}
                    {assignment.status === 'graded' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Noté: {assignment.score}/20
                      </span>
                    )}
                  </div>
                  <Link to={`/assignments/${assignment.id}`}>
                    <Button variant={assignment.status === 'pending' ? 'primary' : 'outline'} className="text-sm">
                      {assignment.status === 'pending' ? 'Commencer' : 'Voir'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
