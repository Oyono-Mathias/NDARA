import React, { useEffect } from 'react';
import { useAffiliation } from '../../hooks/useAffiliation';
import { History, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Wallet, AlertTriangle } from 'lucide-react';
import { CommissionStatus } from '../../services/affiliationService';

export const CommissionHistory: React.FC = () => {
  const { history, loading, error, fetchHistory } = useAffiliation();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusConfig = (status: CommissionStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          colors: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'approved':
        return {
          label: 'Approuvée',
          colors: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
          icon: <CheckCircle className="w-3.5 h-3.5" />
        };
      case 'paid':
        return {
          label: 'Payée',
          colors: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
          icon: <Wallet className="w-3.5 h-3.5" />
        };
      case 'rejected':
        return {
          label: 'Rejetée',
          colors: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
          icon: <XCircle className="w-3.5 h-3.5" />
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          colors: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chargement de l'historique...</p>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-red-700 dark:text-red-400 text-center font-medium">{error}</p>
        <button onClick={fetchHistory} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-xl font-bold">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" />
            Historique des Commissions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Suivez l'état de vos gains. Les validations réelles sont effectuées par le serveur.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-gray-800/20 text-center">
            <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 opacity-50" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">Aucune commission pour le moment.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Partagez vos liens pour générer vos premiers revenus.</p>
          </div>
        ) : (
          history.map((commission) => {
            const statusConfig = getStatusConfig(commission.status);
            const dateObj = new Date(commission.date);

            return (
              <div key={commission.id} className="flex flex-col sm:flex-row justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm gap-4">
                
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white text-base break-words">
                      {commission.event}
                    </span>
                    {commission.isMock && (
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-bold rounded">
                        Mock
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {dateObj.toLocaleDateString('fr-FR')} à {dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {commission.referralId && (
                      <div className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-gray-600 dark:text-gray-400">
                        Réf: {commission.referralId}
                      </div>
                    )}
                    {commission.publicRef && (
                      <div className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-gray-600 dark:text-gray-400">
                        TX: {commission.publicRef}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {formatCurrency(commission.amount, commission.currency)}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${statusConfig.colors}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
