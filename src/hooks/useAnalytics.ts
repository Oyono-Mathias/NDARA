import { useState, useCallback, useEffect } from 'react';
import { 
  AnalyticsService, 
  AnalyticsPeriod, 
  AnalyticsSummary,
  UserAnalyticsData,
  CourseAnalyticsData,
  RevenueAnalyticsData,
  EngagementAnalyticsData
} from '../services/analyticsService';

export function useAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalyticsData | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalyticsData | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalyticsData | null>(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAnalytics = useCallback(async (currentPeriod: AnalyticsPeriod) => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    try {
      const [
        summaryData,
        userData,
        courseData,
        revenueData,
        engagementData
      ] = await Promise.all([
        AnalyticsService.getSummary(currentPeriod),
        AnalyticsService.getUserAnalytics(currentPeriod),
        AnalyticsService.getCourseAnalytics(currentPeriod),
        AnalyticsService.getRevenueAnalytics(currentPeriod),
        AnalyticsService.getEngagementAnalytics(currentPeriod)
      ]);

      if (isMounted) {
        setSummary(summaryData);
        setUserAnalytics(userData);
        setCourseAnalytics(courseData);
        setRevenueAnalytics(revenueData);
        setEngagementAnalytics(engagementData);
      }
    } catch (err: any) {
      if (isMounted) {
        setError(err.message || 'Erreur lors de la récupération des statistiques');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = fetchAllAnalytics(period);
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [period, fetchAllAnalytics]);

  return {
    period,
    setPeriod,
    summary,
    userAnalytics,
    courseAnalytics,
    revenueAnalytics,
    engagementAnalytics,
    loading,
    error,
    refresh: () => fetchAllAnalytics(period)
  };
}
