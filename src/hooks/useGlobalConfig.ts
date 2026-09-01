import { useState, useEffect } from 'react';

export interface GlobalConfig {
  appName: string;
  maintenanceMode: boolean;
  features: {
    marketplace: boolean;
    courses: boolean;
    wallet: boolean;
  };
}

const FALLBACK_CONFIG: GlobalConfig = {
  appName: 'Ndara',
  maintenanceMode: false,
  features: { marketplace: true, courses: true, wallet: true }
};

export const useGlobalConfig = () => {
  const [config, setConfig] = useState<GlobalConfig>(FALLBACK_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // IMPORTANT: This configuration is purely informational and UI-driven.
    // It must NEVER be used to calculate permissions, admin rights, or allow withdrawals.
    // Zero Trust architecture requires backend validation for all secure actions.
    const timer = setTimeout(() => {
      try {
        setConfig(FALLBACK_CONFIG);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur de configuration locale.'));
      } finally {
        setLoading(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return { config, loading, error };
};
