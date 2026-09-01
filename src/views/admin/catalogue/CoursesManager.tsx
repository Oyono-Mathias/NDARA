import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { BookOpen, Search } from 'lucide-react';

export const CoursesManager: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Gestion des Cours</h1>
          <p className="text-sm text-gray-500">Vue d'ensemble du catalogue interactif.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher un cours..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">React pour les pros</h3>
              <p className="text-sm text-gray-500">Par Mathias O.</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">En attente de revue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
