import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Award, Star, Trophy, Loader2, ShieldCheck } from 'lucide-react';

interface Reward {
  id: string;
  type: 'badge' | 'bonus' | 'status';
  title: string;
  description: string;
  value: string;
  status: 'earned' | 'locked';
  date?: string;
}

export const AmbassadorRewards: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setRewards([
        { id: 'rew_1', type: 'status', title: 'Ambassadeur Or', description: 'Statut atteint après 50 parrainages actifs.', value: 'Niveau 3', status: 'earned', date: '2026-08-01' },
        { id: 'rew_2', type: 'bonus', title: 'Bonus de Croissance', description: 'Atteignez 100k XAF générés ce mois.', value: '10000 XAF', status: 'locked' },
        { id: 'rew_3', type: 'badge', title: 'Premier Sang', description: 'Votre première commission validée.', value: 'Badge', status: 'earned', date: '2026-01-15' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Récompenses</h1>
        <p className="text-sm text-gray-500">Vos accomplissements et statuts validés par le système.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map(reward => (
            <Card key={reward.id} className={`border-none shadow-sm ring-1 transition-all ${reward.status === 'earned' ? 'ring-yellow-200 bg-gradient-to-br from-yellow-50 to-white' : 'ring-gray-100 bg-gray-50 opacity-75'}`}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${reward.status === 'earned' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                    {reward.type === 'status' ? <Trophy className="w-6 h-6" /> : reward.type === 'bonus' ? <Star className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                  </div>
                  {reward.status === 'earned' && (
                    <div className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                      Obtenu
                    </div>
                  )}
                </div>
                
                <h3 className={`font-bold text-lg ${reward.status === 'earned' ? 'text-gray-900' : 'text-gray-600'}`}>{reward.title}</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4 flex-1">{reward.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                  <span className="font-bold text-gray-900">{reward.value}</span>
                  {reward.status === 'earned' && reward.date && (
                    <span className="text-xs text-gray-400">{new Date(reward.date).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 mt-8">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Les récompenses et bonus financiers sont accordés automatiquement par le backend lors du calcul mensuel. Aucune action manuelle n'est requise.
        </p>
      </div>
    </div>
  );
};
