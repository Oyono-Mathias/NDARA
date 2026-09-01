import React, { useState, useEffect } from 'react';
import { BlogService, BlogPost } from '../../services/blogService';
import { ArrowLeft, Calendar, Clock, User, AlertCircle, Loader2, Tag, Image as ImageIcon } from 'lucide-react';

interface BlogPostViewProps {
  slug: string;
  onBack: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ slug, onBack }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await BlogService.getPostBySlug(slug);
        if (isMounted) {
          setPost(response.post);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Article introuvable");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement de l'article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
        <button onClick={onBack} className="self-start flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-200 dark:border-red-800/50 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Erreur</h2>
          <p className="text-red-600 dark:text-red-300">{error || "Cet article n'existe pas ou n'est plus disponible."}</p>
        </div>
      </div>
    );
  }

  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date inconnue';

  return (
    <article className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 pb-16">
      {/* Navigation */}
      <div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors min-h-[44px] w-fit font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux articles
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
            {post.category}
          </span>
          {post.isMock && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" /> Simulation
            </span>
          )}
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 italic">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <span>{post.authorName}</span>
          </div>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4" /> {formattedDate}
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-4 h-4" /> {post.readingTime} min de lecture
          </span>
        </div>
      </header>

      {/* Cover Image */}
      <div className="w-full h-64 sm:h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" aria-label="Aucune image de couverture" />
        )}
      </div>

      {/* SECURE CONTENT RENDERING (ZERO TRUST HTML) */}
      <div className="prose dark:prose-invert prose-lg max-w-none w-full text-gray-800 dark:text-gray-200 leading-relaxed font-serif">
        {post.content.split('\n').map((paragraph, index) => {
          if (!paragraph.trim()) return <br key={index} />;
          return <p key={index} className="mb-4">{paragraph}</p>;
        })}
      </div>

      {/* Footer Tags */}
      {post.tags && post.tags.length > 0 && (
        <footer className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex gap-2 flex-wrap items-center">
          <Tag className="w-5 h-5 text-gray-400 mr-2" />
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
              #{tag}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
};
