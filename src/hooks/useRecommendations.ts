import { useState, useCallback } from 'react';
import { RecommendationService, RecommendationSection, CourseRecommendation } from '../services/recommendationService';

export function useRecommendations() {
  const [feedSections, setFeedSections] = useState<RecommendationSection[]>([]);
  const [similarCourses, setSimilarCourses] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await RecommendationService.getPersonalizedFeed();
      setFeedSections(response.sections);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des recommandations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSimilar = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await RecommendationService.getSimilarCourses(courseId);
      setSimilarCourses(response.recommendations);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cours similaires.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    feedSections,
    similarCourses,
    loading,
    error,
    isMockData,
    fetchFeed,
    fetchSimilar
  };
}
