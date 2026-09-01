import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { User, BookOpen, Star } from 'lucide-react';

export const InstructorPublicProfile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="h-32 bg-slate-900 w-full relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
        <CardContent className="pt-16 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mathias O.</h1>
              <p className="text-gray-500">Instructeur Expert & Développeur</p>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-1 text-gray-700"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.9 (120 avis)</div>
              <div className="flex items-center gap-1 text-gray-700"><BookOpen className="w-4 h-4" /> 5 Cours</div>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            Passionné par le développement logiciel. Les informations de contact privées et les statistiques financières sont masquées pour des raisons de sécurité.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cours publiés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <div className="h-32 bg-gray-200 rounded-t-xl"></div>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900">Formation React Avancée</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
