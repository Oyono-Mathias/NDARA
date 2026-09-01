import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Megaphone, Plus, Loader2 } from 'lucide-react';

export const InstructorAnnouncements: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const handlePost = () => {
    if (!content.trim()) return;
    setLoading(true);
    // Intention de publication serveur
    setTimeout(() => {
      setLoading(false);
      setContent('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Annonces</h1>
        <p className="text-sm text-gray-500">Communiquez avec tous vos étudiants.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5" /> Créer une annonce
          </h3>
          <textarea 
            rows={4} 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ex: Le module 4 est maintenant disponible avec un nouveau quiz !"
            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={handlePost} disabled={loading || !content.trim()} className="px-6">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Diffuser l\'annonce'}
            </Button>
          </div>
          <p className="text-xs text-blue-600/70 mt-2 text-right">L'envoi d'emails est géré par les triggers Cloud Functions.</p>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-4">
        <h2 className="font-bold text-gray-900">Historique des annonces</h2>
        {[1, 2].map((id) => (
          <Card key={id} className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-5 flex gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Publié le {new Date().toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-gray-800">Bienvenue dans la nouvelle version du cours ! N'hésitez pas à poser vos questions dans la section Q&A.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
