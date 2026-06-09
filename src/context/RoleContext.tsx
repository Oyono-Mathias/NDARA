import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface RoleContextType {
  currentUser: any | null;
  role: string | null;
  loading: boolean;
  isUserLoading: boolean; // keep for retro-compatibility
}

const RoleContext = createContext<RoleContextType>({
  currentUser: null,
  role: null,
  loading: true,
  isUserLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Fetch additional data from firestore
        unsubSnapshot = onSnapshot(doc(db, "users", user.uid), (snap) => {
          let mergedUser = user;
          if (snap.exists()) {
            const data = snap.data();
            mergedUser = { ...user, ...data };
            setRole(data.role || "student");
          } else {
            setRole("student");
          }
          setCurrentUser(mergedUser);
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setRole(null);
        setLoading(false);
        if (unsubSnapshot) {
          unsubSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  return (
    <RoleContext.Provider
      value={{ currentUser, role, loading, isUserLoading: loading }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
