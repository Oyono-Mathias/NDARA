import { logger } from '../lib/logger';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { UsersService } from '../services/db';
import { User as AppUser } from '../types/models';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (user: FirebaseUser) => {
    try {
      try {
        const token = await user.getIdToken();
        const refCode = localStorage.getItem('referredBy');
        await fetch('/api/user/track', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refCode })
        });
      } catch (err) {
        console.error("Failed to track login", err);
      }

      let userDoc = await UsersService.getById(user.uid);
      if (userDoc) {
        setAppUser(userDoc);
      } else {
        setAppUser({
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Utilisateur',
            photoURL: user.photoURL || '',
            role: 'student',
            walletBalance: 0,
            preferences: {}
        } as any);
      }
    } catch (error: any) {
      console.warn("Fallback auth user used due to error", error);
      
      // Fallback for any error (offline, permission, etc.) to prevent being stuck on loading screen
      setAppUser({
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Utilisateur',
          photoURL: user.photoURL || '',
          role: 'student',
          walletBalance: 0,
          preferences: {}
      } as any);
    }
  };

  const reloadUser = useCallback(async () => {
    if (firebaseUser) {
      await firebaseUser.reload();
      await fetchAppUser(firebaseUser);
    }
  }, [firebaseUser]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    const unsubscribeAuth = authService.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchAppUser(user);
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
             const data = docSnap.data();
             setAppUser(data as any);
          }
        });
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setFirebaseUser(null);
    setAppUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
