import React from 'react';
import { BlogPost } from '../../services/blogService';
import { Calendar, Clock, User, Image as ImageIcon } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  onClick: (slug: string) => void;
  isAdminView?: boolean;
  onEdit?: (id: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick, isAdminView, onEdit }) => {
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Non publié';

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group">
      {/* Image Cover */}
      <div 
        className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative cursor-pointer overflow-hidden shrink-0"
        onClick={() => onClick(post.slug)}
      >
        {post.coverImage ? (
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" aria-label="Aucune image de couverture" />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
            {post.category}
          </span>
          {isAdminView && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm text-white ${
              post.status === 'published' ? 'bg-emerald-500' : 
              post.status === 'draft' ? 'bg-amber-500' : 'bg-gray-500'
            }`}>
              {post.status === 'published' ? 'Publié' : post.status === 'draft' ? 'Brouillon' : 'Archivé'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{post.readingTime} min</span>
          </span>
        </div>

        <h3 
          className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => onClick(post.slug)}
        >
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="truncate text-xs font-medium">{post.authorName}</span>
          </div>

          {!isAdminView ? (
            <button 
              onClick={() => onClick(post.slug)}
              className="text-primary text-sm font-semibold hover:underline min-h-[44px] px-2 -mr-2"
              aria-label={`Lire l'article ${post.title}`}
            >
              Lire l'article
            </button>
          ) : (
            <button 
              onClick={() => onEdit && onEdit(post.id)}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline min-h-[44px] px-2 -mr-2"
              aria-label={`Modifier l'article ${post.title}`}
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
