import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { ShieldCheck, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/button';

export const Bourse: React.FC = () => {
  const licenses = [
    { id: 'lic_1', title: 'Licence Standard', description: 'Accès basique à la bourse d\'opportunités.', price: 10000, isActive: true },
    { id: 'lic_2', title: 'Licence Premium', description: 'Accès prioritaire et outils d\'analyse avancés.', price: 25000, isActive: true },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Bourse & Licences</h1>
        <p className="text-gray-500 text-lg">Acquérez une licence pour accéder aux opportunités professionnelles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {licenses.map(lic => (
          <Card key={lic.id} className="border-none shadow-sm ring-1 ring-gray-200 hover:ring-blue-500 transition-all flex flex-col">
            <CardContent className="p-8 flex flex-col flex-1">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{lic.title}</h2>
              <p className="text-gray-600 mb-8 flex-1">{lic.description}</p>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-4xl font-black text-gray-900">{lic.price}</span>
                <span className="text-gray-500 font-medium mb-1">FCFA / an</span>
              </div>
              
              <Link to={`/bourse/licenses/${lic.id}`} className="block w-full">
                <Button variant="outline" fullWidth className="py-4">
                  Voir les détails
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-2xl p-6 text-center text-sm text-gray-500 flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 mr-2 text-gray-400" />
        Tous les achats sont sécurisés et soumis à validation du réseau.
      </div>
    </div>
  );
};
