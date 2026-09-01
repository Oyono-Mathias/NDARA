import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Search, Book, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EbookMarket: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock data for UI layout structure
  const mockEbooks = [
    { id: '1', title: 'Guide de l\'entrepreneur africain', author: 'Aminata Diallo', price: 5000, category: 'Business' },
    { id: '2', title: 'Apprendre React en 2026', author: 'Jean Dupont', price: null, category: 'Développement' },
    { id: '3', title: 'Design System avancé', author: 'Sarah Connor', price: 3000, category: 'Design' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">E-books</h1>
          <p className="text-gray-500 mt-1">Bibliothèque numérique et ressources téléchargeables.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            placeholder="Rechercher un e-book..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockEbooks.map((ebook) => (
          <Link key={ebook.id} to={`/ebooks/${ebook.id}`} className="group focus:outline-none">
            <Card className="flex flex-col h-full border-none shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-all group-hover:-translate-y-1">
              <div className="h-48 bg-blue-50 rounded-t-xl flex items-center justify-center p-4">
                <Book className="w-16 h-16 text-blue-200" />
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">{ebook.category}</div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600">{ebook.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{ebook.author}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="font-extrabold text-gray-900">
                    {ebook.price ? `${ebook.price} FCFA` : 'Gratuit'}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
