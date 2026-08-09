import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');

    if (refCode) {
      // Avoid tracking the same click repeatedly in a short time
      const lastTracked = sessionStorage.getItem(`tracked_ref_${refCode}`);
      
      if (!lastTracked) {
        sessionStorage.setItem(`tracked_ref_${refCode}`, 'true');
        localStorage.setItem('referredBy', refCode);

        // Track click on the backend
        fetch('/api/ambassador/click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refCode: refCode,
            landingPage: location.pathname
          })
        }).catch(err => console.error("Failed to track referral click", err));
      }
    }
  }, [location]);

  return null;
}
