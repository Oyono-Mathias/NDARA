import { SimulatedRequest, SimulatedResponse, SimulatedNextFunction } from './authMiddleware';

/**
 * Middleware vérifiant qu'une opération sensible est bien protégée par un second facteur valide.
 * 
 * Il s'assure que l'utilisateur, en plus d'être authentifié, a validé son 2FA.
 */
export const twoFactorMiddleware = async (
  req: SimulatedRequest,
  res: SimulatedResponse,
  next: SimulatedNextFunction
) => {
  try {
    // Ce middleware doit impérativement être appelé APRES le authMiddleware.
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Accès refusé. Utilisateur non authentifié.'
      });
    }

    // Le JWT Firebase peut contenir des claims personnalisés (custom claims) 
    // injectés par notre logique backend indiquant si le 2FA est validé.
    // Exemple: user.twoFactorValidated = true (timestamp ou booléen)
    const is2FAValidated = req.user.twoFactorValidated === true;
    
    // Si la propriété n'existe pas ou est fausse, et que l'utilisateur a le 2FA activé, on bloque
    // (Une vérification en base ou via custom claim "2faEnabled" détermine cela)
    const requires2FA = req.user.twoFactorEnabled === true;

    if (requires2FA && !is2FAValidated) {
      return res.status(403).json({
        status: 'error',
        code: '2FA_REQUIRED',
        message: 'Cette opération nécessite une validation 2FA préalable.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Erreur lors de la vérification de sécurité 2FA.'
    });
  }
};
