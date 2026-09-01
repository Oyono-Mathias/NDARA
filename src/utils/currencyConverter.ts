/**
 * Pure function to determine the strict number of decimals for a given currency code.
 */
export const getCurrencyDecimals = (currencyCode: string): number => {
  switch (currencyCode.toUpperCase()) {
    case 'XAF':
      return 0; // CFA Francs typically don't display decimals
    case 'USD':
    case 'EUR':
    case 'GBP':
      return 2;
    default:
      return 2;
  }
};

/**
 * Pure function to convert an amount using a specific rate.
 * The result is mathematically rounded to the correct number of decimals for the target currency.
 * 
 * WARNING (Zero Trust):
 * This conversion is STRICTLY for UI preview/estimation. 
 * The frontend must NEVER calculate final transaction amounts, fees, or official rates.
 */
export const convertAmount = (
  amount: number,
  rate: number,
  targetCurrency: string
): number => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    throw new Error('Montant invalide.');
  }

  if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
    throw new Error('Taux invalide ou manquant.');
  }

  const rawResult = amount * rate;
  const decimals = getCurrencyDecimals(targetCurrency);
  const factor = Math.pow(10, decimals);
  
  // Clean rounding to avoid float artifacts (e.g., 0.1 + 0.2)
  return Math.round(rawResult * factor) / factor;
};
