import { useCallback } from 'react';

export type TrackingEventName = 
  | 'page_view'
  | 'course_view'
  | 'course_start'
  | 'product_view'
  | 'search'
  | 'click'
  | 'conversion_intent';

export interface TrackingPayload {
  [key: string]: string | number | boolean | undefined;
}

export const useTracking = () => {
  const trackEvent = useCallback((eventName: TrackingEventName, payload?: TrackingPayload) => {
    // SECURITY WARNING:
    // NEVER track PINs, passwords, tokens, KYC documents, private message contents,
    // or exact wallet balances. Tracking is purely analytical.
    try {
      // Mock analytics call for now
      console.debug(`[Analytics Track]: ${eventName}`, payload);
    } catch (error) {
      // Silent failure for analytics so it doesn't crash the app
      console.warn('Tracking error', error);
    }
  }, []);

  return { trackEvent };
};
