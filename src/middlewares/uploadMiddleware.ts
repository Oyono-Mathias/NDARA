import { SimulatedRequest, SimulatedResponse, SimulatedNextFunction } from './authMiddleware';

// Types Mimes sécurisés autorisés pour les uploads standards du projet
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Middleware pour valider sécuritairement les uploads.
 * 
 * Note: Cette abstraction présume que la requête contient un objet `file` 
 * (ex: peuplé par multer sur le serveur).
 */
export const uploadMiddleware = (
  req: SimulatedRequest,
  res: SimulatedResponse,
  next: SimulatedNextFunction
) => {
  const file = req.file || req.body?.file; // Simulation de l'objet fichier

  if (!file) {
    return res.status(400).json({
      status: 'error',
      code: 'MISSING_FILE',
      message: 'Aucun fichier n\'a été fourni pour l\'upload.'
    });
  }

  // 1. Vérification de la taille (prévention d'attaques DOS par stockage)
  if (file.size > MAX_FILE_SIZE) {
    return res.status(413).json({
      status: 'error',
      code: 'FILE_TOO_LARGE',
      message: `Le fichier dépasse la limite autorisée de ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    });
  }

  // 2. Vérification stricte du type MIME
  // IMPORTANT: Côté serveur, un contrôle avec 'file-type' (magic numbers) 
  // sera nécessaire pour ne pas se fier aveuglément à la déclaration du navigateur.
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return res.status(415).json({
      status: 'error',
      code: 'INVALID_FILE_TYPE',
      message: 'Type de fichier non supporté. Sont acceptés : JPG, PNG, WEBP, PDF.'
    });
  }

  // 3. Prévention des doubles extensions (ex: image.png.exe) et caractères louches
  if (file.originalname && file.originalname.includes('..')) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_FILENAME',
      message: 'Le nom du fichier est invalide.'
    });
  }

  next();
};
