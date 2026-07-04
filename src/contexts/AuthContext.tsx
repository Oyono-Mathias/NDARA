import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { UsersService } from '../services/db';
import { User as AppUser } from '../types/models';

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

  const fetchAppUser = async (uid: string) => {
    try {
      const userDoc = await UsersService.getById(uid);
      setAppUser(userDoc);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur", error);
      setAppUser(null);
    }
  };

  const reloadUser = async () => {
    if (firebaseUser) {
      await firebaseUser.reload();
      await fetchAppUser(firebaseUser.uid);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = authService.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchAppUser(user.uid);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
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
