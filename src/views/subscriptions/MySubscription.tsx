import React, { useEffect } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { BillingHistory } from '../../components/subscriptions/BillingHistory';
import { CreditCard, CalendarDays, Zap, AlertTriangle } from 'lucide-react';

export const MySubscription: React.FC = () => {
  const { 
    subscription, 
    plans,
    billingHistory,
    isLoading,
    isSubmitting,
    error,
    loadMySubscription,
    loadPlans,
    loadBillingHistory,
    handleCancel,
    isMock
  } = useSubscriptions();

  useEffect(() => {
    loadMySubscription();
    loadPlans();
    loadBillingHistory();
  }, [loadMySubscription, loadPlans, loadBillingHistory]);

  const currentPlan = plans.find(p => p.id === subscription?.planId);

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'active': return { label: 'Actif', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' };
      case 'past_due': return { label: 'Impayé', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
      case 'cancelled': return { label: 'Annulé', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' };
      default: return { label: status || 'Inconnu', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' };
    }
  };

  const statusConfig = getStatusDisplay(subscription?.status);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex flex-col gap-8">
      
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Mon Abonnement</h1>
        <p className="text-gray-600 dark:text-gray-400">Gérez votre forfait et consultez votre historique.</p>
      </div>

      {isMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Mode Démonstration :</strong> Ces données sont simulées localement. 
            Aucun backend n'est actuellement connecté pour traiter les paiements ou les renouvellements réels.
          </p>
        </div>
      )}

      {/* CURRENT PLAN SECTION */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan actuel</h2>
        
        {isLoading && !subscription ? (
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ) : !subscription ? (
          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400">Vous n'avez aucun abonnement actif.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Forfait</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentPlan?.name || 'Inconnu'}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold w-fit ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Montant
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currentPlan ? `${currentPlan.price} ${currentPlan.currency}` : '---'}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Prochaine échéance
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              {subscription.status === 'active' && (
                <button
                  onClick={() => handleCancel(subscription.id)}
                  disabled={isSubmitting}
                  className="min-h-[44px] px-6 py-2 rounded-xl font-bold border-2 border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Annulation...' : "Annuler l'abonnement"}
                </button>
              )}
            </div>
            
            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Votre abonnement prendra fin le {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}.
              </p>
            )}
          </div>
        )}
      </section>

      {/* BILLING HISTORY SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Historique de facturation</h2>
        </div>
        
        <BillingHistory 
          history={billingHistory} 
          isLoading={isLoading} 
          error={error} 
          onRetry={loadBillingHistory} 
        />
      </section>

    </div>
  );
};
