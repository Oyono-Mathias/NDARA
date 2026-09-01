import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Bell, Loader2 } from 'lucide-react';

export const InstructorSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Paramètres Instructeur</h1>
        <p className="text-sm text-gray-500">Gérez vos préférences de notifications et d'affichage.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6 space-y-6">
          
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5" /> Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 mt-0.5 text-blue-600" defaultChecked />
                <div>
                  <span className="block text-sm font-medium text-gray-900">Nouvelles questions (Q&A)</span>
                  <span className="block text-xs text-gray-500">Soyez alerté lorsqu'un étudiant pose une question.</span>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 mt-0.5 text-blue-600" defaultChecked />
                <div>
                  <span className="block text-sm font-medium text-gray-900">Devoirs soumis</span>
                  <span className="block text-xs text-gray-500">Recevez un email lorsqu'un devoir attend votre correction.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Préférences globales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue de l'interface instructeur</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </div>
            </div>
          </div>

          <Button variant="primary" fullWidth className="py-4" onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sauvegarde...</> : 'Enregistrer les préférences'}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};
