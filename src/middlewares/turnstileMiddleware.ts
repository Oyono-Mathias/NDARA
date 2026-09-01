import { SimulatedRequest, SimulatedResponse, SimulatedNextFunction } from './authMiddleware';

/**
 * Middleware vérifiant le token de sécurité Cloudflare Turnstile (Anti-Bot).
 * 
 * SÉCURITÉ : La vérification réelle nécessite un appel secret côté serveur.
 * Ne JAMAIS effectuer la validation de la `secret key` depuis le frontend.
 */
export const turnstileMiddleware = async (
  req: SimulatedRequest,
  res: SimulatedResponse,
  next: SimulatedNextFunction
) => {
  try {
    const token = req.body?.turnstileToken || req.headers['x-turnstile-token'];

    if (!token) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_TURNSTILE',
        message: 'Validation de sécurité manquante (Turnstile).'
      });
    }

    // SIMULATION :
    // Dans l'environnement backend réel, nous effectuerions ici un fetch() 
    // vers 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    // avec le process.env.TURNSTILE_SECRET_KEY et le token.
    console.info('[Simulation] Vérification Turnstile du token:', token);

    // Si on détecte une future implémentation défaillante, on rejette:
    if (token === 'INVALID_SIMULATION') {
      return res.status(403).json({
        status: 'error',
        code: 'INVALID_TURNSTILE',
        message: 'Validation de sécurité échouée.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Erreur lors de la validation anti-bot.'
    });
  }
};
