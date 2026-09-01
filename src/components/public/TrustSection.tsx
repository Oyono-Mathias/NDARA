import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <div className="py-20 px-4 max-w-4xl mx-auto text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Sécurité et Confiance</h2>
        <p className="text-gray-500">Nous utilisons une architecture cloud moderne pour protéger vos données.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-green-50 text-green-600 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-gray-900">Transactions sécurisées</h4>
          <p className="text-sm text-gray-500 mt-2">Validation backend par Cloud Functions</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-gray-900">Protection des données</h4>
          <p className="text-sm text-gray-500 mt-2">Accès restreint par les règles Firestore</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-gray-900">Qualité du contenu</h4>
          <p className="text-sm text-gray-500 mt-2">Processus de vérification des instructeurs</p>
        </div>
      </div>
    </div>
  );
};
