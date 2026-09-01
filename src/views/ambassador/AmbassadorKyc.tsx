import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ShieldAlert, CheckCircle2, Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

type KycStatus = 'not_started' | 'pending' | 'validated' | 'rejected';

export const AmbassadorKyc: React.FC = () => {
  const [status, setStatus] = useState<KycStatus>('not_started');
  const [loading, setLoading] = useState(false);

  const handleSubmitIntent = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('pending');
      alert("Demande de vérification préparée (Action en attente du serveur). Le frontend ne déclare pas le KYC validé de lui-même.");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Vérification KYC</h1>
        <p className="text-sm text-gray-500">Statut et soumission de vos documents partenaires.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les uploads sont simulés et aucune donnée sensible n'est transmise dans cette vue de démonstration.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className={`p-3 rounded-full ${status === 'validated' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              {status === 'validated' ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Statut de vérification</h3>
              <p className="text-sm font-medium mt-1">
                {status === 'not_started' && <span className="text-gray-500">Non commencé</span>}
                {status === 'pending' && <span className="text-orange-600">En attente de revue administrative</span>}
                {status === 'validated' && <span className="text-green-600">KYC Validé (Officiel)</span>}
              </p>
            </div>
          </div>

          {status === 'not_started' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Pièce d'identité (CNI, Passeport)</p>
                  <p className="text-xs text-gray-500">Format PDF ou Image (.jpg, .png)</p>
                </div>
                <Button variant="outline" className="shrink-0" disabled={loading}>
                  <Upload className="w-4 h-4 mr-2" /> Mock Upload
                </Button>
              </div>

              <div className="pt-4">
                <Button 
                  variant="primary" 
                  onClick={handleSubmitIntent} 
                  disabled={loading} 
                  className="w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShieldAlert className="w-5 h-5 mr-2" />}
                  Soumettre pour vérification
                </Button>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <p className="text-sm text-gray-600">
              Vos documents sont en cours de validation par notre équipe. Vous recevrez une notification dès que le statut changera.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
