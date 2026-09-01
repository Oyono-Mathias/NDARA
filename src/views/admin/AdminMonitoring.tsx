import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Activity, Server, Database, Globe, Loader2, AlertCircle } from 'lucide-react';

export const AdminMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Monitoring & Santé</h1>
        <p className="text-sm text-gray-500">Supervision technique des services (Informatif).</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Toutes les métriques ci-dessous sont des données de démonstration. L'état réel dépend de la connexion Firebase/GCP.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <Server className="w-5 h-5" />
                <span className="text-sm font-medium">Cloud Functions</span>
              </div>
              <p className="text-2xl font-black text-gray-900">Opérationnel</p>
              <p className="text-xs text-gray-500 mt-1">99.9% Uptime</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <Database className="w-5 h-5" />
                <span className="text-sm font-medium">Firestore</span>
              </div>
              <p className="text-2xl font-black text-gray-900">42 ms</p>
              <p className="text-xs text-gray-500 mt-1">Latence moyenne</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-orange-600 mb-2">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium">Erreurs (24h)</span>
              </div>
              <p className="text-2xl font-black text-gray-900">12</p>
              <p className="text-xs text-gray-500 mt-1">Erreurs non critiques</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">Trafic Actif</span>
              </div>
              <p className="text-2xl font-black text-gray-900">148</p>
              <p className="text-xs text-gray-500 mt-1">Utilisateurs connectés</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
