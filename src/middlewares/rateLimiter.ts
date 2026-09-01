/**
 * WARNING - ZERO TRUST ARCHITECTURE:
 * This rate limiter is strictly for UX purposes (preventing accidental double-clicks, 
 * spamming UI actions, etc.). 
 * 
 * It provides NO REAL SECURITY against a malicious actor, as client-side code 
 * can be bypassed easily.
 * 
 * REAL rate limiting and anti-abuse protection MUST be implemented on the backend 
 * (Firebase Cloud Functions, App Check, Firestore rules).
 * 
 * DO NOT use this utility to authorize financial transactions.
 */

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingTimeMs: number;
  attemptsMade: number;
}

interface ActionState {
  attempts: number;
  resetAt: number;
}

const rateLimitStore: Record<string, ActionState> = {};

/**
 * Checks if an action is allowed based on local rate limiting rules.
 */
export const checkRateLimit = (
  actionKey: string, 
  config: RateLimitConfig = { windowMs: 1000, maxAttempts: 1 }
): RateLimitResult => {
  const now = Date.now();
  const state = rateLimitStore[actionKey];

  if (!state || now > state.resetAt) {
    // First time or window expired
    rateLimitStore[actionKey] = {
      attempts: 1,
      resetAt: now + config.windowMs,
    };
    return {
      allowed: true,
      remainingTimeMs: 0,
      attemptsMade: 1,
    };
  }

  // Inside the window
  if (state.attempts < config.maxAttempts) {
    state.attempts += 1;
    return {
      allowed: true,
      remainingTimeMs: 0,
      attemptsMade: state.attempts,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remainingTimeMs: Math.max(0, state.resetAt - now),
    attemptsMade: state.attempts,
  };
};

/**
 * Manually reset a rate limit (e.g., if an action failed and we want to allow immediate retry).
 */
export const resetRateLimit = (actionKey: string): void => {
  delete rateLimitStore[actionKey];
};

/**
 * Clear all rate limits (e.g., on unmount or logout).
 */
export const clearAllRateLimits = (): void => {
  for (const key in rateLimitStore) {
    delete rateLimitStore[key];
  }
};
