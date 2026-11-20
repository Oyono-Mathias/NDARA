import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { geminiApiKey, geminiModel } from "./config.js";
import { generateTutorAnswer } from "./geminiProvider.js";

const DAILY_QUESTION_LIMIT = 20;
const MAX_QUESTION_LENGTH = 2_000;
const MAX_CONTEXT_LENGTH = 12_000;

function getUtcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

export const aiChat = onCall(
  {
    secrets: [geminiApiKey],
    timeoutSeconds: 60,
    memory: "512MiB",
    // App Check enforcement will be enabled after the NDARA web client is
    // registered and verified. Authentication is mandatory from day one.
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Connecte-toi pour utiliser NDARA Intelligence.");
    }

    const question = typeof request.data?.question === "string"
      ? request.data.question.trim()
      : "";
    const lessonContext = typeof request.data?.lessonContext === "string"
      ? request.data.lessonContext.trim()
      : "";

    if (!question || question.length > MAX_QUESTION_LENGTH) {
      throw new HttpsError("invalid-argument", "La question est obligatoire et doit contenir au maximum 2 000 caractères.");
    }
    if (lessonContext.length > MAX_CONTEXT_LENGTH) {
      throw new HttpsError("invalid-argument", "Le contexte du cours dépasse la taille autorisée.");
    }

    const uid = request.auth.uid;
    const usageRef = getFirestore()
      .collection("ai_usage")
      .doc(`${uid}_${getUtcDayKey()}`);

    await getFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const currentCount = Number(snapshot.data()?.questionCount ?? 0);

      if (currentCount >= DAILY_QUESTION_LIMIT) {
        throw new HttpsError(
          "resource-exhausted",
          "Tu as atteint ton quota quotidien NDARA Intelligence. Réessaie demain.",
        );
      }

      transaction.set(usageRef, {
        uid,
        date: getUtcDayKey(),
        questionCount: currentCount + 1,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    try {
      const result = await generateTutorAnswer(
        geminiApiKey.value(),
        geminiModel.value(),
        { question, lessonContext },
      );

      return {
        ...result,
        remainingToday: Math.max(0, DAILY_QUESTION_LIMIT - (
          Number((await usageRef.get()).data()?.questionCount ?? DAILY_QUESTION_LIMIT)
        )),
      };
    } catch (error) {
      // Do not log prompts, learner content, or provider credentials.
      console.error("NDARA AI provider request failed", {
        uid,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      throw new HttpsError(
        "unavailable",
        "NDARA Intelligence est momentanément indisponible. Réessaie dans quelques instants.",
      );
    }
  },
);
