import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface BadgeDefinition {
  badgeId: string;
  title: string;
  description: string;
  emoji: string;
}

export const BADGE_REGISTRY: Record<string, BadgeDefinition> = {
  'sandbox_wizard_1': {
    badgeId: 'sandbox_wizard_1',
    title: 'As du Code - Niveau 1',
    description: 'A validé son premier exercice pratique dans le Labo Sandbox',
    emoji: '⚡'
  }
};

/**
 * Service pour vérifier l'éligibilité et attribuer un badge de manière atomique.
 * Il vérifie dans 'student_badges' la présence du badgeId avant d'insérer.
 */
export async function awardBadgeIfEligible(userId: string, badgeId: string): Promise<boolean> {
  const badgeDef = BADGE_REGISTRY[badgeId];
  if (!badgeDef) return false;

  const badgesRef = collection(db, "student_badges");
  const q = query(badgesRef, where("userId", "==", userId), where("badgeId", "==", badgeId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Badge déjà possédé par l'étudiant
    return false;
  }

  // Attribution sécurisée (l'ID du document prévient aussi les doublons)
  const newBadgeDocRef = doc(db, "student_badges", `${userId}_${badgeId}`);
  
  try {
    await setDoc(newBadgeDocRef, {
      userId,
      badgeId: badgeDef.badgeId,
      title: badgeDef.title,
      description: badgeDef.description,
      emoji: badgeDef.emoji,
      awardedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error("Erreur lors de l'attribution du badge:", err);
    return false;
  }
}
