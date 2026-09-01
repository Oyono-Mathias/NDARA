export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';

export interface Commission {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: CommissionStatus;
  event: string;
  publicRef?: string;
  referralId?: string;
  isMock: boolean;
}

export interface ReferralLink {
  id: string;
  code: string;
  url: string;
  isActive: boolean;
  clicks: number;
  registrations: number;
  conversions: number;
  createdAt: string;
  campaign?: string;
  isMock: boolean;
}

export interface AffiliationStats {
  totalReferrals: number;
  activeReferrals: number;
  conversions: number;
  conversionRate: number;
  pendingCommissions: number;
  approvedCommissions: number;
  paidCommissions: number;
  totalGenerated: number;
  currency: string;
  isMock: boolean;
}

export interface AffiliationResponse<T> {
  data: T;
  isMock: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_STATS: AffiliationStats = {
  totalReferrals: 124,
  activeReferrals: 45,
  conversions: 12,
  conversionRate: 9.67,
  pendingCommissions: 45000,
  approvedCommissions: 15000,
  paidCommissions: 120000,
  totalGenerated: 180000,
  currency: 'XAF',
  isMock: true
};

const MOCK_LINKS: ReferralLink[] = [
  {
    id: 'link-1',
    code: 'NDARA-PRO-24',
    url: 'https://ndara.app/ref/NDARA-PRO-24',
    isActive: true,
    clicks: 840,
    registrations: 42,
    conversions: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    campaign: 'Réseaux Sociaux',
    isMock: true
  },
  {
    id: 'link-2',
    code: 'WELCOME50',
    url: 'https://ndara.app/ref/WELCOME50',
    isActive: false,
    clicks: 150,
    registrations: 5,
    conversions: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    campaign: 'Ancienne Campagne',
    isMock: true
  }
];

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'com-1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    amount: 15000,
    currency: 'XAF',
    status: 'pending',
    event: 'Abonnement Premium (Filleul)',
    referralId: 'usr-***42',
    isMock: true
  },
  {
    id: 'com-2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    amount: 5000,
    currency: 'XAF',
    status: 'approved',
    event: 'Achat Cours (Filleul)',
    referralId: 'usr-***89',
    isMock: true
  },
  {
    id: 'com-3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    amount: 25000,
    currency: 'XAF',
    status: 'paid',
    event: 'Pack Masterclass (Filleul)',
    publicRef: 'TX-9938210',
    referralId: 'usr-***12',
    isMock: true
  },
  {
    id: 'com-4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    amount: 15000,
    currency: 'XAF',
    status: 'rejected',
    event: 'Abonnement Premium (Filleul)',
    referralId: 'usr-***55',
    isMock: true
  }
];

/**
 * Service d'Affiliation (Frontend)
 * RÔLE : Interfacer l'UI avec le Backend.
 * SÉCURITÉ : Ne gère aucune autorisation ou logique financière réelle.
 */
export class AffiliationService {
  static async getStats(): Promise<AffiliationResponse<AffiliationStats>> {
    await delay(600);
    return { data: MOCK_STATS, isMock: true };
  }

  static async getLinks(): Promise<AffiliationResponse<ReferralLink[]>> {
    await delay(600);
    return { data: MOCK_LINKS, isMock: true };
  }

  static async getHistory(): Promise<AffiliationResponse<Commission[]>> {
    await delay(800);
    return { data: MOCK_COMMISSIONS, isMock: true };
  }

  /**
   * ZERO TRUST: Demande de retrait financier.
   * Le frontend transmet simplement le PIN au backend. 
   * Il ne valide pas le PIN localement et n'a pas l'autorité pour approuver.
   */
  static async requestWithdrawal(_amount: number, _pin: string): Promise<{ success: boolean; error?: string }> {
    await delay(1000);
    // Simulation: En mode mock ou non connecté, on refuse toujours l'opération financière
    // pour garantir qu'aucune fausse transaction n'est approuvée côté frontend.
    return { 
      success: false, 
      error: 'BACKEND_NOT_CONNECTED' 
    };
  }
}
