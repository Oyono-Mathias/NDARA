import React, { useState } from 'react';
import { useCoupons } from '../../hooks/useCoupons';
import { Tag, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CouponValidationContext } from '../../services/couponService';

interface CouponInputProps {
  validationContext?: CouponValidationContext;
  onCouponApplied?: (couponCode: string) => void;
  onCouponRemoved?: () => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({ 
  validationContext,
  onCouponApplied,
  onCouponRemoved
}) => {
  const { validateCouponCode, resetValidation, validatedCouponResult, validating, error } = useCoupons();
  const [code, setCode] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const isValid = await validateCouponCode(cleanCode, validationContext);
    if (isValid && onCouponApplied) {
      onCouponApplied(cleanCode);
    }
  };

  const handleRemove = () => {
    setCode('');
    resetValidation();
    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  const isSuccess = validatedCouponResult?.valid;
  const isError = validatedCouponResult?.valid === false || error;

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="coupon-code" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Code promotionnel
      </label>

      {isSuccess && validatedCouponResult?.coupon ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                Code {validatedCouponResult.coupon.code} appliqué
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {validatedCouponResult.coupon.type === 'percentage' 
                  ? `Réduction de ${validatedCouponResult.coupon.value}%`
                  : `Réduction de ${validatedCouponResult.coupon.value} ${validatedCouponResult.coupon.currency || ''}`
                }
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Retirer le code promotionnel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: WELCOME20"
              disabled={validating}
              maxLength={20}
              className={`
                w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl 
                text-sm font-mono uppercase transition-colors min-h-[44px]
                focus:ring-2 focus:ring-indigo-500/50 outline-none
                ${isError ? 'border-red-300 dark:border-red-800 focus:ring-red-500/50' : 'border-gray-200 dark:border-gray-700'}
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            />
          </div>
          <button
            type="submit"
            disabled={!code.trim() || validating}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all min-h-[44px]
              ${code.trim() && !validating
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Appliquer'}
          </button>
        </form>
      )}

      {isError && (
        <div className="flex items-start gap-2 mt-1 text-red-600 dark:text-red-400 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || validatedCouponResult?.errorMessage}</span>
        </div>
      )}

      {validatedCouponResult?.isMock && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 block">
          Mode démonstration (Mock)
        </span>
      )}
    </div>
  );
};
