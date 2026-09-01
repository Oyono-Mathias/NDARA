/**
 * Définition des routes d'upload.
 * L'architecture applique le principe de défense en profondeur :
 * [Auth] -> [Turnstile (Optionnel)] -> [Validation Fichier] -> [Contrôleur]
 * 
 * Note: Simulation du routeur (type Express) pour typage strict.
 */
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';
import { UploadController } from '../controllers/uploadController';

// Simule un routeur Express pour conserver une architecture propre sans dépendances
class SimulatedRouter {
  post(path: string, ...handlers: any[]) {
    // Configuration logique de la route
    console.info('Route registered:', path, handlers.length);
  }
}

const router = new SimulatedRouter();

/**
 * Route: POST /api/v1/upload/kyc
 * Sécurités:
 * 1. authMiddleware : L'utilisateur doit avoir un token Bearer valide.
 * 2. uploadMiddleware : Le fichier doit respecter (Taille, Type MIME, Extension).
 */
router.post(
  '/kyc',
  authMiddleware,
  uploadMiddleware,
  UploadController.uploadKycDocument
);

// On pourrait rajouter une route avatar, etc.

export { router as uploadRoutes };
