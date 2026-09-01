import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white py-20 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          La plateforme <span className="text-blue-500">Ndara</span> pour apprendre et créer.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Découvrez notre écosystème e-learning, marketplace et services numériques intégrés.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button variant="primary" className="w-full sm:w-auto py-4 px-8 text-lg">
            Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="outline" className="w-full sm:w-auto py-4 px-8 text-lg border-gray-600 text-white hover:bg-gray-800 hover:text-white">
            <PlayCircle className="w-5 h-5 mr-2" /> Voir la démo
          </Button>
        </div>
      </div>
    </div>
  );
};
