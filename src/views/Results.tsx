import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Trophy, XCircle } from 'lucide-react';

export const Results: React.FC = () => {
  const location = useLocation();
  // Utilisation d'un score mock si la page est chargée directement
  const state = (location.state as { score?: number, total?: number }) || { score: 85, total: 100 };
  
  const score = state.score || 0;
  const isPassed = score >= 70; // Seuil de passage arbitraire pour la démo

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center">
        <div className={`pt-12 pb-8 px-6 ${isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
            {isPassed ? (
              <Trophy className="w-12 h-12 text-yellow-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isPassed ? 'Félicitations !' : 'Oups...'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isPassed ? 'Vous avez réussi l\'évaluation.' : 'Vous n\'avez pas atteint le seuil requis.'}
          </p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Votre score</p>
            <div className="flex items-end justify-center gap-1">
              <span className={`text-6xl font-black tracking-tighter ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {score}
              </span>
              <span className="text-2xl text-gray-400 font-bold mb-1">/ 100</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {isPassed && (
              <Button variant="primary" fullWidth className="py-4">
                Voir mon certificat
              </Button>
            )}
            <Link to="/courses" className="block w-full">
              <Button variant={isPassed ? "outline" : "primary"} fullWidth className="py-4">
                {isPassed ? 'Retour au catalogue' : 'Réessayer'}
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-gray-400 mt-6">
            Note: Les résultats présentés ici ne sont pas définitifs tant qu'ils ne sont pas validés par le serveur.
          </p>
        </div>
      </div>
    </div>
  );
};
