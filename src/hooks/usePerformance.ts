import { useCallback, useRef, useEffect, useState } from 'react';
import { getNow, normalizeMetric, MetricCategory } from '../utils/performanceMetrics';
import { MonitoringService } from '../services/monitoringService';
import { checkRateLimit, RateLimitConfig } from '../middlewares/rateLimiter';

export interface UsePerformanceOptions {
  route?: string;
}

export const usePerformance = (options?: UsePerformanceOptions) => {
  const { route } = options || {};
  const activeMeasures = useRef<Record<string, number>>({});
  
  // Minimal UI state representation (if components need to show loading/blocked)
  const [isSending, setIsSending] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      activeMeasures.current = {};
    };
  }, []);

  /**
   * Starts a timer for a specific operation.
   */
  const startMeasure = useCallback((operationName: string) => {
    activeMeasures.current[operationName] = getNow();
  }, []);

  /**
   * Ends a timer and logs the performance metric.
   */
  const endMeasure = useCallback(async (
    operationName: string, 
    category: MetricCategory = 'operation',
    context?: Record<string, string | number | boolean | null>
  ) => {
    const startTime = activeMeasures.current[operationName];
    if (startTime === undefined) return;

    const duration = getNow() - startTime;
    delete activeMeasures.current[operationName];

    const metric = normalizeMetric(operationName, category, duration, route, context);
    await MonitoringService.trackPerformance(metric);
  }, [route]);

  /**
   * Tracks an error securely via the monitoring service.
   */
  const handleError = useCallback(async (
    error: unknown,
    action?: string,
    additionalData?: Record<string, unknown>
  ) => {
    await MonitoringService.captureException(error, { route, action, additionalData });
  }, [route]);

  /**
   * Wraps an asynchronous action with rate-limiting and performance tracking.
   */
  const trackUserAction = useCallback(async <T>(
    actionName: string,
    actionFn: () => Promise<T>,
    rateLimitConfig?: RateLimitConfig
  ): Promise<T | undefined> => {
    // 1. Check Rate Limit
    if (rateLimitConfig) {
      const { allowed } = checkRateLimit(actionName, rateLimitConfig);
      if (!allowed) {
        setIsRateLimited(true);
        // Reset rate limited flag after UI feedback window (e.g., 2s) to allow subsequent tries
        setTimeout(() => setIsRateLimited(false), 2000);
        MonitoringService.captureException(
          new Error(`Rate limit exceeded for action: ${actionName}`), 
          { route, action: actionName, additionalData: { rateLimitCategory: 'frontend' } }
        );
        return undefined; // Action blocked
      }
    }

    setIsRateLimited(false);
    setIsSending(true);
    startMeasure(actionName);

    try {
      const result = await actionFn();
      await endMeasure(actionName, 'user_action');
      return result;
    } catch (error) {
      await handleError(error, actionName);
      throw error; // Re-throw to let the caller handle it functionally
    } finally {
      setIsSending(false);
    }
  }, [startMeasure, endMeasure, handleError, route]);

  return {
    startMeasure,
    endMeasure,
    trackUserAction,
    handleError,
    isSending,
    isRateLimited,
    isMonitoringMock: MonitoringService.STATUS.isMock
  };
};
