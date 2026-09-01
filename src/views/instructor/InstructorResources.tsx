import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Download, Trash2, UploadCloud, AlertCircle } from 'lucide-react';

export const InstructorResources: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Ressources & Fichiers</h1>
        <p className="text-sm text-gray-500">Gérez les PDFs et documents de vos cours.</p>
      </div>

      <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors">
        <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        <p className="font-bold text-blue-900 mb-1">Uploader un nouveau document</p>
        <p className="text-xs text-blue-600/70">PDF, DOCX, ZIP (Max 50MB)</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-200 text-sm text-gray-600">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
        <p>Les téléchargements sécurisés réels nécessitent des Signed URLs provenant du serveur Firebase Storage. Les liens directs ne doivent pas être exposés.</p>
      </div>

      <div className="space-y-3">
        {[1, 2].map((file) => (
          <Card key={file} className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">support_cours_v{file}.pdf</p>
                  <p className="text-xs text-gray-500">2.4 MB • 120 téléchargements</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="p-2" aria-label="Télécharger"><Download className="w-4 h-4" /></Button>
                <Button variant="outline" className="p-2 text-red-600 border-red-200 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
