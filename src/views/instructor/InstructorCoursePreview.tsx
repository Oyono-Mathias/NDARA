import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft, PlayCircle, Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const InstructorCoursePreview: React.FC = () => {
  const { courseId: _courseId } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/instructor/courses" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Link>
      
      <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-center gap-2 text-sm text-blue-800 border border-blue-100 mb-6 font-medium">
        <Eye className="w-5 h-5" />
        Mode Aperçu - Ceci est la vue étudiante de votre cours (Read-only).
      </div>

      <div className="aspect-video bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
        <PlayCircle className="w-16 h-16 text-white/50" />
        <div className="absolute bottom-4 left-4 text-white">
          <span className="bg-black/50 px-2 py-1 rounded text-xs">Miniature vidéo simulée</span>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Technologie</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Maîtriser React et Firebase</h1>
            <p className="text-lg text-gray-600 mt-4 leading-relaxed">
              Une formation complète pour devenir un expert full-stack avec les outils modernes.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Programme du cours</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((mod) => (
                <div key={mod} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Module {mod} : Introduction</span>
                  <span className="text-xs text-gray-400">3 leçons</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
