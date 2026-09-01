import React from 'react';
import { SubscriptionPlan } from '../../services/subscriptionService';
import { Check, Loader2 } from 'lucide-react';

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlanId?: string;
  isSubmitting?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  currentPlanId, 
  isSubmitting = false, 
  onSelect 
}) => {
  const isCurrent = plan.id === currentPlanId;
  const priceDisplay = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: plan.currency,
    maximumFractionDigits: 0
  }).format(plan.price);

  return (
    <div className={`flex flex-col p-6 rounded-2xl border ${
      plan.isPopular 
        ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-sm' 
        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
    } relative`}>
      {plan.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Populaire
        </span>
      )}

      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[40px]">
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-black text-gray-900 dark:text-white">
            {plan.price === 0 ? 'Gratuit' : priceDisplay}
          </span>
          {plan.price > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              /{plan.billingPeriod === 'monthly' ? 'mois' : 'an'}
            </span>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-indigo-500 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent || isSubmitting}
        className={`min-h-[48px] w-full rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
          isCurrent
            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
            : plan.isPopular
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              : 'bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-indigo-500 dark:text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Traitement...
          </>
        ) : isCurrent ? (
          'Plan Actuel'
        ) : plan.price === 0 ? (
          'Passer au gratuit'
        ) : (
          'Sélectionner ce plan'
        )}
      </button>
    </div>
  );
};
