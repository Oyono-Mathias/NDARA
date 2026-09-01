import { useState, useCallback } from 'react';
import { BadgeService, Badge } from '../services/badgeService';

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [lockedBadges, setLockedBadges] = useState<Badge[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BadgeService.getAllBadges();
      setBadges(data);
      setUnlockedBadges(data.filter(b => b.unlocked));
      setLockedBadges(data.filter(b => !b.unlocked));
    } catch (err: any) {
      setError(err.message || "Erreur de chargement des badges");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    badges,
    unlockedBadges,
    lockedBadges,
    loading,
    error,
    fetchAllBadges
  };
}
