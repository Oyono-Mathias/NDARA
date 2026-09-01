import React from 'react';
import { BillingRecord } from '../../services/subscriptionService';
import { ReceiptText, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface BillingHistoryProps {
  history: BillingRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({ history, isLoading, error, onRetry }) => {
  if (isLoading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-lg font-medium flex items-center gap-2 transition-colors min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
        <ReceiptText className="w-8 h-8 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun historique de facturation.</p>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Payée' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Échec' };
      case 'pending':
        return { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'En attente' };
      case 'refunded':
        return { icon: RefreshCw, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Remboursée' };
      default:
        return { icon: ReceiptText, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', label: status };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {history.map((record) => {
        const config = getStatusConfig(record.status);
        const Icon = config.icon;
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: record.currency,
          maximumFractionDigits: 0
        }).format(record.amount);
        const formattedDate = new Date(record.date).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'short', year: 'numeric'
        });

        return (
          <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
            
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 dark:text-white truncate">
                  {record.description}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formattedDate}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span className="text-sm font-mono text-gray-400 dark:text-gray-500 truncate">
                    {record.publicReference}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white">
                {formattedAmount}
              </span>
              <span className={`text-xs font-bold ${config.color} mt-0.5`}>
                {config.label}
              </span>
            </div>

          </div>
        );
      })}
    </div>
  );
};
