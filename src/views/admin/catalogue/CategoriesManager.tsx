import React, { useState } from 'react';
import { useCategoriesAdmin } from '../../../hooks/catalog/useCatalogAdmin';
import { TouchArea } from '../../../components/ui/TouchArea';
import { Loader2, Plus, Edit2, Trash2, Folder, Save, X } from 'lucide-react';
import { Category } from '../../../types/models';

export function CategoriesManager() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategoriesAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', parentId: '' });

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const handleSaveNew = async () => {
    if (!formData.name || !formData.slug) return;
    await addCategory({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      parentId: formData.parentId || null
    });
    setIsAdding(false);
    setFormData({ name: '', slug: '', description: '', parentId: '' });
  };

  const handleSaveEdit = async (id: string) => {
    if (!formData.name || !formData.slug) return;
    await updateCategory(id, {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      parentId: formData.parentId || null
    });
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '', parentId: '' });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', parentId: cat.parentId || '' });
  };

  const activeCategories = categories.filter(c => c.status !== 'archived');
  const parentCategories = activeCategories.filter(c => !c.parentId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Catégories</h2>
        {!isAdding && (
          <TouchArea as="button" onClick={() => setIsAdding(true)} className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle Catégorie
          </TouchArea>
        )}
      </div>

      {isAdding && (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white">Ajouter une catégorie</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Nom</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Slug</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 mb-1 block">Description</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 mb-1 block">Parent (Optionnel)</label>
              <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none">
                <option value="">Aucun (Catégorie principale)</option>
                {parentCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <TouchArea as="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 font-bold uppercase text-xs">Annuler</TouchArea>
            <TouchArea as="button" onClick={handleSaveNew} className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold uppercase text-xs rounded-xl flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer</TouchArea>
          </div>
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
        {parentCategories.map(parent => (
          <div key={parent.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{parent.name}</h4>
                  <p className="text-xs text-slate-400">{parent.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(parent)} className="p-2 text-slate-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteCategory(parent.id)} className="p-2 text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="mt-2 ml-14 space-y-2">
              {activeCategories.filter(c => c.parentId === parent.id).map(child => (
                <div key={child.id} className="flex items-center justify-between bg-white/5 p-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    <span className="text-sm font-medium text-slate-300">{child.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(child)} className="p-1.5 text-slate-500 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteCategory(child.id)} className="p-1.5 text-rose-500 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            
            {editingId === parent.id && (
              <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm" placeholder="Nom" /></div>
                  <div><input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm" placeholder="Slug" /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-400">Annuler</button>
                  <button onClick={() => handleSaveEdit(parent.id)} className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg">Enregistrer</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {parentCategories.length === 0 && !isAdding && (
          <div className="p-8 text-center text-slate-500">Aucune catégorie trouvée.</div>
        )}
      </div>
    </div>
  );
}
