# 🔌 Principes et Contrats API - Ndara Afrique

## Conventions Générales
- **Architecture** : Les appels frontend se font majoritairement via le SDK Firebase (Firestore/Auth) pour les lectures en temps réel.
- **Opérations Sensibles** : Les transactions, paiements, inscriptions à des cours ou modifications de droits passent obligatoirement par des API Rest (hébergées sur Cloud Functions).
- **Méthodes HTTP** : 
  - `GET` : Lecture (lorsque Firestore direct n'est pas possible).
  - `POST` : Création, webhooks, et exécution d'actions sensibles (paiement).
  - `PATCH` : Mise à jour partielle.
  - `DELETE` : Suppression logique (soft delete).

## Principes de Sécurité et Robustesse
1. **Authentification** : Toutes les routes `/api/*` (hors webhooks publics) exigent un token Firebase ID valide (`Authorization: Bearer <token>`).
2. **Autorisation** : Les Cloud Functions vérifient le rôle et l'appartenance de la ressource (Zero Trust).
3. **Idempotence** : Toute opération financière, achat de cours ou e-commerce accepte un header `Idempotency-Key` (UUID) pour prévenir les doubles requêtes en cas de perte de connexion mobile.
4. **Validation des Entrées** : Validation stricte des payloads via Zod ou équivalent côté serveur.
5. **Vérification HMAC** : Les webhooks des agrégateurs de paiement (Mesomb, Flutterwave) DOIVENT être vérifiés par signature cryptographique (ex: `verif-hash`).
6. **Rate Limiting** : Protection contre le bruteforce (ex: limite de 3 essais pour le code PIN, 10 req/min pour les OTP).

## Format des Données
- **Requêtes / Réponses** : Toujours en `application/json`.
- **Réponse Succès** :
  ```json
  {
    "status": "success",
    "data": { ... },
    "meta": { "page": 1, "total": 50 } // Pour la pagination
  }
  ```
- **Réponse Erreur** :
  ```json
  {
    "status": "error",
    "code": "INSUFFICIENT_FUNDS",
    "message": "Solde insuffisant pour cette opération."
  }
  ```

## Services Futurs (Aperçu)

### 1. Sécurité & Authentification (PIN)
- L'API nécessitera un flux de validation PIN (4 chiffres) pour : transferts P2P, retraits, achats majeurs.
- Le PIN ne circulera jamais en clair dans la base (hash serveur).

### 2. Paiements et Portefeuille
- `POST /api/wallet/transfer` : Transfert P2P.
- `POST /api/payments/deposit/initiate` : Initialisation via Mobile Money.
- `POST /api/webhooks/payment` : Callback des opérateurs (exige HMAC).

### 3. E-Learning & E-Commerce
- `POST /api/courses/enroll` : Inscription avec vérification du solde.
- `POST /api/orders/checkout` : Validation de panier physique/virtuel.

### 4. Communication
- `POST /api/notifications/send` : Déclenchement de push notifications Firebase Cloud Messaging.

*(La documentation exacte des endpoints, chemins et paramètres sera détaillée dans OpenAPI et lors du développement des phases spécifiques).*
