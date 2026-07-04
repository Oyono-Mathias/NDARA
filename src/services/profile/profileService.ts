import { auth, storage } from '../../firebase';
import { UsersService } from '../db';
import { updateProfile, updatePassword, verifyBeforeUpdateEmail, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { User } from '../../types/models';

class ProfileService {
  async updateProfileInfo(uid: string, data: Partial<User>) {
    await UsersService.update(uid, data);
    
    // Si displayName est mis à jour, mettre à jour le profil Firebase Auth
    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName
      });
    }
  }

  async updatePreferences(uid: string, preferences: User['preferences']) {
    const userDoc = await UsersService.getById(uid);
    const updatedPreferences = { ...userDoc?.preferences, ...preferences };
    await UsersService.update(uid, { preferences: updatedPreferences });
  }

  async uploadProfilePicture(file: File, uid: string, onProgress?: (progress: number) => void): Promise<string> {
    if (!auth.currentUser) throw new Error("Non authentifié");

    // Suppression de l'ancienne photo si elle existe dans notre bucket storage
    const userDoc = await UsersService.getById(uid);
    if (userDoc?.photoURL && userDoc.photoURL.includes('firebaseapp.com')) {
      try {
        const oldPhotoRef = ref(storage, userDoc.photoURL);
        await deleteObject(oldPhotoRef);
      } catch (e) {
        console.warn("Ancienne photo non trouvée ou impossible à supprimer", e);
      }
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${uid}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `users/${uid}/avatar/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Mettre à jour Firebase Auth
          await updateProfile(auth.currentUser!, { photoURL: downloadURL });
          // Mettre à jour Firestore
          await UsersService.update(uid, { photoURL: downloadURL });
          resolve(downloadURL);
        }
      );
    });
  }

  async deleteProfilePicture(uid: string) {
    if (!auth.currentUser) throw new Error("Non authentifié");
    
    const userDoc = await UsersService.getById(uid);
    if (userDoc?.photoURL) {
      try {
        const photoRef = ref(storage, userDoc.photoURL);
        await deleteObject(photoRef);
      } catch (e) {
        console.warn("Impossible de supprimer la photo", e);
      }
    }
    
    await updateProfile(auth.currentUser, { photoURL: "" });
    await UsersService.update(uid, { photoURL: "" });
  }

  async reauthenticate(password: string) {
    if (!auth.currentUser?.email) throw new Error("Email non disponible");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  }

  async changePassword(newPassword: string) {
    if (!auth.currentUser) throw new Error("Non authentifié");
    await updatePassword(auth.currentUser, newPassword);
  }

  async changeEmail(newEmail: string) {
    if (!auth.currentUser) throw new Error("Non authentifié");
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
  }

  async deleteAccount(uid: string) {
    if (!auth.currentUser) throw new Error("Non authentifié");
    // Soft delete in Firestore
    await UsersService.update(uid, { deletedAt: Date.now() });
    
    // Delete in Firebase Auth
    await deleteUser(auth.currentUser);
  }
}

export const profileService = new ProfileService();
