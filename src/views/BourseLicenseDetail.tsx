import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Shield, Check } from 'lucide-react';

export const BourseLicenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <Link to="/bourse" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux licences
      </Link>

      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-200 p-6 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Licence {id === 'lic_2' ? 'Premium' : 'Standard'}</h1>
          <Shield className="w-10 h-10 text-blue-600" />
        </div>

        <p className="text-lg text-gray-600 mb-8">
          Idéale pour les professionnels souhaitant développer leur réseau et accéder à des offres exclusives.
        </p>

        <div className="space-y-4 mb-10">
          {[
            'Accès à l\'annuaire complet',
            'Participation aux appels d\'offres',
            'Support client prioritaire',
            'Badge vérifié sur votre profil'
          ].map((feature, i) => (
            <div key={i} className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Prix de la licence</p>
              <p className="text-3xl font-black text-gray-900">
                {id === 'lic_2' ? '25000' : '10000'} FCFA
              </p>
            </div>
            <Link to="/checkout" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full py-4 px-8 text-lg rounded-xl">
                Souscrire maintenant
              </Button>
            </Link>
          </div>
          <p className="text-xs text-center sm:text-left text-gray-400 mt-4">
            Note: Le prix affiché ici est informatif. La transaction finale sera validée côté serveur.
          </p>
        </div>
      </div>
    </div>
  );
};
