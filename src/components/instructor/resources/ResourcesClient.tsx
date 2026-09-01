import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Search, Plus, FileText, Video, Link as LinkIcon, File, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'other';
  size?: string;
  date: string;
  status: 'active' | 'processing';
}

export const ResourcesClient: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'link'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: 'Support_Cours_Chap1.pdf', type: 'pdf', size: '2.4 MB', date: '2023-10-01', status: 'active' },
    { id: '2', name: 'Introduction_Video.mp4', type: 'video', size: '145 MB', date: '2023-10-02', status: 'active' },
    { id: '3', name: 'Documentation_Externe', type: 'link', date: '2023-10-03', status: 'active' }
  ]);

  const handleAddIntent = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Intention d'upload préparée. L'upload réel nécessitera une URL signée Firebase Storage / Cloud Functions (Zero Trust).");
    }, 1500);
  };

  const handleDeleteIntent = (id: string) => {
    if(window.confirm('Voulez-vous préparer la suppression de cette ressource ?')) {
      // Mock intention
      setResources(resources.filter(r => r.id !== id));
      alert("Demande de suppression enregistrée pour le serveur.");
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'video': return <Video className="w-6 h-6 text-blue-500" />;
      case 'link': return <LinkIcon className="w-6 h-6 text-green-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Ressources Pédagogiques</h1>
          <p className="text-sm text-gray-500">Gérez les fichiers et liens de vos cours.</p>
        </div>
        <Button onClick={handleAddIntent} disabled={isUploading} className="w-full sm:w-auto">
          {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
          Ajouter une ressource
        </Button>
      </div>

      <div className="bg-yellow-50 p-4 rounded-xl flex items-start gap-3 border border-yellow-100 text-sm text-yellow-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          L'accès direct au Firebase Storage n'est pas autorisé. Les uploads réels passeront par des requêtes sécurisées côté serveur (Architecture Zero Trust).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher une ressource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="py-3 px-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
        >
          <option value="all">Tous les types</option>
          <option value="pdf">Documents PDF</option>
          <option value="video">Vidéos</option>
          <option value="link">Liens externes</option>
        </select>
      </div>

      {filteredResources.length === 0 ? (
        <Card className="border-none shadow-sm ring-1 ring-gray-200 border-dashed bg-gray-50/50">
          <CardContent className="p-12 text-center text-gray-500">
            <File className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>Aucune ressource trouvée.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredResources.map((res) => (
            <div key={res.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 bg-gray-50 rounded-lg shrink-0">
                  {getIconForType(res.type)}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-gray-900 truncate">{res.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="uppercase">{res.type}</span>
                    {res.size && <span>• {res.size}</span>}
                    <span>• Ajouté le {res.date}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteIntent(res.id)}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-4"
                aria-label="Supprimer la ressource"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
