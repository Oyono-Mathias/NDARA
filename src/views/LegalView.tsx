import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Scale } from 'lucide-react';

export const LegalView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-xl">
          <Scale className="w-8 h-8 text-gray-700" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mentions Légales</h1>
          <p className="text-gray-500 mt-1">Conditions d'utilisation et confidentialité.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Conditions Générales d'Utilisation</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              [Placeholder] Ces conditions régissent l'accès et l'utilisation de la plateforme Ndara et du portefeuille OmPay. 
              En utilisant nos services, vous acceptez ces conditions dans leur intégralité.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Politique de Confidentialité</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              [Placeholder] Nous nous engageons à protéger vos données personnelles. Les données financières sont traitées 
              conformément aux normes de sécurité en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Règles de la Plateforme</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              [Placeholder] Les instructeurs sont responsables de la qualité de leurs contenus. Tout comportement frauduleux 
              entraînera la suspension du compte.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
