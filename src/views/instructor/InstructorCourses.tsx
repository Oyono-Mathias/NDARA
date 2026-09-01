import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Loader2, Book, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseOverview {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  studentsCount: number;
  modulesCount: number;
  updatedAt: string;
}

export const InstructorCourses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseOverview[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { id: 'c1', title: 'React Avancé', status: 'published', studentsCount: 120, modulesCount: 8, updatedAt: '2026-08-28' },
        { id: 'c2', title: 'Firebase pour les pros', status: 'draft', studentsCount: 0, modulesCount: 3, updatedAt: '2026-08-25' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mes Cours</h1>
          <p className="text-sm text-gray-500">Gérez votre catalogue de formations.</p>
        </div>
        <Link to="/instructor/courses/create" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto py-3">
            <Plus className="w-5 h-5 mr-2" /> Nouveau cours
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Vous n'avez pas encore créé de cours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Card key={course.id} className="border-none shadow-sm ring-1 ring-gray-100 flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{course.title}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg shrink-0 ${
                    course.status === 'published' ? 'bg-green-100 text-green-700' : 
                    course.status === 'draft' ? 'bg-orange-100 text-orange-700' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {course.status === 'published' ? 'Publié' : course.status === 'draft' ? 'Brouillon' : 'Archivé'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 flex-1 space-y-1 mb-6">
                  <p>{course.modulesCount} modules</p>
                  <p>{course.studentsCount} étudiants</p>
                  <p className="text-xs text-gray-400">Modifié le {new Date(course.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  <Link to={`/instructor/courses/${course.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full py-2.5">
                      <Edit className="w-4 h-4 mr-2" /> Éditer
                    </Button>
                  </Link>
                  <Link to={`/instructor/courses/${course.id}/preview`} className="flex-1">
                    <Button variant="outline" className="w-full py-2.5">
                      <Eye className="w-4 h-4 mr-2" /> Aperçu
                    </Button>
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
