import { useEffect } from 'react';

export function useTracking() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const camp = urlParams.get('camp');
    
    if (refCode) {
      // Use referredBy instead of ndara_ref to align with AuthContext
      localStorage.setItem('referredBy', refCode);
      if (camp) {
         localStorage.setItem('ndara_camp', camp);
      }
      
      const trackClick = async () => {
        try {
          await fetch('/api/affiliate/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refCode, ipInfo: null })
          });
        } catch (e) {
          console.error("Failed to track click:", e);
        }
      };
      
      trackClick();
    }
  }, []);
}
