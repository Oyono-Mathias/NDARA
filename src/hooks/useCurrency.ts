import { useState, useCallback, useEffect } from 'react';
import { CurrencyService, Currency, ExchangeRate } from '../services/currencyService';
import { convertAmount } from '../utils/currencyConverter';

type CurrencyState = 'idle' | 'loading' | 'error' | 'success';

export const useCurrency = (initialCurrencyCode: string = 'XAF') => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  
  // Cache rates locally to avoid unnecessary network calls
  const [ratesCache, setRatesCache] = useState<Record<string, ExchangeRate>>({});
  
  const [state, setState] = useState<CurrencyState>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadCurrencies = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const list = await CurrencyService.getSupportedCurrencies();
      setCurrencies(list);
      
      const defaultCur = list.find(c => c.code === initialCurrencyCode) || list[0] || null;
      setSelectedCurrency(defaultCur);
      
      setState('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.');
      setState('error');
    }
  }, [initialCurrencyCode]);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  /**
   * Fetches an exchange rate. Uses local cache if available.
   */
  const fetchRate = useCallback(async (sourceCode: string, targetCode: string): Promise<number | null> => {
    if (sourceCode === targetCode) return 1;

    const cacheKey = `${sourceCode}_${targetCode}`;
    if (ratesCache[cacheKey]) {
      return ratesCache[cacheKey].rate;
    }

    setState('loading');
    setError(null);
    
    try {
      const rateData = await CurrencyService.getExchangeRate(sourceCode, targetCode);
      setRatesCache(prev => ({ ...prev, [cacheKey]: rateData }));
      setState('success');
      return rateData.rate;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Taux indisponible.');
      setState('error');
      return null;
    }
  }, [ratesCache]);

  /**
   * Helper to quickly convert a given amount from the currently selected currency to a target currency.
   */
  const convertFromSelected = useCallback(async (amount: number, targetCode: string): Promise<number | null> => {
    if (!selectedCurrency) {
      setError('Aucune devise source sélectionnée.');
      return null;
    }

    if (selectedCurrency.code === targetCode) {
      return convertAmount(amount, 1, targetCode); // Uses convertAmount to apply decimal rounding
    }

    const rate = await fetchRate(selectedCurrency.code, targetCode);
    if (rate === null) return null;

    try {
      return convertAmount(amount, rate, targetCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de conversion.');
      return null;
    }
  }, [selectedCurrency, fetchRate]);

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    fetchRate,
    convertFromSelected,
    isLoading: state === 'loading',
    isError: state === 'error',
    error,
    isMock: CurrencyService.STATUS.isMock,
  };
};
