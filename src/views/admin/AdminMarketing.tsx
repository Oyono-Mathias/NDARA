import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { TrendingUp, Megaphone } from 'lucide-react';

export const AdminMarketing: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Marketing & Stats</h1>
        <p className="text-sm text-gray-500">Données de démonstration fournies par le serveur.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Conversion</span>
            </div>
            <p className="text-3xl font-black text-gray-900">4.2%</p>
            <p className="text-xs text-gray-500 mt-1">Sur les 7 derniers jours</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <Megaphone className="w-5 h-5" />
              <span className="text-sm font-medium">Campagnes actives</span>
            </div>
            <p className="text-3xl font-black text-gray-900">2</p>
            <p className="text-xs text-gray-500 mt-1">Coupons génériques</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
