import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Target, Plus, Search, Image as ImageIcon, Video, FileText, Download, Trash, Eye, EyeOff, Link } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

export function AdminMarketingAssets() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newAsset, setNewAsset] = useState({
    title: '',
    category: 'banner',
    url: '',
    thumbnail: '',
    size: '',
    isActive: true
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const snap = await getDocs(collection(db, 'marketing_assets'));
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.title || !newAsset.url) return toast.error('Veuillez remplir les champs obligatoires.');
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, 'marketing_assets', id), {
        ...newAsset,
        downloads: 0,
        createdAt: new Date(),
      });
      toast.success('Ressource ajoutée');
      setShowAddForm(false);
      setNewAsset({ title: '', category: 'banner', url: '', thumbnail: '', size: '', isActive: true });
      loadAssets();
    } catch (e) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await deleteDoc(doc(db, 'marketing_assets', id));
      toast.success('Supprimé');
      loadAssets();
    } catch (e) {
      toast.error('Erreur de suppression');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'marketing_assets', id), { isActive: !current });
      toast.success(current ? 'Désactivé' : 'Activé');
      loadAssets();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Target className="text-rose-500 w-8 h-8" />
            Marketing Ambassadeurs
          </h1>
          <p className="text-slate-400">Gérez les bannières, vidéos et PDF mis à disposition des ambassadeurs.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-rose-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-rose-600 transition"
        >
          <Plus className="w-5 h-5" /> Ajouter Ressource
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Nouvelle Ressource (ex: depuis Google Drive)</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Titre</label>
              <input 
                type="text" 
                value={newAsset.title} 
                onChange={e => setNewAsset(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" 
                placeholder="Ex: Bannière Soldes 2024"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
              <select 
                value={newAsset.category}
                onChange={e => setNewAsset(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
              >
                <option value="banner">Bannière (Image)</option>
                <option value="social">Réseaux Sociaux (Image)</option>
                <option value="video">Vidéo Promo</option>
                <option value="pdf">Document / PDF</option>
                <option value="logo">Logo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">URL (Lien de l'image/vidéo ou lien Google Drive)</label>
              <input 
                type="url" 
                value={newAsset.url} 
                onChange={e => setNewAsset(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" 
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">URL de la Miniature (Optionnel)</label>
              <input 
                type="url" 
                value={newAsset.thumbnail} 
                onChange={e => setNewAsset(prev => ({ ...prev, thumbnail: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" 
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Taille (Optionnel)</label>
              <input 
                type="text" 
                value={newAsset.size} 
                onChange={e => setNewAsset(prev => ({ ...prev, size: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" 
                placeholder="Ex: 1080x1080 ou 2.4 MB"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-800 text-slate-400 font-bold rounded-lg hover:bg-slate-700">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assets.map(a => (
          <div key={a.id} className={clsx("bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden transition-opacity", !a.isActive && "opacity-60")}>
            <div className="h-40 bg-slate-800 relative">
              {a.category === 'banner' || a.category === 'social' || a.category === 'logo' ? (
                 <img src={a.thumbnail || a.url} alt={a.title} className="w-full h-full object-cover" />
              ) : a.category === 'video' ? (
                 <div className="w-full h-full flex items-center justify-center bg-slate-900"><Video className="w-12 h-12 text-slate-600" /></div>
              ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-900"><FileText className="w-12 h-12 text-slate-600" /></div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => toggleActive(a.id, a.isActive)} className="p-2 bg-black/50 backdrop-blur rounded-lg text-white hover:bg-black/70">
                  {a.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-2 bg-black/50 backdrop-blur rounded-lg text-red-400 hover:bg-red-500/50">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-white line-clamp-1">{a.title}</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{a.category} • {a.size || 'N/A'}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs font-bold text-emerald-400">{a.downloads || 0} DL</span>
                <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1">
                   Ouvrir <Link className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
