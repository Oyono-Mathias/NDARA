import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Video, Calendar, Plus, Loader2 } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'completed';
}

export const InstructorLiveSessions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setSessions([
        { id: 'sess_1', title: 'Q&A React Avancé', date: '2026-09-01T15:00:00Z', status: 'upcoming' },
        { id: 'sess_2', title: 'Webinaire de lancement', date: '2026-08-20T10:00:00Z', status: 'completed' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sessions Live</h1>
          <p className="text-sm text-gray-500">Programmez vos classes virtuelles.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto py-3">
          <Plus className="w-5 h-5 mr-2" /> Nouvelle session
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-gray-100">Aucune session programmée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(session => (
            <Card key={session.id} className={`border-none shadow-sm ring-1 ${session.status === 'upcoming' ? 'ring-blue-200 bg-white' : 'ring-gray-100 bg-gray-50'}`}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${session.status === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                    {session.status === 'upcoming' ? 'À venir' : 'Terminé'}
                  </span>
                </div>
                
                <h3 className={`font-bold text-lg mb-2 flex-1 ${session.status === 'completed' ? 'text-gray-600' : 'text-gray-900'}`}>{session.title}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(session.date).toLocaleString('fr-FR')}</span>
                </div>

                {session.status === 'upcoming' ? (
                  <Button variant="primary" fullWidth>Lancer la session</Button>
                ) : (
                  <Button variant="outline" fullWidth disabled>Session terminée</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-center text-gray-400 mt-4">* L'intégration de liens vidéos réels requiert un service tiers autorisé.</p>
    </div>
  );
};
