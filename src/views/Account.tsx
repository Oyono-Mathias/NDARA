import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, ShieldAlert } from 'lucide-react';

export const Account: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mon Compte</h1>
        <p className="text-sm text-gray-500">Gérez vos informations personnelles.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">Utilisateur Authentifié</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> user@example.com</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <Button variant="outline" className="w-full sm:w-auto">Modifier le profil</Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les mots de passe et données sensibles ne sont jamais affichés ici. Toute modification critique nécessitera une validation serveur.</p>
      </div>
    </div>
  );
};
