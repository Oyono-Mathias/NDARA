import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Bell, Info, Loader2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [loading] = useState(false);
  const notifications = [
    { id: 1, title: 'Bienvenue sur Ndara', message: 'Découvrez notre catalogue de cours.', time: 'Il y a 2h', isRead: false },
    { id: 2, title: 'Paiement confirmé', message: 'Votre achat est validé (Simulation).', time: 'Il y a 1j', isRead: true },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-gray-900" />
        <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <Card key={n.id} className={`border-none shadow-sm ring-1 ${n.isRead ? 'ring-gray-100 bg-white' : 'ring-blue-200 bg-blue-50'}`}>
              <CardContent className="p-4 flex gap-4">
                <Info className={`w-5 h-5 mt-0.5 shrink-0 ${n.isRead ? 'text-gray-400' : 'text-blue-500'}`} />
                <div>
                  <h3 className={`font-bold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{n.time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
