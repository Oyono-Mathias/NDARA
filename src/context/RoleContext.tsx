import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";

interface RoleContextType {
  currentUser: any | null;
  role: string | null;
  loading: boolean;
  isUserLoading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  currentUser: null,
  role: null,
  loading: true,
  isUserLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  
  const currentUser = useMemo(() => {
    return firebaseUser && appUser ? { ...firebaseUser, ...appUser, uid: firebaseUser.uid } : null;
  }, [firebaseUser, appUser]);

  const role = appUser?.role || null;

  const value = useMemo(() => ({
    currentUser, role, loading, isUserLoading: loading
  }), [currentUser, role, loading]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
