import { NormalizedError, normalizeError } from '../utils/errorTracking';
import { PerformanceMetric } from '../utils/performanceMetrics';

/**
 * Monitoring Service
 * 
 * NOTE: Currently explicitly mocked as per Phase 43 requirements.
 * No real connection to Firebase or any external monitoring backend is established here.
 */
export class MonitoringService {
  public static readonly STATUS = {
    isMock: true,
    backendConnected: false,
    environment: 'development' // or 'production' later
  };

  /**
   * Tracks a performance metric.
   * Completely fail-safe. It will never throw an exception that breaks the app.
   */
  public static async trackPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.debug('[Monitoring Mock] Performance Metric:', metric);
      }
      // TODO: In a future phase, send `metric` to Firebase/Backend
      await Promise.resolve();
    } catch (err) {
      // Absorb internal monitoring errors safely
      console.warn('[Monitoring Mock] Internal error while tracking performance.');
    }
  }

  /**
   * Tracks a normalized error.
   * Completely fail-safe.
   */
  public static async trackError(error: NormalizedError): Promise<void> {
    try {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('[Monitoring Mock] Error Logged:', error);
      }
      // TODO: In a future phase, send `error` to Firebase/Backend or Sentry-like service
      await Promise.resolve();
    } catch (err) {
      console.warn('[Monitoring Mock] Internal error while tracking error.');
    }
  }

  /**
   * Helper to normalize and track an raw error immediately.
   */
  public static async captureException(
    err: unknown, 
    context?: { route?: string, action?: string, additionalData?: Record<string, unknown> }
  ): Promise<void> {
    try {
      const normalized = normalizeError(
        err, 
        'medium', 
        'unknown', 
        context?.route, 
        context?.action, 
        context?.additionalData
      );
      await this.trackError(normalized);
    } catch (e) {
      console.warn('[Monitoring Mock] Failed to capture exception cleanly.');
    }
  }

  /**
   * Tracks generic business or technical events (Non-sensitive).
   * MUST NOT contain PINs, passwords, or explicit financial amounts without masking.
   */
  public static async trackEvent(
    eventName: string, 
    payload?: Record<string, string | number | boolean>
  ): Promise<void> {
    try {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.debug('[Monitoring Mock] Event:', eventName, payload);
      }
      // TODO: Send to backend analytics or Cloud Functions
      await Promise.resolve();
    } catch (err) {
      console.warn('[Monitoring Mock] Internal error while tracking event.');
    }
  }
}
