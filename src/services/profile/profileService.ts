export interface PublicProfile {
  uid: string;
  displayName: string;
  publicAvatar?: string;
  bio?: string;
  instructorStats?: {
    coursesCount: number;
    rating: number;
  };
}

export interface PrivateProfile extends PublicProfile {
  email: string;
  phoneNumber?: string;
  preferences: {
    notificationsEnabled: boolean;
  };
}

export class ProfileService {
  // ZERO TRUST: Frontend ID is not proof of authorization.
  // Real implementation requires Firebase Auth context validation.

  static async getPublicProfile(uid: string): Promise<PublicProfile | null> {
    // Mock fetch for now
    return {
      uid,
      displayName: `User_${uid.substring(0, 4)}`,
      instructorStats: { coursesCount: 0, rating: 0 }
    };
  }

  static async getMyPrivateProfile(): Promise<PrivateProfile> {
    // Needs actual Firebase Auth token validation
    return Promise.reject(new Error('Validation backend requise pour récupérer le profil privé.'));
  }

  static async updateProfile(data: Partial<PrivateProfile>): Promise<void> {
    // Intention only
    console.debug('Payload profile à updater:', data);
    return Promise.resolve(); // Mock success
  }
}
