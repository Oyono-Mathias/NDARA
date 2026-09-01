import { useState, useCallback } from 'react';
import { PrerequisiteService, PrerequisiteCheckResult } from '../services/prerequisiteService';

export function usePrerequisites() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrerequisiteCheckResult | null>(null);

  const checkCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await PrerequisiteService.checkPrerequisites(courseId);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification des prérequis.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    checkCourse
  };
}
