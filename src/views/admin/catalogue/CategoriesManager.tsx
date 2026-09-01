import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LayoutList, Plus } from 'lucide-react';

export const CategoriesManager: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500">Gérez l'arborescence du catalogue.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" /> Nouvelle Catégorie
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <LayoutList className="w-5 h-5 text-gray-400" />
            <span className="font-bold text-gray-900">Développement Web</span>
          </div>
          <div className="p-4 flex items-center gap-3">
            <LayoutList className="w-5 h-5 text-gray-400" />
            <span className="font-bold text-gray-900">Business & Marketing</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
