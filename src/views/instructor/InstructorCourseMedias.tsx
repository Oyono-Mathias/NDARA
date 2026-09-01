import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Image as ImageIcon, Video, Upload, AlertCircle, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const InstructorCourseMedias: React.FC = () => {
  const { courseId } = useParams();
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to={`/instructor/courses/${courseId}/edit`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'édition
      </Link>
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Médias du cours</h1>
        <p className="text-sm text-gray-500">Gérez la miniature et la vidéo de présentation.</p>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 text-sm text-orange-800 border border-orange-100">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les uploads sont simulés ici. L'intégration réelle nécessitera Firebase Storage côté serveur.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6 space-y-6">
          
          {/* Miniature */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Miniature du cours</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium mb-1">Appuyez pour uploader une image</p>
              <p className="text-xs text-gray-400">PNG, JPG jusqu'à 2MB</p>
              <Button variant="outline" className="mt-4" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Upload...' : 'Sélectionner un fichier'}
              </Button>
            </div>
          </div>

          {/* Vidéo Promo */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Video className="w-5 h-5" /> Vidéo de présentation</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">promo_video_final.mp4</p>
                  <p className="text-xs text-gray-500">12.4 MB • Uploadé avec succès</p>
                </div>
              </div>
              <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer la vidéo">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
