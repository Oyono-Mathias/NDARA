import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export const PricingCard: React.FC<Props> = ({ title, price, features, isPopular }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={`h-full border-none shadow-sm ring-1 ${isPopular ? 'ring-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'ring-slate-200 bg-white'}`}>
        <CardContent className="p-8 flex flex-col h-full relative">
          {isPopular && (
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
              Recommandé
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
          
          <div className="mb-8">
            <span className="text-4xl font-bold tracking-tight text-slate-900">{price}</span>
            {price !== 'Gratuit' && price !== 'Sur mesure' && <span className="text-slate-500 font-medium">/mois</span>}
            <p className="text-xs text-slate-400 mt-2">*Tarification indicative</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm text-slate-600 leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className={`w-full min-h-[48px] font-medium ${
              isPopular 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            variant={isPopular ? 'primary' : 'outline'}
          >
            Sélectionner
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
