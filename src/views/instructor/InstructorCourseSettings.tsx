import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const InstructorCourseSettings: React.FC = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState('private');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to={`/instructor/courses/${courseId}/edit`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'édition
      </Link>
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Paramètres généraux</h1>
        <p className="text-sm text-gray-500">Configuration avancée du cours.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibilité du cours</label>
            <select 
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="private">Privé (Accessible uniquement sur invitation)</option>
              <option value="public">Public (Visible dans le catalogue)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Options pédagogiques</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">Délivrer un certificat à la fin</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">Activer les commentaires et Q&A</span>
              </label>
            </div>
          </div>

          <div className="pt-6">
            <Button variant="primary" fullWidth className="py-4 text-lg" onClick={handleSave} disabled={loading}>
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...</> : 'Sauvegarder les paramètres'}
            </Button>
          </div>

        </CardContent>
      </Card>
      
      <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-800">Zone de danger</p>
          <p className="text-xs text-red-700 mt-1 mb-3">La suppression du cours est irréversible et retirera l'accès aux étudiants actuels.</p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-2">
            Supprimer ce cours
          </Button>
        </div>
      </div>
    </div>
  );
};
