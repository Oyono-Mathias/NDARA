export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface ExchangeRate {
  source: string;
  target: string;
  rate: number;
  timestamp: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'XAF', name: 'Franc CFA BEAC', symbol: 'FCFA', decimals: 0 },
  { code: 'USD', name: 'Dollar américain', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'GBP', name: 'Livre sterling', symbol: '£', decimals: 2 },
];

// Mock rates base to XAF for preview purposes
const MOCK_RATES: Record<string, Record<string, number>> = {
  'XAF': { 'XAF': 1, 'USD': 0.0016, 'EUR': 0.0015, 'GBP': 0.0013 },
  'USD': { 'XAF': 610.50, 'USD': 1, 'EUR': 0.92, 'GBP': 0.79 },
  'EUR': { 'XAF': 655.96, 'USD': 1.09, 'EUR': 1, 'GBP': 0.85 },
  'GBP': { 'XAF': 768.10, 'USD': 1.27, 'EUR': 1.17, 'GBP': 1 },
};

export class CurrencyService {
  public static readonly STATUS = {
    isMock: true,
    backendConnected: false,
  };

  /**
   * Retrieves the list of supported currencies.
   * In a real environment, this might come from a remote configuration.
   */
  static async getSupportedCurrencies(): Promise<Currency[]> {
    return [...SUPPORTED_CURRENCIES];
  }

  /**
   * Retrieves the exchange rate between two currencies.
   * NOTE: For presentation only. The backend is the sole source of truth for transactions.
   */
  static async getExchangeRate(sourceCode: string, targetCode: string): Promise<ExchangeRate> {
    // Fake network delay for mock
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.isValidCurrency(sourceCode) || !this.isValidCurrency(targetCode)) {
      throw new Error(`Devise non supportée: ${sourceCode} ou ${targetCode}`);
    }

    const rate = MOCK_RATES[sourceCode]?.[targetCode];
    
    if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
      throw new Error(`Taux de change invalide ou indisponible pour ${sourceCode} vers ${targetCode}`);
    }

    return {
      source: sourceCode,
      target: targetCode,
      rate,
      timestamp: new Date().toISOString(),
    };
  }

  private static isValidCurrency(code: string): boolean {
    return SUPPORTED_CURRENCIES.some(c => c.code === code);
  }
}
