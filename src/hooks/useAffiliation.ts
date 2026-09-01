import { useState, useCallback } from 'react';
import { 
  AffiliationService, 
  AffiliationStats, 
  ReferralLink, 
  Commission 
} from '../services/affiliationService';

export const useAffiliation = () => {
  const [stats, setStats] = useState<AffiliationStats | null>(null);
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [history, setHistory] = useState<Commission[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, linksRes, historyRes] = await Promise.all([
        AffiliationService.getStats(),
        AffiliationService.getLinks(),
        AffiliationService.getHistory()
      ]);
      setStats(statsRes.data);
      setLinks(linksRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError('Erreur lors du chargement des données d\'affiliation.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AffiliationService.getStats();
      setStats(res.data);
    } catch (err) {
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AffiliationService.getLinks();
      setLinks(res.data);
    } catch (err) {
      setError('Impossible de charger les liens de parrainage.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AffiliationService.getHistory();
      setHistory(res.data);
    } catch (err) {
      setError('Impossible de charger l\'historique des commissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    links,
    history,
    loading,
    error,
    fetchDashboardData,
    fetchStats,
    fetchLinks,
    fetchHistory
  };
};
