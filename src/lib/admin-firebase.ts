import { collection, query, where, onSnapshot, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useState, useEffect } from 'react';

export function useAdminDashboardStats() {
  const [stats, setStats] = useState({
    dailyRegistrations: 0,
    activeUsers: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    
    async function fetchStats() {
      try {
        // Daily registrations (users created after start of today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const regsQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', Timestamp.fromDate(today))
        );
        const regsSnap = await getCountFromServer(regsQuery);
        
        // Active users (example: users who logged in recently or have status active)
        const activeQuery = query(
          collection(db, 'users'),
          where('status', '==', 'active') // Adjust this condition based on your exact active user tracking rules
        );
        const activeSnap = await getCountFromServer(activeQuery);

        if (isMounted) {
          setStats({
            dailyRegistrations: regsSnap.data().count,
            activeUsers: activeSnap.data().count,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching admin stats", error);
        if (isMounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return stats;
}

export { db };
