import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function safeStringify(obj: any): string {
  if (!obj) return "";
  if (obj instanceof Error) return obj.message;
  if (typeof obj === 'string') return obj;
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return String(obj);
  }
}

export const logger = {
  error: (msg: string, err?: any) => {
    const errorMessage = err?.message || (typeof err === "string" ? err : "Unknown error");
    if (process.env.NODE_ENV !== "production") {
      console.error(`[ERROR] ${msg}:`, err);
    }
    try {
      addDoc(collection(db, "audit_logs"), {
        action: "ERROR",
        message: msg,
        details: errorMessage,
        timestamp: serverTimestamp(),
        severity: "high",
      }).catch((e) => console.warn("Failed to save error log", e));
    } catch (e) {
      console.warn("Failed to initiate error logging", e);
    }
  },
  warn: (msg: string, obj?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[WARN] ${msg}:`, obj);
    }
    try {
      addDoc(collection(db, "audit_logs"), {
        action: "WARN",
        message: msg,
        details: safeStringify(obj),
        timestamp: serverTimestamp(),
        severity: "medium",
      }).catch((e) => console.warn("Failed to save warn log", e));
    } catch (e) {
      // Ignore
    }
  },
  info: (msg: string, obj?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[INFO] ${msg}:`, obj);
    }
  },
};
