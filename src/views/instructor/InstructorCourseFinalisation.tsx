import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const InstructorCourseFinalisation: React.FC = () => {
  const { courseId } = useParams();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  // Mock checklist
  const checklist = [
    { label: 'Informations de base complètes', passed: true },
    { label: 'Au moins un module et une leçon', passed: true },
    { label: 'Miniature uploadée', passed: false },
    { label: 'Prix défini', passed: true },
  ];

  const allPassed = checklist.every(c => c.passed);

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to={`/instructor/courses/${courseId}/edit`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'édition
      </Link>
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Finalisation et Publication</h1>
        <p className="text-sm text-gray-500">Vérifiez les prérequis avant de publier votre cours.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Checklist de publication</h3>
          
          <div className="space-y-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                <span className={`text-sm ${item.passed ? 'text-gray-700' : 'text-red-700 font-medium'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {!allPassed && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Vous devez compléter tous les prérequis avant de pouvoir soumettre le cours à la publication.</p>
            </div>
          )}

          {published ? (
            <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center space-y-3 border border-green-100">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-bold">Demande de publication envoyée</p>
              <p className="text-sm">Votre cours est en cours de révision par l'équipe administrative (Action Serveur).</p>
            </div>
          ) : (
            <Button 
              variant="primary" 
              fullWidth 
              className="py-4 text-lg mt-4"
              disabled={!allPassed || publishing}
              onClick={handlePublish}
            >
              {publishing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Soumission en cours...</> : 'Soumettre pour publication'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
