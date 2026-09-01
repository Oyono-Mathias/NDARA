import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

export const CourseBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Intention de sauvegarde du Builder envoyée (Action Serveur).');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Builder Administratif</h1>
        <p className="text-sm text-gray-500">Structure de secours pour éditer un cours.</p>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Le prix et la publication finale sont gérés uniquement côté serveur.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre (Override)</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix Server-Side (XAF)</label>
            <input type="number" inputMode="numeric" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
          </div>
          <Button variant="primary" onClick={handleSave} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Proposer modification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
