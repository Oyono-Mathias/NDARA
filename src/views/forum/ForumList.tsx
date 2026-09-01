import React, { useEffect, useState } from 'react';
import { useForum } from '../../hooks/useForum';
import { ForumCard } from '../../components/forum/ForumCard';
import { Loader2, AlertCircle, Search, MessageSquarePlus } from 'lucide-react';

export const ForumList: React.FC = () => {
  const { topics, loading, error, isMockData, fetchTopics } = useForum();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simuler un debounce manuel pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchTopics(undefined, debouncedSearch);
  }, [fetchTopics, debouncedSearch]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex flex-col gap-4 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Forums & Discussions
              {isMockData && (
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                  Mock
                </span>
              )}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Échangez avec les autres apprenants et formateurs.
            </p>
          </div>
          
          <button 
            className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]"
            onClick={() => alert("Création de topic préparée pour le backend.")}
          >
            <MessageSquarePlus className="w-5 h-5" /> Nouveau Sujet
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une discussion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white min-h-[44px]"
          />
        </div>
      </header>

      {/* Main State Handling */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p>Chargement des discussions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erreur de connexion</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchTopics()}
            className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-100 rounded-xl font-medium transition-colors min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
          <MessageSquarePlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun sujet trouvé</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            {debouncedSearch 
              ? "Essayez d'utiliser des termes différents pour votre recherche." 
              : "Soyez le premier à lancer une discussion !"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map(topic => (
            <ForumCard 
              key={topic.id} 
              topic={topic} 
              onClick={(id) => {
                // Future routing: navigate(`/forum/${id}`)
                // For this isolated phase, we just log/alert or setup state if we had a single page app router injected
                console.log(`Navigating to /forum/${id}`);
                alert(`Navigation vers le topic ${id} (Préparation Routeur)`);
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
