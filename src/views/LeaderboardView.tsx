import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Trophy, AlertCircle } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const users = [
    { id: 1, name: 'Anonyme***1', score: 9850 },
    { id: 2, name: 'Anonyme***2', score: 8720 },
    { id: 3, name: 'Anonyme***3', score: 7600 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900">Classement Public</h1>
        <p className="text-gray-500 mt-2">Les meilleurs contributeurs de la plateforme.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Ce classement affiche des données de démonstration. Aucune donnée privée n'est exposée.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-0">
          {users.map((u, i) => (
            <div key={u.id} className={`flex justify-between items-center p-4 sm:p-6 ${i !== users.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-4">
                <span className={`font-bold text-lg ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-900'}`}>
                  #{i + 1}
                </span>
                <span className="font-medium text-gray-900">{u.name}</span>
              </div>
              <span className="font-black text-blue-600">{u.score} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
