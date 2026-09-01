import React, { useState, useEffect } from 'react';
import { useAffiliation } from '../../hooks/useAffiliation';
import { Link, Copy, Check, Share2, BarChart2, Loader2, AlertCircle, Users } from 'lucide-react';

export const ReferralLinks: React.FC = () => {
  const { links, loading, error, fetchLinks } = useAffiliation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie', err);
    }
  };

  if (loading && links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chargement de vos liens...</p>
      </div>
    );
  }

  if (error && links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-red-700 dark:text-red-400 text-center font-medium">{error}</p>
        <button onClick={fetchLinks} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-xl font-bold">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Link className="w-6 h-6 text-indigo-500" />
            Liens de Parrainage
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Partagez ces liens pour inviter vos proches et gagner des commissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {links.map((link) => (
          <div key={link.id} className={`flex flex-col rounded-2xl border bg-white dark:bg-gray-800 p-5 gap-4 transition-all ${
            link.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-75'
          }`}>
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Code Promo</span>
                <span className="text-lg font-black text-gray-900 dark:text-white break-all">{link.code}</span>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest ${
                link.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {link.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex-1 truncate text-sm text-gray-600 dark:text-gray-400 font-mono px-2">
                {link.url}
              </div>
              <button
                onClick={() => handleCopy(link.id, link.url)}
                className="flex items-center justify-center w-10 h-10 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500/50 outline-none"
                aria-label="Copier le lien"
              >
                {copiedId === link.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5"/> Clics</span>
                <span className="font-bold text-gray-900 dark:text-white mt-0.5">{link.clicks}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Inscrits</span>
                <span className="font-bold text-gray-900 dark:text-white mt-0.5">{link.registrations}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5"/> Conversions</span>
                <span className="font-bold text-gray-900 dark:text-white mt-0.5">{link.conversions}</span>
              </div>
            </div>

            {link.campaign && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Campagne : <span className="font-medium text-gray-700 dark:text-gray-300">{link.campaign}</span>
              </div>
            )}
            
          </div>
        ))}
      </div>
      
    </div>
  );
};