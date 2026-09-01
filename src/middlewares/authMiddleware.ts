/**
 * Middleware d'Authentification (Serveur / Cloud Functions)
 * 
 * Note: Cette abstraction est préparée pour un contexte Node.js/Express.
 * Les types Request, Response et NextFunction sont simulés ici pour garantir
 * la compilation TypeScript sans introduire de dépendance lourde ('express')
 * dans le bundle de développement frontend.
 */

import { normalizeFirebaseError } from '../utils/firebaseErrors';
import { getAdminAuth } from '../firebaseServer';

export interface SimulatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: any; // Décoded Firebase Token
  [key: string]: any;
}

export interface SimulatedResponse {
  status: (code: number) => SimulatedResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

export type SimulatedNextFunction = (err?: any) => void;

/**
 * Middleware vérifiant la présence et la validité du Token Firebase Bearer.
 */
export const authMiddleware = async (
  req: SimulatedRequest,
  res: SimulatedResponse,
  next: SimulatedNextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Token d\'authentification manquant ou mal formaté.'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Le serveur Firebase Admin va valider la signature cryptographique du token
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Injection de l'utilisateur dans la requête pour les middlewares suivants
    req.user = decodedToken;
    
    next();
  } catch (error) {
    const normalized = normalizeFirebaseError(error);
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: normalized.message
    });
  }
};
