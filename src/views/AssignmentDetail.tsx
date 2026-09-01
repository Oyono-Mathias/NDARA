import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';

export const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for UI representation
  const assignment = {
    id,
    title: 'Créer un landing page en React',
    description: 'Vous devez créer une page d\'accueil pour un produit SaaS fictif. Utilisez React et Tailwind CSS. Assurez-vous que le design est responsive.',
    dueDate: '2026-09-01',
    status: 'pending' // pending, submitted, graded
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulation
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Note : Le système backend de soumission des devoirs n\'est pas encore implémenté.');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link to="/assignments" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux devoirs
      </Link>

      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900">{assignment.title}</h1>
        
        <Card className="border-none shadow-sm ring-1 ring-gray-100">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 text-gray-900">Consignes</h2>
            <div className="prose prose-blue text-gray-600">
              <p>{assignment.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-gray-50">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 text-gray-900">Soumettre votre travail</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Glissez-déposez votre fichier ici, ou cliquez pour sélectionner</p>
              <p className="text-xs text-gray-400 mb-6">Formats acceptés : .zip, .pdf (Max 10MB)</p>
              <Button variant="outline">Sélectionner un fichier</Button>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
              <div className="text-xs text-orange-600 font-medium flex items-center bg-orange-50 px-3 py-1.5 rounded-lg w-full sm:w-auto">
                <AlertCircle className="w-4 h-4 mr-2" />
                La soumission réelle est désactivée.
              </div>
              <Button 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le devoir'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
