import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';

interface Props {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export const PricingCard: React.FC<Props> = ({ title, price, features, isPopular }) => {
  return (
    <Card className={`border-none shadow-sm ring-1 ${isPopular ? 'ring-blue-500 scale-105 bg-blue-50/10' : 'ring-gray-200 bg-white'}`}>
      <CardContent className="p-6 sm:p-8 flex flex-col h-full relative">
        {isPopular && <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">Recommandé</div>}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="mb-6">
          <span className="text-4xl font-black text-gray-900">{price}</span>
          {price !== 'Gratuit' && price !== 'Sur mesure' && <span className="text-gray-500">/mois</span>}
          <p className="text-xs text-gray-400 mt-1">*Prix indicatif, soumis au serveur</p>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm text-gray-600">{f}</span>
            </li>
          ))}
        </ul>
        <Button variant={isPopular ? 'primary' : 'outline'} className="w-full py-3">
          Choisir cette offre
        </Button>
      </CardContent>
    </Card>
  );
};
