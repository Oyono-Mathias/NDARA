import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, ArrowLeft, Settings, LayoutList, Video, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const InstructorCourseEdit: React.FC = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const menuItems = [
    { label: 'Informations générales', icon: <Settings className="w-5 h-5" />, path: `/instructor/courses/${courseId}/settings` },
    { label: 'Programme & Modules', icon: <LayoutList className="w-5 h-5" />, path: `/instructor/courses/${courseId}/program` },
    { label: 'Médias & Vidéos', icon: <Video className="w-5 h-5" />, path: `/instructor/courses/${courseId}/medias` },
    { label: 'Finalisation', icon: <CheckCircle2 className="w-5 h-5" />, path: `/instructor/courses/${courseId}/finalisation` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/instructor/courses" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Mes cours
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Édition du cours</h1>
          <p className="text-sm text-gray-500">ID: {courseId}</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={loading} className="w-full sm:w-auto py-3 px-6">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer le brouillon'}
        </Button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 mr-2" /> Modifications sauvegardées (Intention).
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {menuItems.map((item, idx) => (
          <Link key={idx} to={item.path}>
            <Card className="border-none shadow-sm ring-1 ring-gray-100 hover:ring-blue-500 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">Gérer cette section</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
