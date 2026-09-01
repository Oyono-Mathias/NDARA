import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sparkles, Send, Loader2 } from 'lucide-react';

export const MathiasTutor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setQuery('');
      alert("Intention enregistrée. Le Tuteur IA nécessitera une connexion au backend (Gemini API) pour générer une véritable réponse.");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col space-y-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tuteur IA</h1>
          <p className="text-sm text-gray-500">Posez vos questions sur les cours (Simulation).</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center text-gray-400 text-sm text-center overflow-y-auto">
          Je suis votre assistant d'apprentissage. Posez une question pour commencer. <br/>(L'IA n'est pas encore connectée au backend).
        </div>
        <CardContent className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Posez votre question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={handleAsk} disabled={loading || !query.trim()} className="px-6 rounded-xl bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
