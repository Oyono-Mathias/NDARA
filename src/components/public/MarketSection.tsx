import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ArrowRight } from 'lucide-react';

export const MarketSection: React.FC = () => {
  return (
    <div className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Marché & Cours</h2>
            <p className="text-gray-500 mt-2">Découvrez les contenus populaires (données mockées).</p>
          </div>
          <button className="text-blue-600 font-bold flex items-center hover:underline">
            Voir tout <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-none shadow-sm ring-1 ring-gray-200">
              <div className="h-48 bg-slate-200 rounded-t-xl"></div>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">Cours Démo {i}</h3>
                <p className="text-sm text-gray-500 mb-3">Par Formateur Anonyme</p>
                <div className="flex justify-between items-center">
                  <span className="font-black text-blue-600">15 000 XAF</span>
                  <span className="text-xs text-gray-400">Prix indicatif</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
