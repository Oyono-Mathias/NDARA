import React, { useEffect, useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { PlanCard } from '../../components/subscriptions/PlanCard';
import { SubscriptionPlan } from '../../services/subscriptionService';
import { ShieldCheck, X, AlertCircle } from 'lucide-react';

export const SubscriptionPlans: React.FC = () => {
  const { 
    plans, 
    subscription, 
    isLoading, 
    isSubmitting, 
    isSuccess, 
    isError, 
    error, 
    loadPlans, 
    loadMySubscription, 
    handleSubscribe,
    isMock
  } = useSubscriptions();

  const [pinPrompt, setPinPrompt] = useState<{ isOpen: boolean; plan: SubscriptionPlan | null }>({
    isOpen: false,
    plan: null
  });
  const [pin, setPin] = useState('');

  useEffect(() => {
    loadPlans();
    loadMySubscription();
  }, [loadPlans, loadMySubscription]);

  const onSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.price > 0) {
      setPinPrompt({ isOpen: true, plan });
      setPin('');
    } else {
      // Free plan, no PIN required
      handleSubscribe(plan.id);
    }
  };

  const confirmSubscription = async () => {
    if (!pinPrompt.plan) return;
    
    // UI Validation only. Backend MUST re-validate the PIN.
    if (pin.length !== 4) return;
    
    const success = await handleSubscribe(pinPrompt.plan.id, pin);
    if (success) {
      setPinPrompt({ isOpen: false, plan: null });
      setPin('');
      loadMySubscription();
    }
  };

  const closePinPrompt = () => {
    if (!isSubmitting) {
      setPinPrompt({ isOpen: false, plan: null });
      setPin('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex flex-col">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">
          Choisissez votre abonnement
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Accédez à plus de contenus, obtenez des certificats et bénéficiez d'un accompagnement personnalisé.
        </p>
        {isMock && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-bold border border-amber-200 dark:border-amber-800">
            <ShieldCheck className="w-4 h-4" />
            Mode Démonstration (Backend non connecté)
          </div>
        )}
      </div>

      {isLoading && plans.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start">
          {plans.map(plan => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              currentPlanId={subscription?.planId}
              isSubmitting={isSubmitting}
              onSelect={onSelectPlan}
            />
          ))}
        </div>
      )}

      {/* PIN PROMPT MODAL (Simple inline implementation for UX demo) */}
      {pinPrompt.isOpen && pinPrompt.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Confirmer le paiement
                </h3>
                <button 
                  onClick={closePinPrompt}
                  disabled={isSubmitting}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Plan {pinPrompt.plan.name}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {pinPrompt.plan.price} {pinPrompt.plan.currency}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="pin-input" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Entrez votre code PIN (4 chiffres)
                </label>
                <input 
                  id="pin-input"
                  type="password" 
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\\D/g, ''))}
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 min-h-[48px] text-center text-2xl tracking-[0.5em] font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••"
                  autoComplete="off"
                />
              </div>

              {isError && error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {isSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm mt-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <p>Opération réussie.</p>
                </div>
              )}

              <button
                onClick={confirmSubscription}
                disabled={pin.length !== 4 || isSubmitting}
                className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-xl mt-4 transition-colors"
              >
                {isSubmitting ? 'Validation...' : 'Confirmer et Payer'}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 px-2">
                En confirmant, vous acceptez que le backend prélève le montant indiqué. 
                (Rappel: Le Frontend ne décide jamais de la transaction finale).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
