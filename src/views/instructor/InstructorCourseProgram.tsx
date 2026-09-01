import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Plus, GripVertical, FileText, Video } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const InstructorCourseProgram: React.FC = () => {
  const { courseId } = useParams();
  const [modules] = useState([
    { id: 'm1', title: 'Introduction', type: 'video' },
    { id: 'm2', title: 'Les bases de React', type: 'text' },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to={`/instructor/courses/${courseId}/edit`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'édition
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Programme</h1>
          <p className="text-sm text-gray-500">Gérez les modules et leçons de votre cours.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto py-3">
          <Plus className="w-5 h-5 mr-2" /> Ajouter une leçon
        </Button>
      </div>

      <div className="space-y-3 mt-6">
        {modules.map((mod, index) => (
          <Card key={mod.id} className="border-none shadow-sm ring-1 ring-gray-200 bg-white">
            <CardContent className="p-0 flex items-stretch">
              {/* Drag handle (visuel uniquement pour l'instant) */}
              <div className="w-12 bg-gray-50 flex items-center justify-center border-r border-gray-100 text-gray-400 cursor-move rounded-l-xl">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mod.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {mod.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Leçon {index + 1}</p>
                    <h3 className="font-bold text-gray-900">{mod.title}</h3>
                  </div>
                </div>
                <Button variant="outline" className="text-xs px-3 py-2">Éditer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6">
        * Le drag & drop nécessite une librairie spécifique et est désactivé dans cette démo mobile-first.
      </p>
    </div>
  );
};
