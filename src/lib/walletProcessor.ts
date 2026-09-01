import { AppError } from '../utils/firebaseErrors';

export const validateAmountXAF = (amount: number): AppError | null => {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return { code: 'validation/invalid-amount', message: 'Montant invalide', translationKey: 'errors.invalid_amount', category: 'validation' };
  }
  if (!Number.isInteger(amount)) {
    return { code: 'validation/decimal-not-allowed', message: 'Les centimes ne sont pas autorisés pour le XAF', translationKey: 'errors.decimal_not_allowed', category: 'validation' };
  }
  if (amount <= 0) {
    return { code: 'validation/negative-amount', message: 'Le montant doit être strictement positif', translationKey: 'errors.negative_amount', category: 'validation' };
  }
  return null;
};

export const walletProcessor = {
  prepareDebit: (amount: number, reason: string, pin: string) => {
    const error = validateAmountXAF(amount);
    if (error) throw error;
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      throw { code: 'validation/invalid-pin', message: 'PIN invalide (4 chiffres requis)', translationKey: 'errors.invalid_pin', category: 'validation' };
    }
    return {
      action: 'debit',
      amount,
      reason,
      prepared: true,
      timestamp: new Date().toISOString()
    };
  },
  prepareCredit: (amount: number, reason: string) => {
    const error = validateAmountXAF(amount);
    if (error) throw error;
    return {
      action: 'credit',
      amount,
      reason,
      prepared: true,
      timestamp: new Date().toISOString()
    };
  }
};
