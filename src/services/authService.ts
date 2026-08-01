import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithCustomToken,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { UsersService } from './db';
import { UserRole } from '../types/models';

class AuthService {
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  
  async _logAudit(action: string, user: FirebaseUser) {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        userId: user.uid,
        userEmail: user.email,
        timestamp: new Date()
      });
    } catch (e) {
      console.warn("Could not log audit", e);
    }
  }

    
  async loginWithToken(token: string) {
    const cred = await signInWithCustomToken(auth, token);
    this._logAudit('IMPERSONATION_LOGIN', cred.user);
    return cred;
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    this._logAudit('LOGIN', cred.user);
    return cred;
  }

  async register(email: string, password: string, displayName: string, role: UserRole = 'student') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil Firebase
    await updateProfile(user, { displayName });
    
    let referredBy = undefined;

    // Créer le document utilisateur dans Firestore
    await UsersService.create({
      email: user.email!,
      displayName,
      photoURL: user.photoURL || '',
      role,
      walletBalance: 0,
      referredBy,
      preferences: {}
    }, user.uid);
    
    // Envoi de l'email de vérification
    await this.sendVerificationEmail(user);
    
    return userCredential;
  }

    async logout() {
    if (auth.currentUser) {
      await this._logAudit('LOGOUT', auth.currentUser);
    }
    await signOut(auth);
  }

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }
  
  async sendVerificationEmail(user: FirebaseUser) {
    await sendEmailVerification(user);
  }

  getCurrentUser() {
    return auth.currentUser;
  }
  
  async checkSession() {
      // Refresh token if needed or just force refresh user
      if (auth.currentUser) {
          await auth.currentUser.reload();
      }
  }
}

export const authService = new AuthService();
