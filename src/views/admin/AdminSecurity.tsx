import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { ShieldAlert, Key, AlertTriangle } from 'lucide-react';

export const AdminSecurity: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Sécurité & Contrôle</h1>
        <p className="text-sm text-gray-500">Supervision des règles de sécurité et accès (Lecture seule).</p>
      </div>

      <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-sm text-red-800">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="font-medium">
          Ce tableau de bord ne contient aucune clé secrète. Toute modification des règles de sécurité Firebase nécessite un déploiement via Firebase CLI ou une API backend sécurisée. Le frontend ne peut pas altérer la sécurité.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-lg">Journaux d'Audit</h3>
            </div>
            <p className="text-sm text-gray-500">Les logs d'authentification et de transactions sont gérés par Google Cloud Logging.</p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">admin@example.com</span>
                <span className="text-gray-400">Il y a 2h</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">Modification de rôle</span>
                <span className="text-gray-400">Il y a 5h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <Key className="w-6 h-6 text-orange-600" />
              <h3 className="font-bold text-lg">MFA (Multi-Factor)</h3>
            </div>
            <p className="text-sm text-gray-500">
              La double authentification administrative est configurée au niveau de Firebase Auth. L'interface client ne gère pas ce paramètre directement.
            </p>
            <div className="flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
              <span>Statut des règles Firestore</span>
              <span>Enforcer: Actif</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
