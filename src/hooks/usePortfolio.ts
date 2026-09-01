import { useState, useCallback } from 'react';
import { PortfolioService, Portfolio, PortfolioVisibility } from '../services/portfolioService';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [publicPortfolio, setPublicPortfolio] = useState<Portfolio | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  const fetchMyPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PortfolioService.getMyPortfolio();
      setPortfolio(response.data);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de votre portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicPortfolio = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    setPublicPortfolio(null);
    try {
      const response = await PortfolioService.getPublicPortfolio(userId);
      setPublicPortfolio(response.data);
      setIsMockData(response.isMock);
    } catch (err) {
      let errorMessage = "Erreur lors du chargement du portfolio.";
      if (err instanceof Error) {
        if (err.message === 'PORTFOLIO_NOT_PUBLIC') {
          errorMessage = "Ce portfolio est privé et n'est pas accessible au public.";
        } else if (err.message === 'PORTFOLIO_NOT_FOUND') {
          errorMessage = "Utilisateur ou portfolio introuvable.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleVisibility = async (newVisibility: PortfolioVisibility): Promise<boolean> => {
    if (updating) return false;
    
    setUpdating(true);
    setError(null);
    try {
      const response = await PortfolioService.updateVisibility(newVisibility);
      setPortfolio(response.data);
      setIsMockData(response.isMock);
      return response.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour de la visibilité.");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    portfolio,
    publicPortfolio,
    loading,
    updating,
    error,
    isMockData,
    fetchMyPortfolio,
    fetchPublicPortfolio,
    toggleVisibility
  };
}
