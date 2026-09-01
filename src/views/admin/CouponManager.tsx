import React, { useEffect, useState } from 'react';
import { useCoupons } from '../../hooks/useCoupons';
import { Loader2, Search, Tag, AlertCircle, RefreshCw, Power } from 'lucide-react';
import { CouponStatus } from '../../services/couponService';

export const CouponManager: React.FC = () => {
  const { coupons, loadingCoupons, fetchAllCoupons, error, toggleCouponStatus, togglingStatus } = useCoupons();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CouponStatus | 'all'>('all');

  useEffect(() => {
    fetchAllCoupons();
  }, [fetchAllCoupons]);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (coupon.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: CouponStatus) => {
    switch (status) {
      case 'active': return { label: 'Actif', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'inactive': return { label: 'Inactif', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };
      case 'expired': return { label: 'Expiré', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      case 'exhausted': return { label: 'Épuisé', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'scheduled': return { label: 'Programmé', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Coupons & Promotions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les codes de réduction (Mode Simulation)</p>
        </div>
        <button 
          onClick={fetchAllCoupons}
          disabled={loadingCoupons}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold transition-colors min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${loadingCoupons ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[44px]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CouponStatus | 'all')}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[44px] min-w-[150px]"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="expired">Expiré</option>
          <option value="exhausted">Épuisé</option>
          <option value="scheduled">Programmé</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loadingCoupons && coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm text-gray-500">Chargement des coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-bold mb-1">Aucun coupon trouvé</p>
            <p className="text-sm text-gray-500">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Code</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Réduction</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Utilisations</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCoupons.map((coupon) => {
                  const statusConf = getStatusConfig(coupon.status);
                  const isToggleable = coupon.status === 'active' || coupon.status === 'inactive';
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-gray-900 dark:text-white uppercase">
                            {coupon.code}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                            {coupon.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ${coupon.currency}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-gray-600 dark:text-gray-400">
                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => isToggleable && toggleCouponStatus(coupon.id, coupon.status)}
                          disabled={!isToggleable || togglingStatus}
                          className={`
                            p-2 rounded-xl transition-all min-w-[44px] min-h-[44px] inline-flex items-center justify-center
                            ${!isToggleable 
                              ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' 
                              : coupon.status === 'active'
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                            }
                          `}
                          aria-label={coupon.status === 'active' ? 'Désactiver le coupon' : 'Activer le coupon'}
                          title={!isToggleable ? 'Action non disponible pour ce statut' : 'Basculer le statut'}
                        >
                          {togglingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
