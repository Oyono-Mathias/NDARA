import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export interface GlobalConfig {
  active_video_provider: 'bunny' | 'cloudflare';
  [key: string]: any;
}

export function useGlobalConfig() {
  const [config, setConfig] = useState<GlobalConfig>({
    active_video_provider: 'bunny',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "global_config"),
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur récupération global_config: ", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { config, loading };
}
