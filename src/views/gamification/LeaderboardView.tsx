import React, { useEffect } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { Loader2, AlertCircle, Trophy, Medal } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { leaderboard, loading, error, fetchLeaderboard } = useGamification();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement du classement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const isMock = leaderboard.some(l => l.isMock);

  const getRankStyle = (rank: number) => {
    switch(rank) {
      case 1: return 'bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400';
      case 2: return 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300';
      case 3: return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-50 text-gray-500 border-transparent dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <header className="text-center mb-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Classement Global
          {isMock && <span className="ml-3 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full uppercase tracking-wider align-middle">Mock</span>}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Découvrez les apprenants les plus actifs du mois.</p>
      </header>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {leaderboard.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucune donnée disponible.</div>
        ) : (
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[80px_1fr_120px_120px] gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="text-center">Rang</div>
              <div>Apprenant</div>
              <div className="text-right">Niveau</div>
              <div className="text-right">XP Total</div>
            </div>
            
            {/* Rows */}
            <div className="flex flex-col">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.userId} 
                  className={`grid grid-cols-[60px_1fr_auto] sm:grid-cols-[80px_1fr_120px_120px] items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 transition-colors ${entry.isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                >
                  <div className="flex justify-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${getRankStyle(entry.rank)}`}>
                      {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center overflow-hidden">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt={entry.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-500 dark:text-gray-400">{entry.displayName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-bold truncate ${entry.isCurrentUser ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                        {entry.displayName} {entry.isCurrentUser && '(Vous)'}
                      </span>
                      <span className="text-xs text-gray-500 sm:hidden">Niv. {entry.level} • {entry.xp} XP</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end justify-center">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm px-3 py-1 rounded-lg">
                      Niv. {entry.level}
                    </span>
                  </div>

                  <div className="hidden sm:flex flex-col items-end justify-center font-mono font-medium text-gray-600 dark:text-gray-400">
                    {entry.xp.toLocaleString('fr-FR')}
                  </div>
                  
                  {/* Mobile XP display if needed, but we put it under the name to save space */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
