import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Book, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const EbookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  // Mock data since E-book schema might not be finalized in DB
  const mockEbook = { 
    id, 
    title: 'Guide de l\'entrepreneur africain', 
    description: 'Un guide complet pour démarrer et faire croître votre entreprise sur le continent, avec des études de cas réelles et des outils pratiques.',
    author: 'Aminata Diallo', 
    price: 5000, 
    pages: 142,
    format: 'PDF',
    size: '4.2 MB'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/ebooks" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la bibliothèque
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm ring-1 ring-gray-100 flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/3 shrink-0">
          <div className="w-full aspect-[3/4] bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
            <Book className="w-24 h-24 text-blue-200" />
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{mockEbook.title}</h1>
            <p className="text-lg text-gray-500">par {mockEbook.author}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="font-medium text-gray-900">{mockEbook.pages}</span> pages
            </div>
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              Format <span className="font-medium text-gray-900">{mockEbook.format}</span>
            </div>
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="font-medium text-gray-900">{mockEbook.size}</span>
            </div>
          </div>

          <div className="prose prose-blue text-gray-600">
            <p>{mockEbook.description}</p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="text-3xl font-extrabold text-gray-900">
                {mockEbook.price} FCFA
              </div>
              
              {!isAuthenticated ? (
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" fullWidth>Se connecter pour acheter</Button>
                </Link>
              ) : (
                <div className="w-full sm:w-auto flex flex-col items-center">
                  <Button variant="primary" fullWidth className="py-6 px-8 text-lg rounded-xl">
                    Acheter maintenant
                  </Button>
                  <div className="flex items-center text-xs text-orange-600 mt-2 font-medium bg-orange-50 px-2 py-1 rounded">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Le paiement n'est pas encore disponible
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
