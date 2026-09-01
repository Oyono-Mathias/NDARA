/**
 * Contrôleur gérant les uploads de fichiers (Documents KYC, Avatars, etc).
 * Assure la logique métier après que le fichier a passé les middlewares de sécurité.
 */
import { SimulatedRequest, SimulatedResponse } from '../middlewares/authMiddleware';

export class UploadController {
  
  /**
   * Gestion de l'upload d'un document KYC.
   * L'utilisateur doit être authentifié et le fichier validé par uploadMiddleware.
   */
  static async uploadKycDocument(req: SimulatedRequest, res: SimulatedResponse) {
    try {
      const user = req.user;
      const file = req.file || req.body?.file; // Objet fichier injecté par le middleware

      if (!user || !file) {
        return res.status(400).json({
          status: 'error',
          code: 'BAD_REQUEST',
          message: 'Requête invalide'
        });
      }

      // SÉCURITÉ: L'identifiant du propriétaire est toujours déduit du Token (user.uid),
      // jamais du payload envoyé par le client (req.body.userId) pour éviter les falsifications.
      const ownerId = user.uid;
      
      // Simulation: L'upload réel vers Google Cloud Storage s'effectuera ici.
      console.info(`[Simulation Upload] Fichier "${file.originalname}" traité pour l'utilisateur ${ownerId}.`);

      // Génération de l'URL simulée
      const mockStorageUrl = `https://storage.googleapis.com/ndara-bucket/kyc/${ownerId}/${Date.now()}-${file.originalname}`;

      return res.status(200).json({
        status: 'success',
        data: {
          url: mockStorageUrl,
          message: 'Document uploadé avec succès.'
        }
      });
    } catch (error) {
      console.error('Upload Error:', error);
      return res.status(500).json({
        status: 'error',
        code: 'UPLOAD_FAILED',
        message: 'Une erreur est survenue lors de l\'enregistrement du document.'
      });
    }
  }
}
