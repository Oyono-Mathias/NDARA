import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Headphones, MessageSquare } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const tickets = [
    { id: 't1', user: 'Student A', subject: 'Problème de paiement', status: 'Ouvert', priority: 'Haute' },
    { id: 't2', user: 'Instructor B', subject: 'Bug vidéo', status: 'En cours', priority: 'Moyenne' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Support Client</h1>
        <p className="text-sm text-gray-500">Gestion des tickets et requêtes (Simulation).</p>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <Card key={ticket.id} className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">Utilisateur : {ticket.user}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">{ticket.priority}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">{ticket.status}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto self-start sm:self-center">
                <MessageSquare className="w-4 h-4 mr-2" /> Répondre
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
