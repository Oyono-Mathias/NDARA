import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

export const MigrationButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleMigration = () => {
    if (!window.confirm("Êtes-vous sûr de vouloir lancer la migration ? Cette action est irréversible.")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Intention de migration envoyée. Aucun backend connecté pour exécuter la tâche réelle.");
    }, 2000);
  };

  return (
    <div className="bg-red-50 p-6 rounded-xl border border-red-200 space-y-4">
      <div className="flex items-center gap-3 text-red-800">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="font-bold">Migration des Données</h3>
      </div>
      <p className="text-sm text-red-700">
        Lancement du script de migration globale. Ne lancez cette opération que si vous êtes certain des conséquences.
      </p>
      <Button 
        variant="outline" 
        onClick={handleMigration} 
        disabled={loading}
        className="text-red-700 border-red-300 hover:bg-red-100 w-full sm:w-auto"
      >
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
        {loading ? 'Processing...' : 'Démarrer la migration'}
      </Button>
    </div>
  );
};
