export function getFirebaseErrorMessage(error: any): string {
  const code = error?.code || error?.message;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email ou mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/invalid-email':
      return 'L\'adresse email n\'est pas valide.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé. Veuillez contacter le support.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau. Veuillez vérifier votre connexion internet.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
    case 'auth/requires-recent-login':
      return 'Cette action nécessite une reconnexion récente. Veuillez vous reconnecter.';
    default:
      return 'Une erreur inattendue est survenue. Veuillez réessayer.';
  }
}
