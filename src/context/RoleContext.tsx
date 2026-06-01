import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface RoleContextType {
  currentUser: any | null;
  role: string | null;
  isUserLoading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  currentUser: null,
  role: null,
  isUserLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        // Fetch additional data from firestore
        const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
          if (snap.exists()) {
             const data = snap.data();
             setCurrentUser({ ...user, ...data });
             setRole(data.role || 'student');
          } else {
             setCurrentUser(user);
             setRole('student');
          }
          setIsUserLoading(false);
        });
        return () => unsub();
      } else {
        setCurrentUser(null);
        setRole(null);
        setIsUserLoading(false);
      }
    });
  }, []);

  return (
    <RoleContext.Provider value={{ currentUser, role, isUserLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
