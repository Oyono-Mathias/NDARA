import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Briefcase, AlertCircle } from 'lucide-react';

export const GoogleWorkspaceTest: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-extrabold text-gray-900">Intégration Google Workspace</h1>
      </div>

      <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-sm text-red-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Sécurité stricte</p>
          <p className="mt-1">
            Aucun credential, clé API ou token n'est hardcodé ou stocké dans localStorage. L'authentification OAuth réelle nécessitera le flux Google Identity Services ou Firebase Auth complet configuré par le backend.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center py-12 text-gray-500 space-y-4">
          <Briefcase className="w-12 h-12 text-gray-300" />
          <p>Le module GWS n'est pas encore connecté à l'API officielle.</p>
        </CardContent>
      </Card>
    </div>
  );
};
