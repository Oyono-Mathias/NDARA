export type CouponStatus = 'active' | 'inactive' | 'expired' | 'scheduled' | 'exhausted';
export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  currency?: string;
  status: CouponStatus;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number;
  usageCount: number;
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  isMock: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountText: string;
  startsAt: string;
  expiresAt: string;
  conditions?: string;
  imageUrl?: string;
  isActive: boolean;
  isMock: boolean;
}

export type CouponErrorCode = 
  | 'COUPON_INVALID' 
  | 'COUPON_EXPIRED' 
  | 'COUPON_INACTIVE' 
  | 'COUPON_EXHAUSTED' 
  | 'COUPON_MINIMUM_NOT_REACHED' 
  | 'COUPON_NOT_ELIGIBLE'
  | 'BACKEND_NOT_CONNECTED';

export interface CouponValidationContext {
  courseId?: string;
  userId?: string;
  purchaseAmount?: number;
  currency?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  errorCode?: CouponErrorCode;
  errorMessage?: string;
  isMock: boolean;
}

export interface CouponResponse<T> {
  data: T;
  isMock: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    code: 'WELCOME20',
    description: 'Réduction de bienvenue de 20%',
    type: 'percentage',
    value: 20,
    status: 'active',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days future
    usageCount: 42,
    usageLimit: 100,
    isMock: true
  },
  {
    id: 'coup-002',
    code: 'FIXE5000',
    description: 'Réduction de 5000 XAF',
    type: 'fixed',
    value: 5000,
    currency: 'XAF',
    status: 'active',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    usageCount: 15,
    minimumPurchaseAmount: 20000,
    isMock: true
  },
  {
    id: 'coup-003',
    code: 'SUMMER_OLD',
    description: 'Promo d\'été terminée',
    type: 'percentage',
    value: 30,
    status: 'expired',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    usageCount: 200,
    isMock: true
  },
  {
    id: 'coup-004',
    code: 'DISABLED10',
    description: 'Désactivé manuellement',
    type: 'percentage',
    value: 10,
    status: 'inactive',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    usageCount: 5,
    isMock: true
  },
  {
    id: 'coup-005',
    code: 'FLASH100',
    description: 'Vente flash épuisée',
    type: 'percentage',
    value: 50,
    status: 'exhausted',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    usageCount: 10,
    usageLimit: 10,
    isMock: true
  }
];

const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-001',
    title: 'Rentrée Scolaire',
    description: 'Profitez d\'une réduction exceptionnelle sur tous les cours de développement pour bien démarrer l\'année.',
    discountText: '-20% avec le code WELCOME20',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    conditions: 'Valable pour les nouveaux inscrits uniquement. Non cumulable.',
    isActive: true,
    isMock: true
  },
  {
    id: 'promo-002',
    title: 'Black Friday en avance',
    description: 'Des réductions massives à venir.',
    discountText: 'Jusqu\'à -50%',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(),
    conditions: 'Bientôt disponible.',
    isActive: false,
    isMock: true
  }
];

/**
 * Service de gestion des coupons et promotions.
 * ZERO TRUST: La validation finale, l'éligibilité et le calcul du montant exact
 * de la remise doivent obligatoirement être effectués côté Backend (Cloud Functions).
 */
export class CouponService {
  /**
   * Vérifie la validité d'un code promotionnel simulé.
   * Cette méthode reproduit conceptuellement la vérification du backend.
   */
  static async validateCoupon(code: string, context?: CouponValidationContext): Promise<CouponValidationResult> {
    await delay(1000); // Simulation réseau

    const normalizedCode = code.trim().toUpperCase();
    const coupon = MOCK_COUPONS.find(c => c.code.toUpperCase() === normalizedCode);

    if (!coupon) {
      return {
        valid: false,
        errorCode: 'COUPON_INVALID',
        errorMessage: 'Ce code promotionnel n\'existe pas.',
        isMock: true
      };
    }

    if (coupon.status === 'inactive') {
      return {
        valid: false,
        coupon,
        errorCode: 'COUPON_INACTIVE',
        errorMessage: 'Ce coupon a été désactivé.',
        isMock: true
      };
    }

    if (coupon.status === 'expired' || new Date(coupon.expiresAt) < new Date()) {
      return {
        valid: false,
        coupon,
        errorCode: 'COUPON_EXPIRED',
        errorMessage: 'Ce coupon a expiré.',
        isMock: true
      };
    }

    if (coupon.status === 'exhausted' || (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)) {
      return {
        valid: false,
        coupon,
        errorCode: 'COUPON_EXHAUSTED',
        errorMessage: 'La limite d\'utilisation de ce coupon a été atteinte.',
        isMock: true
      };
    }

    if (context?.purchaseAmount && coupon.minimumPurchaseAmount && context.purchaseAmount < coupon.minimumPurchaseAmount) {
      return {
        valid: false,
        coupon,
        errorCode: 'COUPON_MINIMUM_NOT_REACHED',
        errorMessage: `Le montant minimum d\'achat de ${coupon.minimumPurchaseAmount} ${coupon.currency || ''} n'est pas atteint.`,
        isMock: true
      };
    }

    return {
      valid: true,
      coupon,
      isMock: true
    };
  }

  /**
   * Récupère la liste des promotions actives (pour affichage bannière).
   */
  static async getActivePromotions(): Promise<CouponResponse<Promotion[]>> {
    await delay(600);
    const activePromos = MOCK_PROMOTIONS.filter(p => p.isActive && new Date(p.expiresAt) > new Date());
    return {
      data: activePromos,
      isMock: true
    };
  }

  /**
   * (ADMIN) Récupère la liste de tous les coupons.
   */
  static async getCoupons(): Promise<CouponResponse<Coupon[]>> {
    await delay(800);
    return {
      data: [...MOCK_COUPONS],
      isMock: true
    };
  }

  /**
   * (ADMIN) Change le statut d'un coupon de manière simulée.
   * ZERO TRUST: Le backend Firebase Auth devra vérifier le rôle admin.
   */
  static async updateCouponStatus(couponId: string, newStatus: CouponStatus): Promise<CouponResponse<Coupon>> {
    await delay(1000);
    const couponIndex = MOCK_COUPONS.findIndex(c => c.id === couponId);
    
    if (couponIndex === -1) {
      throw new Error('Coupon introuvable.');
    }

    // Clonage pour immutabilité basique du mock
    const updatedCoupon = { ...MOCK_COUPONS[couponIndex], status: newStatus };
    MOCK_COUPONS[couponIndex] = updatedCoupon;

    return {
      data: updatedCoupon,
      isMock: true
    };
  }
}
