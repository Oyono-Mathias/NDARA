import { useState, useCallback } from 'react';
import { LearningPathService, LearningPath } from '../services/learningPathService';

export function useLearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await LearningPathService.getLearningPaths();
      setPaths(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des parcours.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPathDetail = useCallback(async (pathId: string) => {
    setLoading(true);
    setError(null);
    setSelectedPath(null);
    try {
      const response = await LearningPathService.getPathDetail(pathId);
      setSelectedPath(response.data);
    } catch (err) {
      let msg = 'Erreur lors du chargement du parcours.';
      if (err instanceof Error && err.message === 'PATH_NOT_FOUND') {
        msg = 'Parcours introuvable.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    paths,
    selectedPath,
    loading,
    error,
    fetchPaths,
    fetchPathDetail
  };
}
