import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Book, BookOpen, LayoutList } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCatalogView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Hub Catalogue</h1>
        <p className="text-sm text-gray-500">Gérez l'ensemble des contenus de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/catalog/courses">
          <Card className="border-none shadow-sm ring-1 ring-gray-200 hover:ring-blue-500 transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg text-gray-900">Cours</h3>
              <p className="text-sm text-gray-500 mt-1">Gérer les cours, validations et builders.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/catalog/ebooks">
          <Card className="border-none shadow-sm ring-1 ring-gray-200 hover:ring-blue-500 transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <Book className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-bold text-lg text-gray-900">E-books</h3>
              <p className="text-sm text-gray-500 mt-1">Gérer le catalogue numérique écrit.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/catalog/categories">
          <Card className="border-none shadow-sm ring-1 ring-gray-200 hover:ring-blue-500 transition-all cursor-pointer md:col-span-2">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                <LayoutList className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Catégories & Taxonomie</h3>
                <p className="text-sm text-gray-500">Structurer l'arborescence du catalogue.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
