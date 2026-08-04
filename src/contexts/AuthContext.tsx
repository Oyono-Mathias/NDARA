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
      let userDoc = await UsersService.getById(user.uid);
      if (!userDoc) {
          // Auto-create missing profile
          await UsersService.create({
              email: user.email || '',
              displayName: user.displayName || 'Utilisateur',
              photoURL: user.photoURL || '',
              role: user.email === 'oyonomathias@gmail.com' ? 'admin' : 'student',
              walletBalance: 0,
              preferences: {}
          }, user.uid);
          userDoc = await UsersService.getById(user.uid);
      }
      // Automatically make the user an admin if they have the specific email
      if (user.email === 'oyonomathias@gmail.com' && userDoc) {
        if (userDoc.role !== 'admin') {
          try {
            await UsersService.update(user.uid, { role: 'admin' });
          } catch (updateErr) {
            console.error("Could not self-upgrade to admin", updateErr);
          }
        }
        userDoc.role = 'admin';
      }
      setAppUser(userDoc);
    } catch (error: any) {
      console.warn("Fallback auth user used due to error", error);
      
      // Fallback for any error (offline, permission, etc.) to prevent being stuck on loading screen
      setAppUser({
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Utilisateur',
          photoURL: user.photoURL || '',
          role: user.email === 'oyonomathias@gmail.com' ? 'admin' : 'student',
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
             if (user.email === 'oyonomathias@gmail.com') {
                 data.role = 'admin';
             }
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
