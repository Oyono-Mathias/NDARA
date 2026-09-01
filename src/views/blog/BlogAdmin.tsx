import React, { useState, useEffect } from 'react';
import { BlogService, BlogPost, CreateBlogPostPayload } from '../../services/blogService';
import { BlogEditor } from '../../components/blog/BlogEditor';
import { Plus, Search, ShieldAlert, Loader2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // View states: 'list', 'edit', 'create'
  const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BlogService.getAdminPosts();
      setPosts(response.posts);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSave = async (payload: CreateBlogPostPayload, id?: string) => {
    setIsSaving(true);
    setError(null);
    try {
      if (id) {
        await BlogService.updatePost(id, payload);
        showSuccess("L'intention de modification a été enregistrée avec succès (Mock).");
      } else {
        await BlogService.createPost(payload);
        showSuccess("L'intention de création a été enregistrée avec succès (Mock).");
      }
      await fetchPosts();
      setView('list');
    } catch (err: any) {
      setError(err.message || "Échec de la sauvegarde.");
      throw err; // propagates to Editor
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${title}" ? Cette action est irréversible.`)) {
      return;
    }
    setLoading(true);
    try {
      await BlogService.deletePost(id);
      showSuccess("Article supprimé avec succès (Mock).");
      await fetchPosts();
    } catch (err: any) {
      setError(err.message || "Échec de la suppression.");
      setLoading(false);
    }
  };

  const handlePublishToggle = async (post: BlogPost) => {
    setLoading(true);
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await BlogService.updatePost(post.id, { status: newStatus });
      showSuccess(`Le statut a été passé en ${newStatus === 'published' ? 'Publié' : 'Brouillon'} (Mock).`);
      await fetchPosts();
    } catch (err: any) {
      setError(err.message || "Échec du changement de statut.");
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  if (view === 'create' || (view === 'edit' && selectedPostId)) {
    const postToEdit = view === 'edit' ? posts.find(p => p.id === selectedPostId) : null;
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <BlogEditor 
          initialPost={postToEdit} 
          onSave={handleSave} 
          onCancel={() => { setView('list'); setSelectedPostId(null); }}
          isSaving={isSaving}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Gestion du Blog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les articles, statuts et publications (Vue Admin).</p>
        </div>
        <button 
          onClick={() => setView('create')}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto shadow-sm"
        >
          <Plus className="w-5 h-5" /> Nouvel Article
        </button>
      </div>

      {/* Warnings & Success */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Principe Zero Trust (Mock Actif)</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            Les opérations effectuées ici sont des intentions. Le backend réel devra valider votre rôle administrateur avant toute mutation en base de données.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl font-medium text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5" /> {successMessage}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl font-medium text-sm">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Tools */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher par titre ou statut..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary min-h-[44px] dark:text-white shadow-sm"
        />
      </div>

      {/* Table/List of Posts */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Chargement des articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun article trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white font-semibold">
                <tr>
                  <th className="p-4 whitespace-nowrap">Titre</th>
                  <th className="p-4 whitespace-nowrap hidden sm:table-cell">Catégorie</th>
                  <th className="p-4 whitespace-nowrap">Statut</th>
                  <th className="p-4 whitespace-nowrap hidden md:table-cell">Modifié le</th>
                  <th className="p-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white min-w-[200px] max-w-[300px] truncate" title={post.title}>
                      {post.title}
                    </td>
                    <td className="p-4 hidden sm:table-cell">{post.category}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                        post.status === 'published' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        post.status === 'draft' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {post.status === 'published' ? 'Publié' : post.status === 'draft' ? 'Brouillon' : 'Archivé'}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell whitespace-nowrap">
                      {new Date(post.updatedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => handlePublishToggle(post)}
                        className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white min-h-[44px] px-2"
                      >
                        {post.status === 'published' ? 'Dépublier' : 'Publier'}
                      </button>
                      <button 
                        onClick={() => { setSelectedPostId(post.id); setView('edit'); }}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline min-h-[44px] px-2"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors inline-flex items-center min-h-[44px]"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
