import React, { useState, useEffect } from 'react';
import { EbooksService } from '../../../services/db';
import { Ebook } from '../../../types/models';
import { useToast } from '../../../hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2, Book } from 'lucide-react';
import { GoogleDriveFilePicker } from '../../../components/GoogleDriveFilePicker';
import { useAuth } from '../../../contexts/AuthContext';

export function EbooksManager() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEbook, setEditingEbook] = useState<Partial<Ebook> | null>(null);
  const { toast } = useToast();
  const { firebaseUser } = useAuth();

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const data = await EbooksService.getAll();
      setEbooks(data);
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de charger les ebooks', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const handleSave = async () => {
    if (!editingEbook?.title || !editingEbook?.fileUrl || !editingEbook?.price) {
      toast({ title: 'Erreur', description: 'Titre, fichier et prix requis', variant: 'destructive' });
      return;
    }
    try {
      if (editingEbook.id) {
        await EbooksService.update(editingEbook.id, editingEbook as Ebook);
        toast({ title: 'Succès', description: 'Ebook mis à jour' });
      } else {
        await EbooksService.create({
          ...editingEbook,
          authorId: firebaseUser?.uid || 'admin',
          slug: editingEbook.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          published: editingEbook.published ?? true
        } as Omit<Ebook, 'id' | 'createdAt' | 'updatedAt'>);
        toast({ title: 'Succès', description: 'Ebook créé' });
      }
      setEditingEbook(null);
      fetchEbooks();
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur de sauvegarde', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet ebook ?')) return;
    try {
      await EbooksService.delete(id);
      toast({ title: 'Succès', description: 'Ebook supprimé' });
      fetchEbooks();
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur de suppression', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Book className="w-5 h-5 text-emerald-500" /> Gestion des Ebooks
          </h2>
          <p className="text-slate-400">Importez des PDF depuis Google Drive pour les vendre dans le marché.</p>
        </div>
        <button
          onClick={() => setEditingEbook({ price: 5000, published: true })}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouvel Ebook
        </button>
      </div>

      {editingEbook && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">{editingEbook.id ? 'Modifier' : 'Créer'} un Ebook</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Titre</label>
              <input
                type="text"
                value={editingEbook.title || ''}
                onChange={e => setEditingEbook({ ...editingEbook, title: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder="Ex: Maîtriser le Marketing"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prix (XOF)</label>
              <input
                type="number"
                value={editingEbook.price || 0}
                onChange={e => setEditingEbook({ ...editingEbook, price: Number(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea
              value={editingEbook.description || ''}
              onChange={e => setEditingEbook({ ...editingEbook, description: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white h-24"
              placeholder="Description détaillée de l'ebook..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Fichier PDF</label>
              {editingEbook.fileUrl && (
                <div className="text-xs text-emerald-400 truncate bg-emerald-500/10 p-2 rounded">
                  Fichier importé : {editingEbook.fileUrl.split('/').pop()}
                </div>
              )}
              <GoogleDriveFilePicker 
                allowedTypes="PDF" 
                folder="ebooks-pdf"
                label={editingEbook.fileUrl ? "Remplacer le PDF" : "Importer le PDF (Drive)"}
                onFileImported={(url: string) => setEditingEbook({ ...editingEbook, fileUrl: url })} 
              />
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Couverture</label>
              {editingEbook.coverUrl && (
                <img src={editingEbook.coverUrl} alt="Cover" className="h-16 rounded object-cover" />
              )}
              <GoogleDriveFilePicker 
                allowedTypes="IMAGE" 
                folder="ebooks-covers"
                label={editingEbook.coverUrl ? "Remplacer l'image" : "Importer une image (Drive)"}
                onFileImported={(url: string) => setEditingEbook({ ...editingEbook, coverUrl: url })} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="published" 
              checked={editingEbook.published || false} 
              onChange={e => setEditingEbook({ ...editingEbook, published: e.target.checked })} 
              className="rounded bg-black/50 border-white/10"
            />
            <label htmlFor="published" className="text-sm text-slate-300">Publié sur le marché</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button onClick={() => setEditingEbook(null)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Annuler</button>
            <button onClick={handleSave} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors">Enregistrer</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map(ebook => (
            <div key={ebook.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col group">
              {ebook.coverUrl ? (
                <div className="h-40 bg-slate-800 w-full">
                  <img src={ebook.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={ebook.title} />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 w-full flex items-center justify-center">
                  <Book className="w-12 h-12 text-slate-700" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white line-clamp-2 leading-tight">{ebook.title}</h3>
                  <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${ebook.published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {ebook.published ? 'Publié' : 'Brouillon'}
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-500 mb-4">{ebook.price} XOF</div>
                
                <div className="mt-auto flex gap-2 border-t border-white/5 pt-4">
                  <button onClick={() => setEditingEbook(ebook)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm flex justify-center items-center gap-2 transition-colors">
                    <Edit2 className="w-4 h-4" /> Modifier
                  </button>
                  <button onClick={() => handleDelete(ebook.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ebooks.length === 0 && !editingEbook && (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Aucun ebook trouvé. Créez-en un pour commencer !</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
