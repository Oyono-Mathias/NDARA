import React, { useState } from 'react';
import { useCatalogClient } from '../hooks/catalog/useCatalogClient';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/Skeleton';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Courses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { courses, loading, error, empty } = useCatalogClient(selectedCategory);

  const categories = ['Développement Web', 'Design', 'Marketing', 'Business'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Explorez nos formations</h1>
        <p className="text-lg text-gray-500">Développez de nouvelles compétences avec nos cours conçus par des experts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Rechercher un cours..."
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button 
            variant={!selectedCategory ? 'primary' : 'outline'} 
            onClick={() => setSelectedCategory(undefined)}
            className="whitespace-nowrap rounded-full"
          >
            Tous
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'outline'} 
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center">
          <p>{error.message}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm ring-1 ring-gray-100">
              <div className="h-48 bg-gray-100" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : empty ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Aucun cours trouvé</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Nous n'avons pas trouvé de cours correspondant à vos critères actuels.</p>
          <Button variant="outline" className="mt-6" onClick={() => setSelectedCategory(undefined)}>
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="group focus:outline-none">
              <Card className="flex flex-col h-full overflow-hidden border-none shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:ring-gray-200 transition-all duration-300 transform group-hover:-translate-y-1">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <BookOpen className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                    {course.category}
                  </div>
                </div>
                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2 flex-1 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-blue-600">
                      {course.price ? `${course.price} FCFA` : 'Gratuit'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 flex items-center transition-colors">
                      Voir le détail <span className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
