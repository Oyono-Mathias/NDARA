/**
 * Service gérant le 2FA (Second Facteur).
 * Ce fichier est une abstraction (stub/façade) car le 2FA requiert une logique côté backend 
 * (Cloud Functions) qui sera développée dans une phase ultérieure.
 * 
 * SÉCURITÉ: 
 * Aucun secret 2FA ne doit être conservé localement, ni stocké de façon 
 * accessible en clair dans Firestore.
 */

export interface TwoFactorConfig {
  isEnabled: boolean;
  method?: 'authenticator' | 'sms';
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string; // URL du QRCode pré-générée par le backend
}

export class TwoFactorService {
  /**
   * Vérifie si le 2FA est activé pour l'utilisateur actuel.
   */
  static async checkStatus(userId: string): Promise<TwoFactorConfig> {
    console.info(`[Simulation] Vérification du statut 2FA pour l'utilisateur: ${userId}`);
    // Sera remplacé par un appel HTTPS Callable vers Cloud Functions
    return {
      isEnabled: false
    };
  }

  /**
   * Demande au backend de générer un secret 2FA et un QRCode.
   */
  static async initiateSetup(): Promise<TwoFactorSetupResponse> {
    console.info("[Simulation] Demande d'initialisation du 2FA au serveur.");
    // Ce secret simulé ne sera jamais utilisé dans une authentification réelle
    return {
      secret: "SIMULATED_SECRET_DO_NOT_USE",
      qrCodeUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" 
    };
  }

  /**
   * Confirme l'activation du 2FA en validant le premier code.
   */
  static async verifyAndEnable(code: string): Promise<boolean> {
    console.info(`[Simulation] Vérification du code 2FA pour activation: ${code}`);
    if (code.length !== 6 || isNaN(Number(code))) {
      throw new Error('Code invalide. Il doit contenir 6 chiffres.');
    }
    return true; // Simulation de succès
  }

  /**
   * Vérifie un code 2FA lors d'une connexion ou opération sensible.
   */
  static async verifyCode(code: string, contextId?: string): Promise<boolean> {
    console.info(`[Simulation] Vérification 2FA d'une opération. Code: ${code}, Contexte: ${contextId}`);
    if (code.length !== 6 || isNaN(Number(code))) {
      throw new Error('invalid-argument');
    }
    return true;
  }

  /**
   * Désactive le 2FA de l'utilisateur (requiert une validation au préalable).
   */
  static async disable2FA(): Promise<void> {
    console.info("[Simulation] Désactivation du 2FA via appel serveur.");
  }
}
