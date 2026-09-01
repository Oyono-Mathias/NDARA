import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, ShieldCheck } from 'lucide-react';

export const InstructorProfile: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Profil Public</h1>
        <p className="text-sm text-gray-500">Gérez comment les étudiants vous voient.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="h-32 bg-slate-900 w-full relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-14 p-6 space-y-6">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'affichage</label>
              <input 
                type="text" 
                defaultValue="Mathias O."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Spécialité</label>
              <input 
                type="text" 
                defaultValue="Expert React & Développeur Fullstack"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
              <textarea 
                rows={4}
                defaultValue="Passionné par le code et l'enseignement, j'aide les développeurs à maîtriser les technologies modernes."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <Button variant="primary" fullWidth className="py-4 text-lg mt-4">
              Enregistrer le profil
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex items-start gap-2 text-xs text-gray-400 justify-center">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <p>Les données sensibles de votre compte sont gérées dans les paramètres globaux sécurisés.</p>
      </div>
    </div>
  );
};
