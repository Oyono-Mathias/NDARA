import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Book, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const EbooksManager: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Gestion des E-books</h1>
          <p className="text-sm text-gray-500">Catalogue de lecture.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" /> Nouvel E-book
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Maîtriser TypeScript</h3>
              <p className="text-sm text-gray-500">Auteur : Inconnu</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Publié</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
