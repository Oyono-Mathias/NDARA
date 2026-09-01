import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Store, AlertCircle } from 'lucide-react';

export const AdminMarketControl: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Contrôle du Marché</h1>
        <p className="text-sm text-gray-500">Gestion des prix et des licences.</p>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Le frontend ne fait jamais autorité sur les prix. Les modifications effectuées ici sont de pures intentions envoyées au backend.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-gray-900 mb-4">
            <Store className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-lg">Politique tarifaire globale</h3>
          </div>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission standard (%)</label>
              <input 
                type="number" 
                inputMode="numeric"
                defaultValue={30}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="w-full">Proposer mise à jour</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
