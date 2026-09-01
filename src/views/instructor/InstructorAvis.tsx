import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Star, Loader2, Shield } from 'lucide-react';

export const InstructorAvis: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Avis & Évaluations</h1>
        <p className="text-sm text-gray-500">Découvrez ce que les étudiants pensent de vos cours.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-slate-900 text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Note moyenne globale</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black">4.8</span>
              <div className="flex text-yellow-400">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current opacity-50" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="w-4 h-4 shrink-0" />
        <p>Les notes sont immuables et garanties par l'intégrité du backend Firestore.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3].map((avis) => (
            <Card key={avis} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Élève Anonyme {avis}</h3>
                    <p className="text-xs text-gray-500">Sur: React Avancé • Il y a 2 jours</p>
                  </div>
                  <div className="flex text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <p className="text-sm text-gray-700">"Excellent cours, très bien expliqué ! J'ai pu trouver un emploi juste après."</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
