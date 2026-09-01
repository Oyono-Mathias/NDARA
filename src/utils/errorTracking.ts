export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'ui' | 'business_logic' | 'unknown' | 'rate_limit';

export interface NormalizedError {
  errorId: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  name: string;
  stack?: string;
  route?: string;
  action?: string;
  environment: string;
  isMock: boolean;
  context?: Record<string, unknown>;
}

const SENSITIVE_KEYS_REGEX = /password|pin|token|secret|authorization|api_key|apikey|cvv|cardnumber|credentials/i;
const MAX_REDACTION_DEPTH = 5;

/**
 * Redacts sensitive data from objects recursively.
 * Protects against deep objects and circular references (via depth limit).
 */
export const redactSensitiveData = (
  data: unknown,
  depth: number = 0
): unknown => {
  if (depth > MAX_REDACTION_DEPTH) return '[MAX_DEPTH_EXCEEDED]';
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, depth + 1));
  }

  const redactedObj: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS_REGEX.test(key)) {
      redactedObj[key] = '[REDACTED]';
    } else {
      redactedObj[key] = redactSensitiveData(value, depth + 1);
    }
  }
  
  return redactedObj;
};

const createErrorId = (): string => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `err_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Normalizes any thrown value into a strict structure.
 */
export const normalizeError = (
  err: unknown,
  fallbackSeverity: ErrorSeverity = 'medium',
  fallbackCategory: ErrorCategory = 'unknown',
  route?: string,
  action?: string,
  context?: Record<string, unknown>
): NormalizedError => {
  let message = 'Unknown error';
  let name = 'Error';
  let stack: string | undefined;

  if (err instanceof Error) {
    message = err.message;
    name = err.name;
    stack = err.stack;
  } else if (typeof err === 'string') {
    message = err;
  } else if (typeof err === 'object' && err !== null) {
    try {
      message = JSON.stringify(redactSensitiveData(err));
    } catch {
      message = 'Unserializable error object';
    }
  }

  // Redact stack traces just in case they contain sensitive URLs or parameters
  const safeStack = stack ? stack.replace(SENSITIVE_KEYS_REGEX, '[REDACTED]') : undefined;
  
  // Clean up context safely
  const safeContext = context ? (redactSensitiveData(context) as Record<string, unknown>) : undefined;

  return {
    errorId: createErrorId(),
    timestamp: new Date().toISOString(),
    severity: fallbackSeverity,
    category: fallbackCategory,
    message,
    name,
    stack: safeStack,
    route,
    action,
    environment: typeof process !== 'undefined' && process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    isMock: true, // As per requirements, backend is mocked
    context: safeContext,
  };
};
