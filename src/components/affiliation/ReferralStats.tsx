import React from 'react';
import { AffiliationStats } from '../../services/affiliationService';
import { Users, UserCheck, TrendingUp, CheckCircle, Clock, Wallet, DollarSign } from 'lucide-react';

interface ReferralStatsProps {
  stats: AffiliationStats;
}

export const ReferralStats: React.FC<ReferralStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: stats.currency, maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Section Réseau / Audience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-1">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Filleuls</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalReferrals}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-1">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <UserCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Filleuls Actifs</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.activeReferrals}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Conversions</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.conversions}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-1">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Taux Conv.</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.conversionRate}%</span>
        </div>
      </div>

      {/* Section Commissions */}
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mt-4">Commissions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-1">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold">En Attente</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white break-words">
            {formatCurrency(stats.pendingCommissions)}
          </span>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-1">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Wallet className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold">Validées & Dispo.</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white break-words">
            {formatCurrency(stats.approvedCommissions)}
          </span>
        </div>

        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800 shadow-sm flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-1">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <DollarSign className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold">Déjà Payées</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white break-words">
            {formatCurrency(stats.paidCommissions)}
          </span>
        </div>
      </div>
      
    </div>
  );
};
