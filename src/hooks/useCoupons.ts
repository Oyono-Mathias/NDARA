import { useState, useCallback } from 'react';
import { 
  CouponService, 
  Coupon, 
  Promotion, 
  CouponValidationResult, 
  CouponValidationContext,
  CouponStatus 
} from '../services/couponService';

export const useCoupons = () => {
  // Global loading states
  const [loadingPromotions, setLoadingPromotions] = useState<boolean>(false);
  const [loadingCoupons, setLoadingCoupons] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [togglingStatus, setTogglingStatus] = useState<boolean>(false);

  // Data states
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // Validation states
  const [validatedCouponResult, setValidatedCouponResult] = useState<CouponValidationResult | null>(null);
  
  // Error states
  const [error, setError] = useState<string | null>(null);

  const fetchActivePromotions = useCallback(async () => {
    setLoadingPromotions(true);
    setError(null);
    try {
      const res = await CouponService.getActivePromotions();
      setPromotions(res.data);
    } catch (err) {
      setError('Impossible de charger les promotions.');
    } finally {
      setLoadingPromotions(false);
    }
  }, []);

  const fetchAllCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    setError(null);
    try {
      const res = await CouponService.getCoupons();
      setCoupons(res.data);
    } catch (err) {
      setError('Impossible de charger la liste des coupons.');
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  const validateCouponCode = useCallback(async (code: string, context?: CouponValidationContext) => {
    setValidating(true);
    setValidatedCouponResult(null);
    setError(null);
    
    try {
      const res = await CouponService.validateCoupon(code, context);
      setValidatedCouponResult(res);
      return res.valid;
    } catch (err) {
      setError('Une erreur réseau est survenue lors de la validation du coupon.');
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  const resetValidation = useCallback(() => {
    setValidatedCouponResult(null);
    setError(null);
  }, []);

  const toggleCouponStatus = useCallback(async (couponId: string, currentStatus: CouponStatus) => {
    setTogglingStatus(true);
    setError(null);
    try {
      const newStatus: CouponStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const res = await CouponService.updateCouponStatus(couponId, newStatus);
      
      // Mise à jour optimiste locale
      setCoupons(prev => prev.map(c => c.id === couponId ? res.data : c));
      return true;
    } catch (err) {
      setError('Erreur lors du changement de statut du coupon.');
      return false;
    } finally {
      setTogglingStatus(false);
    }
  }, []);

  return {
    // States
    promotions,
    coupons,
    validatedCouponResult,
    
    // Loadings
    loadingPromotions,
    loadingCoupons,
    validating,
    togglingStatus,
    
    // Errors
    error,
    
    // Actions
    fetchActivePromotions,
    fetchAllCoupons,
    validateCouponCode,
    resetValidation,
    toggleCouponStatus
  };
};
