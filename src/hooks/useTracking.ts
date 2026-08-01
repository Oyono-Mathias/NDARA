import { useEffect } from 'react';

export function useTracking() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const camp = urlParams.get('camp');
    
    if (ref) {
      localStorage.setItem('ndara_ref', ref);
      if (camp) {
         localStorage.setItem('ndara_camp', camp);
      }
      
      // Notify backend of click
      fetch('/api/marketing/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, camp, url: window.location.href })
      }).catch(console.error);
    }
  }, []);
}
