import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

export { aiChat } from "./intelligence/aiChat.js";

// Preserve the existing payment webhook export when deploying this Functions codebase.
export { paymentWebhook } from "./paymentWebhook.js";
