import React, { useState, useEffect } from 'react';
import { BlogPost, BlogPostStatus, CreateBlogPostPayload } from '../../services/blogService';
import { Save, AlertCircle } from 'lucide-react';

interface BlogEditorProps {
  initialPost?: BlogPost | null;
  onSave: (payload: CreateBlogPostPayload, id?: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ initialPost, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<CreateBlogPostPayload>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Général',
    tags: [],
    readingTime: 3,
    status: 'draft',
    featured: false,
  });

  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPost) {
      setFormData({
        title: initialPost.title,
        slug: initialPost.slug,
        excerpt: initialPost.excerpt,
        content: initialPost.content,
        coverImage: initialPost.coverImage || '',
        category: initialPost.category,
        tags: initialPost.tags,
        readingTime: initialPost.readingTime,
        status: initialPost.status,
        featured: initialPost.featured,
      });
      setTagsInput(initialPost.tags.join(', '));
    }
  }, [initialPost]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !initialPost ? generateSlug(title) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      setError('Le titre, le slug et le contenu sont obligatoires.');
      return;
    }

    const finalTags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const payload = { ...formData, tags: finalTags };

    try {
      await onSave(payload, initialPost?.id);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {initialPost ? 'Modifier l\'article' : 'Créer un nouvel article'}
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : <><Save className="w-4 h-4" /> Sauvegarder</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={handleTitleChange}
              disabled={isSaving}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary dark:text-white min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Résumé</label>
            <textarea 
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})}
              disabled={isSaving}
              rows={2}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary dark:text-white min-h-[44px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu de l'article *</label>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-t-lg text-xs text-blue-800 dark:text-blue-300">
              Note (Zero Trust) : Le contenu HTML enrichi est désactivé. Utilisez des sauts de ligne réguliers pour structurer votre texte en paragraphes sécurisés.
            </div>
            <textarea 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              disabled={isSaving}
              rows={15}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-b-lg focus:ring-2 focus:ring-primary dark:text-white resize-y font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Paramètres</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as BlogPostStatus})}
                disabled={isSaving}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] dark:text-white"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL) *</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={e => setFormData({...formData, slug: generateSlug(e.target.value)})}
                disabled={isSaving}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] dark:text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
              <input 
                type="text" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                disabled={isSaving}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (séparés par des virgules)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={e => setTagsInput(e.target.value)}
                disabled={isSaving}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] dark:text-white"
                placeholder="React, TypeScript, Web..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image de couverture (URL)</label>
              <input 
                type="url" 
                value={formData.coverImage} 
                onChange={e => setFormData({...formData, coverImage: e.target.value})}
                disabled={isSaving}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="featured"
                checked={formData.featured}
                onChange={e => setFormData({...formData, featured: e.target.checked})}
                disabled={isSaving}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mettre en avant (Featured)
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
