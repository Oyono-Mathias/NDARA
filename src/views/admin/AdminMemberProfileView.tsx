import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, User, ShieldAlert, Ban, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const AdminMemberProfileView: React.FC = () => {
  const { memberId } = useParams();
  const [loading, setLoading] = useState(false);
  const [intentMessage, setIntentMessage] = useState('');

  const handleAction = (actionName: string) => {
    setLoading(true);
    setIntentMessage('');
    setTimeout(() => {
      setLoading(false);
      setIntentMessage(`Intention serveur enregistrée : ${actionName} (En attente du backend)`);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/admin/members" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux membres
      </Link>
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Profil Membre (ID: {memberId || 'N/A'})</h1>
        <p className="text-sm text-gray-500">Vue administrative restreinte.</p>
      </div>

      {intentMessage && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium">
          {intentMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900">Utilisateur Demo</h2>
                  <p className="text-gray-500">demo@example.com</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Rôle actuel</p>
                  <p className="font-medium text-gray-900">Étudiant</p>
                </div>
                <div>
                  <p className="text-gray-500">Statut KYC</p>
                  <p className="font-medium text-gray-900">Non soumis</p>
                </div>
                <div>
                  <p className="text-gray-500">Inscription</p>
                  <p className="font-medium text-gray-900">01 Jan 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm ring-1 ring-red-100 bg-red-50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Actions Sensibles
              </h3>
              <p className="text-xs text-red-800">
                Toute action ici requiert une Cloud Function et ne modifie pas Firestore directement depuis le client.
              </p>
              <Button 
                variant="outline" 
                className="w-full text-red-700 border-red-200 hover:bg-red-100"
                onClick={() => handleAction('Suspension de compte')}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                Suspendre le compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
