import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Settings, Loader2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Intention de sauvegarde enregistrée.');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Paramètres Généraux</h1>
        <p className="text-sm text-gray-500">Configuration de l'instance administrative.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Préférences de l'interface
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">Activer les notifications sonores</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Mode sombre (Expérimental)</span>
              </label>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer les préférences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
