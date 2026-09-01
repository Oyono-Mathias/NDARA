import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Book, Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';

// Simple debounce function definition inside the file to avoid external deps
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    // Simulation d'une recherche (à remplacer par un vrai appel Firestore indexé ou Algolia dans le futur)
    setTimeout(() => {
      setResults([
        { id: '1', type: 'course', title: 'Introduction à React', description: 'Apprenez les bases de React.js' },
        { id: '2', type: 'user', title: 'Aminata Diallo', description: 'Expert en Marketing Digital' }
      ].filter(r => r.title.toLowerCase().includes(debouncedQuery.toLowerCase())));
      setIsSearching(false);
    }, 800);
  }, [debouncedQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Recherche Globale</h1>
        <p className="text-gray-500">Trouvez des cours, des experts ou des ressources.</p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 text-lg transition-colors shadow-sm"
          placeholder="Que recherchez-vous ?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {!query.trim() && results.length === 0 && !isSearching && (
          <div className="text-center py-16 px-4">
            <SearchIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Commencez à taper pour rechercher...</p>
          </div>
        )}

        {query.trim() && results.length === 0 && !isSearching && (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-900 font-medium text-lg">Aucun résultat trouvé pour "{query}"</p>
            <p className="text-gray-500 mt-2">Essayez avec d'autres mots-clés.</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, idx) => (
            <Link key={idx} to={result.type === 'course' ? `/courses/${result.id}` : `/directory/${result.id}`} className="block focus:outline-none">
              <Card className="border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${result.type === 'course' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {result.type === 'course' ? <Book className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                      {result.type === 'course' ? 'Cours' : 'Expert'}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 truncate">{result.title}</h3>
                    <p className="text-gray-500 text-sm truncate">{result.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
