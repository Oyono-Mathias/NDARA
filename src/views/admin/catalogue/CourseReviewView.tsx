import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export const CourseReviewView: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleAction = (decision: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Décision : ${decision} - Transmis au backend.`);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Revue du Cours</h1>
        <p className="text-sm text-gray-500">Validation administrative avant publication globale.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>L'approbation ici déclenche une Cloud Function qui modifie le statut officiel du cours.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Checklist qualité</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Médias conformes</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Structure validée</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
            <Button variant="primary" onClick={() => handleAction('Approuver')} disabled={loading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Approuver
            </Button>
            <Button variant="outline" onClick={() => handleAction('Rejeter')} disabled={loading} className="w-full sm:w-auto text-red-600 border-red-200">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />} Rejeter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
