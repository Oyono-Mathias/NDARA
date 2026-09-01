import React from 'react';
import { useCatalogAdmin } from '../../hooks/catalog/useCatalogAdmin';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookOpen, Plus, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CatalogView: React.FC = () => {
  const { courses, loading, error, empty } = useCatalogAdmin();

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-bold">Erreur</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue des cours</h1>
          <p className="text-gray-500 text-sm">Gérez l'ensemble des formations de la plateforme.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau cours
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="h-40 bg-gray-100 rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : empty ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Aucun cours</h3>
          <p className="text-gray-500 mt-1">Commencez par créer votre première formation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-100 rounded-t-xl relative flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded-t-xl" />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-300" />
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {course.isPublished ? (
                      <><Eye className="w-3 h-3 mr-1" /> Publié</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> Brouillon</>
                    )}
                  </span>
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{course.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {course.price ? `${course.price} FCFA` : 'Gratuit'}
                  </span>
                  <Link to={`/admin/courses/${course.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Gérer
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
