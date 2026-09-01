export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired' | 'pending';
export type BillingStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'once';
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
}

export interface BillingRecord {
  id: string;
  subscriptionId: string;
  date: string;
  amount: number;
  currency: string;
  status: BillingStatus;
  description: string;
  publicReference: string;
}

export interface SubscribeRequest {
  planId: string;
  pin?: string;
  idempotencyKey: string;
}

// MOCK DATA
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    name: 'Basique',
    description: 'Pour découvrir Ndara et ses fonctionnalités de base.',
    price: 0,
    currency: 'XAF',
    billingPeriod: 'monthly',
    features: ['Accès aux cours gratuits', 'Support communautaire'],
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    description: 'Idéal pour les professionnels souhaitant se former activement.',
    price: 5000,
    currency: 'XAF',
    billingPeriod: 'monthly',
    features: ['Accès illimité', 'Certificats de réussite', 'Support prioritaire', 'Mode hors-ligne basique'],
    isPopular: true,
    isActive: true,
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    description: "L'expérience ultime avec mentorat et suivi.",
    price: 15000,
    currency: 'XAF',
    billingPeriod: 'monthly',
    features: ['Tout de Pro', 'Mentorat mensuel (1h)', 'Accès événements VIP', 'Ressources téléchargeables'],
    isActive: true,
  }
];

const MOCK_SUBSCRIPTION: UserSubscription = {
  id: 'sub_12345',
  planId: 'plan_pro',
  status: 'active',
  startDate: '2026-01-15T10:00:00Z',
  currentPeriodStart: '2026-08-15T10:00:00Z',
  currentPeriodEnd: '2026-09-15T10:00:00Z',
  autoRenew: true,
  cancelAtPeriodEnd: false,
};

const MOCK_BILLING_HISTORY: BillingRecord[] = [
  {
    id: 'inv_88291',
    subscriptionId: 'sub_12345',
    date: '2026-08-15T10:00:00Z',
    amount: 5000,
    currency: 'XAF',
    status: 'paid',
    description: 'Abonnement Pro - Mensuel',
    publicReference: 'ND-2026-08-15-88291'
  },
  {
    id: 'inv_81230',
    subscriptionId: 'sub_12345',
    date: '2026-07-15T10:00:00Z',
    amount: 5000,
    currency: 'XAF',
    status: 'paid',
    description: 'Abonnement Pro - Mensuel',
    publicReference: 'ND-2026-07-15-81230'
  },
  {
    id: 'inv_70192',
    subscriptionId: 'sub_12345',
    date: '2026-06-15T10:00:00Z',
    amount: 5000,
    currency: 'XAF',
    status: 'failed',
    description: 'Abonnement Pro - Mensuel (Échec)',
    publicReference: 'ND-2026-06-15-70192'
  }
];

/**
 * Subscription Service
 * 
 * NOTE: Currently explicitely mocked. In a future phase, this will connect
 * to Firebase Cloud Functions to validate PINs, amounts, and manage the Stripe/Mobile Money logic.
 * The frontend NEVER decides the final price or status.
 */
export class SubscriptionService {
  public static readonly STATUS = {
    isMock: true,
    backendConnected: false,
  };

  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getPlans(): Promise<SubscriptionPlan[]> {
    await this.delay(600);
    return MOCK_PLANS.filter(p => p.isActive);
  }

  static async getCurrentSubscription(): Promise<UserSubscription | null> {
    await this.delay(500);
    return MOCK_SUBSCRIPTION;
  }

  static async getBillingHistory(): Promise<BillingRecord[]> {
    await this.delay(800);
    return MOCK_BILLING_HISTORY;
  }

  /**
   * Request a plan change or new subscription.
   * NEVER trust the client's decision on the price. Send the requested planId.
   */
  static async subscribe(request: SubscribeRequest): Promise<{ success: boolean; message: string; subId?: string }> {
    await this.delay(1200);
    
    // Fake mock validation
    if (request.planId !== 'plan_free' && (!request.pin || request.pin.length !== 4)) {
      throw new Error('PIN invalide ou manquant.');
    }

    if (this.STATUS.isMock) {
      return {
        success: true,
        message: 'Opération réussie (BACKEND_NOT_CONNECTED - Simulation locale)',
        subId: 'sub_mock_999'
      };
    }
    
    throw new Error('Backend non connecté.');
  }

  static async cancelSubscription(_subscriptionId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(1000);
    if (this.STATUS.isMock) {
      return {
        success: true,
        message: 'Abonnement annulé à la fin de la période (BACKEND_NOT_CONNECTED - Simulation locale)'
      };
    }
    throw new Error('Backend non connecté.');
  }
}
