import { useState, useCallback } from 'react';
import { 
  SubscriptionService, 
  SubscriptionPlan, 
  UserSubscription, 
  BillingRecord 
} from '../services/subscriptionService';

type ActionState = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

export const useSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  
  const [state, setState] = useState<ActionState>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await SubscriptionService.getPlans();
      setPlans(data);
      setState('idle');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setState('error');
    }
  }, []);

  const loadMySubscription = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await SubscriptionService.getCurrentSubscription();
      setSubscription(data);
      setState('idle');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setState('error');
    }
  }, []);

  const loadBillingHistory = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await SubscriptionService.getBillingHistory();
      setBillingHistory(data);
      setState('idle');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setState('error');
    }
  }, []);

  const handleSubscribe = useCallback(async (planId: string, pin?: string) => {
    setState('submitting');
    setError(null);
    try {
      // Basic client-side idempotency key generation (Mock UX level only)
      const idempotencyKey = `sub_${planId}_${Date.now()}`;
      
      const result = await SubscriptionService.subscribe({
        planId,
        pin,
        idempotencyKey
      });

      if (result.success) {
        setState('success');
        // Reset success state after a delay
        setTimeout(() => setState('idle'), 3000);
        return true;
      }
      return false;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de paiement');
      setState('error');
      return false;
    }
  }, []);

  const handleCancel = useCallback(async (subscriptionId: string) => {
    setState('submitting');
    setError(null);
    try {
      const result = await SubscriptionService.cancelSubscription(subscriptionId);
      if (result.success) {
        setState('success');
        setTimeout(() => setState('idle'), 3000);
        await loadMySubscription(); // reload current state
        return true;
      }
      return false;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setState('error');
      return false;
    }
  }, [loadMySubscription]);

  return {
    plans,
    subscription,
    billingHistory,
    state,
    error,
    isLoading: state === 'loading',
    isSubmitting: state === 'submitting',
    isSuccess: state === 'success',
    isError: state === 'error',
    loadPlans,
    loadMySubscription,
    loadBillingHistory,
    handleSubscribe,
    handleCancel,
    isMock: SubscriptionService.STATUS.isMock
  };
};
