import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirestoreDocument } from '../../hooks/data/useFirestoreDocument';
import { AdminCourse } from '../../hooks/catalog/useCatalogAdmin';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, Edit, Users, Clock, Settings } from 'lucide-react';

export const CourseDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: course, loading, error, empty } = useFirestoreDocument<AdminCourse>('courses', id || null);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || empty || !course) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h3 className="font-bold">Erreur</h3>
          <p>{error?.message || 'Cours introuvable.'}</p>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-20">
      <Link to="/admin/courses" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au catalogue
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" /> Paramètres
          </Button>
          <Button variant="primary">
            <Edit className="w-4 h-4 mr-2" /> Éditer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{course.description}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Programme (Modules)</h2>
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">Le programme du cours sera géré ici.</p>
                <Button variant="outline" className="mt-4">Ajouter un module</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Informations</h2>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 flex items-center text-sm"><Clock className="w-4 h-4 mr-2" /> Statut</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {course.isPublished ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 flex items-center text-sm"><Users className="w-4 h-4 mr-2" /> Inscrits</span>
                <span className="font-medium text-gray-900">{course.enrollmentCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">Catégorie</span>
                <span className="font-medium text-gray-900">{course.category}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
