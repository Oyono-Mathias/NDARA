import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Download, AlertCircle } from 'lucide-react';

export const OfflineDownloads: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Download className="w-6 h-6 text-gray-900" />
        <h1 className="text-2xl font-extrabold text-gray-900">Téléchargements Offline</h1>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les téléchargements sécurisés nécessitent une URL signée par le serveur backend. Aucun accès direct au stockage n'est autorisé depuis le client.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200 border-dashed">
        <CardContent className="p-12 text-center text-gray-500 flex flex-col items-center">
          <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>Aucun contenu téléchargé pour le moment.</p>
        </CardContent>
      </Card>
    </div>
  );
};
