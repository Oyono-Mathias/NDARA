import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Flag, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export const AdminModeration: React.FC = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const reports = [
    { id: 'r1', type: 'Commentaire', user: 'User 123', reason: 'Spam', status: 'pending' },
    { id: 'r2', type: 'Cours', user: 'Instructor ABC', reason: 'Contenu inapproprié', status: 'pending' },
  ];

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      alert(`Intention enregistrée : ${action} pour le signalement ${id}. En attente du backend.`);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Modération</h1>
        <p className="text-sm text-gray-500">Traitement des signalements utilisateurs.</p>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les données sont mockées. L'action de modération nécessite une exécution côté serveur pour impacter la visibilité globale.</p>
      </div>

      <div className="space-y-4">
        {reports.map(report => (
          <Card key={report.id} className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Signalement: {report.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">Cible : <span className="font-medium">{report.user}</span></p>
                  <p className="text-sm text-gray-600">Raison : <span className="text-red-600 font-medium">{report.reason}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                  disabled={loadingId === report.id}
                  onClick={() => handleAction(report.id, 'reject')}
                >
                  {loadingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />} 
                  Supprimer contenu
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none text-green-600 border-green-200 hover:bg-green-50"
                  disabled={loadingId === report.id}
                  onClick={() => handleAction(report.id, 'approve')}
                >
                  {loadingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Ignorer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
