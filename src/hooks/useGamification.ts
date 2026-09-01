import { useState, useCallback } from 'react';
import { GamificationService, GamificationProfile, Achievement, LeaderboardEntry, SkillNode } from '../services/gamificationService';

export function useGamification() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [skillTree, setSkillTree] = useState<SkillNode[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await GamificationService.getGamificationProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement du profil");
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    try {
      const data = await GamificationService.getAchievements();
      setAchievements(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement des achievements");
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await GamificationService.getLeaderboard();
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement du classement");
    }
  }, []);

  const fetchSkillTree = useCallback(async () => {
    try {
      const data = await GamificationService.getSkillTree();
      setSkillTree(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement de l'arbre de compétences");
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      fetchProfile(),
      fetchAchievements(),
      fetchLeaderboard(),
      fetchSkillTree()
    ]);
    setLoading(false);
  }, [fetchProfile, fetchAchievements, fetchLeaderboard, fetchSkillTree]);

  return {
    profile,
    achievements,
    leaderboard,
    skillTree,
    loading,
    error,
    fetchAll,
    fetchProfile,
    fetchAchievements,
    fetchLeaderboard,
    fetchSkillTree
  };
}
