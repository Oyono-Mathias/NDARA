import { defineSecret, defineString } from "firebase-functions/params";

export const geminiApiKey = defineSecret("GEMINI_API_KEY");

// Keep model selection configurable so NDARA can move to a currently supported
// model without changing application code.
export const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-3.8-flash",
});
