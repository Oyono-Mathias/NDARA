export interface AppError {
  code: string;
  message: string; // Message lisible par défaut (FR)
  translationKey: string; // Clé pour une future i18n
  category: 'network' | 'permission' | 'validation' | 'configuration' | 'unknown';
}

/**
 * Normalise les erreurs Firebase pour ne jamais exposer de stack trace 
 * ou de données sensibles à l'utilisateur final.
 */
export const normalizeFirebaseError = (error: unknown): AppError => {
  const err = error as Record<string, unknown>;
  const errorCode = typeof err?.code === 'string' ? err.code : 'unknown';
  
  let message = 'Une erreur inattendue est survenue. Veuillez réessayer.';
  let translationKey = 'errors.unknown';
  let category: AppError['category'] = 'unknown';

  if (errorCode.startsWith('permission-denied') || errorCode.startsWith('auth/')) {
    category = 'permission';
    message = 'Vous n\'avez pas les permissions nécessaires pour cette action.';
    translationKey = 'errors.permission_denied';
  } else if (errorCode.startsWith('unavailable') || errorCode.startsWith('network-request-failed')) {
    category = 'network';
    message = 'Erreur de connexion. Vérifiez votre accès à internet.';
    translationKey = 'errors.network_failed';
  } else if (errorCode.startsWith('not-found')) {
    category = 'validation';
    message = 'La ressource demandée est introuvable.';
    translationKey = 'errors.not_found';
  } else if (errorCode.startsWith('invalid-argument') || errorCode.startsWith('failed-precondition')) {
    category = 'validation';
    message = 'Les données fournies sont invalides.';
    translationKey = 'errors.invalid_argument';
  } else if (errorCode.startsWith('unauthenticated')) {
    category = 'permission';
    message = 'Veuillez vous connecter pour continuer.';
    translationKey = 'errors.unauthenticated';
  }

  return { code: errorCode, message, translationKey, category };
};
