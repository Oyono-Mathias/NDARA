import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Medal, AlertCircle, Loader2 } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  pseudo: string;
  referrals: number;
  score: number;
}

export const AmbassadorLeaderboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Simulation réseau
    const timer = setTimeout(() => {
      setEntries([
        { id: 'u1', rank: 1, pseudo: 'Ambassadeur_***A', referrals: 154, score: 9800 },
        { id: 'u2', rank: 2, pseudo: 'Partenaire_***B', referrals: 89, score: 6200 },
        { id: 'u3', rank: 3, pseudo: 'Vous', referrals: 12, score: 1100 },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Classement Partenaires</h1>
        <p className="text-sm text-gray-500">Performances mensuelles du réseau.</p>
      </div>

      <div className="bg-purple-50 p-4 rounded-xl flex items-start gap-3 border border-purple-100 text-sm text-purple-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Classement fourni par le serveur (démonstration). Les identifiants sont anonymisés pour des raisons de confidentialité.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-0">
            <div className="flex flex-col">
              {entries.map((entry, idx) => (
                <div 
                  key={entry.id} 
                  className={`flex items-center justify-between p-4 sm:p-6 ${idx !== entries.length - 1 ? 'border-b border-gray-100' : ''} ${entry.pseudo === 'Vous' ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                      entry.rank === 2 ? 'bg-gray-100 text-gray-500' : 
                      entry.rank === 3 ? 'bg-orange-100 text-orange-600' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {entry.rank <= 3 ? <Medal className="w-5 h-5" /> : entry.rank}
                    </div>
                    <div>
                      <p className={`font-bold ${entry.pseudo === 'Vous' ? 'text-blue-600' : 'text-gray-900'}`}>{entry.pseudo}</p>
                      <p className="text-xs text-gray-500">{entry.referrals} filleuls actifs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{entry.score}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
