export type MetricCategory = 'page_load' | 'navigation' | 'operation' | 'network' | 'custom' | 'user_action';

export interface PerformanceMetric {
  id: string;
  name: string;
  category: MetricCategory;
  durationMs: number;
  startTime: number;
  route?: string;
  context?: Record<string, string | number | boolean | null>;
  timestamp: string;
}

export const createMetricId = (): string => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `metric_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

export const getNow = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
};

export const measureDuration = (startMark: number, endMark?: number): number => {
  const end = endMark ?? getNow();
  return Math.max(0, end - startMark);
};

export const normalizeMetric = (
  name: string,
  category: MetricCategory,
  durationMs: number,
  route?: string,
  context?: Record<string, string | number | boolean | null>
): PerformanceMetric => {
  return {
    id: createMetricId(),
    name,
    category,
    durationMs: Math.round(durationMs * 100) / 100, // Round to 2 decimals
    startTime: getNow() - durationMs,
    route,
    context,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Attempts to retrieve basic paint metrics if available.
 * SSR-safe.
 */
export const getPaintMetrics = (): Record<string, number> => {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return {};
  
  const metrics: Record<string, number> = {};
  try {
    const paintEntries = performance.getEntriesByType?.('paint') || [];
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') metrics.firstPaint = entry.startTime;
      if (entry.name === 'first-contentful-paint') metrics.firstContentfulPaint = entry.startTime;
    });
  } catch (err) {
    // Fail silently, performance API might be restricted or unsupported
  }
  return metrics;
};
