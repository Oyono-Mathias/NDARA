import React, { useState, useEffect } from 'react';
import { BlogService, BlogPost } from '../../services/blogService';
import { BlogCard } from '../../components/blog/BlogCard';
import { Search, Loader2, AlertCircle, BookOpen } from 'lucide-react';

interface BlogListProps {
  onPostClick: (slug: string) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ onPostClick }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await BlogService.getPublishedPosts(category, search);
        if (isMounted) {
          setPosts(response.posts);
          setIsMock(response.isMock);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Erreur de chargement des articles");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPosts();
    }, 300); // Debounce de recherche simulé

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, category]);

  // Extraire les catégories uniques pour le filtre
  const uniqueCategories = ['all', ...Array.from(new Set(posts.map(p => p.category)))];
  const featuredPost = posts.find(p => p.featured) || posts[0];
  const regularPosts = posts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Header & MOCK Indicator */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Le Blog Ndara</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Actualités, tutoriels et annonces de la plateforme.</p>
        
        {!loading && isMock && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-semibold rounded-lg self-start border border-amber-200 dark:border-amber-800/50">
            <AlertCircle className="w-4 h-4" />
            DONNÉES SIMULÉES (Backend non connecté)
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un article..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary min-h-[44px] dark:text-white shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar shrink-0">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors border shadow-sm ${
                category === cat 
                  ? 'bg-gray-900 border-gray-900 text-white dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {loading && !error && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p>Chargement des articles...</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 text-center min-h-[300px]">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun article trouvé</h3>
          <p className="text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && posts.length > 0 && (
        <div className="flex flex-col gap-8">
          {/* Featured Post (Only if we aren't heavily filtering) */}
          {featuredPost && !search && category === 'all' && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">À la une</h2>
              <BlogCard post={featuredPost} onClick={onPostClick} />
            </div>
          )}

          {/* Grid of posts */}
          {regularPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Derniers articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map(post => (
                  <BlogCard key={post.id} post={post} onClick={onPostClick} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
