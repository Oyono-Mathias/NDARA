import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export interface LandingSettings {
  monthly_price: number;
  kill_switch_active: boolean;
  featured_preview_url: string;
}

export function useLandingSettings() {
  const [settings, setSettings] = useState<LandingSettings>({
    monthly_price: 15000,
    kill_switch_active: false,
    featured_preview_url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let _mounted = true;
    const unsub = onSnapshot(
      doc(db, "system_settings", "landing_page"),
      (docSnap) => {
        if (!_mounted) return;
        if (docSnap.exists()) {
          setSettings(docSnap.data() as LandingSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur hook LandingSettings: ", error);
        if (_mounted) setLoading(false);
      },
    );
    return () => {
      _mounted = false;
      unsub();
    };
  }, []);

  return { settings, loading };
}
