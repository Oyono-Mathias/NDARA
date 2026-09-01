import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { UsersRound, Plus, Settings } from 'lucide-react';

export const AdminSquads: React.FC = () => {
  

  const squads = [
    { id: 's1', name: 'Support Technique N1', members: 5 },
    { id: 's2', name: 'Validation Contenu', members: 3 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Squads Administratives</h1>
          <p className="text-sm text-gray-500">Groupes de gestion et modération.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" /> Nouvelle Squad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {squads.map(squad => (
          <Card key={squad.id} className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <UsersRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{squad.name}</h3>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1" aria-label="Paramètres">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{squad.members} membres actifs</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
