import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BaseDBService } from '../services/db/baseService';
import { User as UserModel, UserRole } from '../types/models';
import { normalizeFirebaseError, AppError } from '../utils/firebaseErrors';

interface RoleContextType {
  role: UserRole | null;
  loading: boolean;
  error: AppError | null;
  isAdmin: boolean;
  isInstructor: boolean;
  isAgent: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);
const userService = new BaseDBService<UserModel>('users');

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      if (!isAuthenticated || !currentUser) {
        if (isMounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userData = await userService.getById(currentUser.uid);
        if (isMounted) {
          // Si l'utilisateur n'est pas encore créé en BDD, on donne un rôle 'user' par défaut dans l'UX.
          // La véritable autorisation serveur rejettera toute tentative de triche.
          setRole(userData?.role || 'user');
        }
      } catch (err) {
        if (isMounted) {
          setError(normalizeFirebaseError(err));
          // En cas d'erreur de permission (ex: document introuvable ou accès refusé), on protège l'UX.
          setRole('user');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isAuthenticated]);

  const value: RoleContextType = {
    role,
    loading,
    error,
    isAdmin: role === 'admin',
    isInstructor: role === 'instructor',
    isAgent: role === 'agent'
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole doit être utilisé à l\'intérieur d\'un RoleProvider');
  }
  return context;
};
