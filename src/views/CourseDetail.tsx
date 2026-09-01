import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirestoreDocument } from '../hooks/data/useFirestoreDocument';
import { ClientCourse } from '../hooks/catalog/useCatalogClient';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, PlayCircle, Clock, Award, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { data: course, loading, error, empty } = useFirestoreDocument<ClientCourse>('courses', id || null);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <Skeleton className="h-8 w-32" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || empty || !course || !course.isPublished) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-2">Cours indisponible</h3>
          <p>{error?.message || 'Ce cours n\'existe pas ou n\'est plus disponible.'}</p>
        </div>
        <Link to="/courses" className="mt-8 inline-block">
          <Button variant="outline">Retour au catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pb-16 pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/courses" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 -ml-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux cours
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-blue-400 mb-6 border border-slate-700">
                {course.category}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8">
                <div className="flex items-center"><Clock className="w-5 h-5 mr-2 text-slate-500" /> {course.duration || '4h 30m'}</div>
                <div className="flex items-center"><Award className="w-5 h-5 mr-2 text-slate-500" /> Certificat inclus</div>
                <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-slate-500" /> Accès à vie</div>
              </div>

            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-slate-800 ring-1 ring-white/10">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                <Button variant="primary" className="w-full sm:w-auto text-lg py-6" fullWidth>
                  <PlayCircle className="w-6 h-6 mr-2" /> 
                  {course.price ? `Acheter pour ${course.price} FCFA` : 'Commencer gratuitement'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de ce cours</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <p className="whitespace-pre-wrap">{course.description}</p>
                {/* Ici, on pourrait ajouter un contenu riche Markdown */}
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce que vous allez apprendre</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mt-0.5">
                      ✓
                    </div>
                    <p className="ml-3 text-gray-600">Objectif pédagogique numéro {i} pour maîtriser les bases.</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prêt à commencer ?</h3>
              
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Connectez-vous pour accéder à ce cours et suivre votre progression.</p>
                  <Link to="/login" className="block">
                    <Button variant="outline" fullWidth>Se connecter</Button>
                  </Link>
                </div>
              ) : (
                <Link to={`/courses/${course.id}/player`} className="block">
                  <Button variant="primary" fullWidth className="py-6 text-lg">
                    Accéder au contenu
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
