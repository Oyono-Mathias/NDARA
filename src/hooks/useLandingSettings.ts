import { useState, useEffect } from 'react';

export interface LandingSettings {
  heroTitle: string;
  heroSubtitle: string;
  showTrustSection: boolean;
  activeCategories: string[];
}

const DEFAULT_SETTINGS: LandingSettings = {
  heroTitle: 'Bienvenue sur Ndara',
  heroSubtitle: 'La plateforme éducative et financière.',
  showTrustSection: true,
  activeCategories: ['Développement', 'Design', 'Business']
};

export const useLandingSettings = () => {
  const [settings, setSettings] = useState<LandingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // SECRETS PROHIBITION: 
    // No private Firebase keys, tokens, or credentials will ever be fetched or exposed here.
    const timer = setTimeout(() => {
      try {
        setSettings(DEFAULT_SETTINGS);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur de chargement.'));
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return { settings, loading, error };
};
