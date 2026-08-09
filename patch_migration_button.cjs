const fs = require('fs');

const code = `import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function MigrationButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { firebaseUser } = useAuth();

  const runMigration = async () => {
    setLoading(true);
    setStatus('Migration en cours...');
    
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch('/api/admin/ambassadors/migrate', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la migration');
      }
      
      if (data.warning) {
        setStatus(\`Avertissement: \${data.warning}\`);
      } else {
        setStatus(\`Succès ! \${data.migrated} profils mis à jour.\`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('Erreur: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mt-4">
      <h3 className="font-bold text-white mb-2">Migration des Ambassadeurs</h3>
      <p className="text-slate-400 text-sm mb-4">
        Crée ou met à jour les profils ambassadeurs manquants pour tous les utilisateurs existants.
      </p>
      <button 
        onClick={runMigration}
        disabled={loading}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold transition-colors disabled:opacity-50"
      >
        {loading ? 'En cours...' : 'Lancer la migration'}
      </button>
      {status && <p className="mt-2 text-sm text-emerald-400 font-bold">{status}</p>}
    </div>
  );
}
`;

fs.writeFileSync('src/views/admin/MigrationButton.tsx', code);
