import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User, 
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { normalizeFirebaseError } from '../utils/firebaseErrors';

export class AuthService {
  /**
   * Observe l'état d'authentification de l'utilisateur.
   */
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Connexion via Google OAuth (Popup).
   */
  static async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      // On peut ajouter des scopes additionnels si nécessaire
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sauvegarder l'utilisateur dans Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: 'user',
          createdAt: serverTimestamp()
        });
      }

      return user;
    } catch (error) {
      throw normalizeFirebaseError(error);
    }
  }

  /**
   * Déconnexion sécurisée.
   */
  static async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw normalizeFirebaseError(error);
    }
  }

  /**
   * Envoie un lien de vérification d'e-mail.
   */
  static async sendVerificationEmail(): Promise<void> {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('auth/unauthenticated');
      }
    } catch (error) {
      throw normalizeFirebaseError(error);
    }
  }

  /**
   * Envoie un lien de réinitialisation de mot de passe.
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw normalizeFirebaseError(error);
    }
  }

  /**
   * Récupère l'utilisateur actuel.
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }
}
