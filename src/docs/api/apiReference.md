# 📖 Référence API - Ndara Afrique

Cette documentation explique la structure et les conventions de l'API de Ndara Afrique. Actuellement en **Phase 2 (Architecture)**, les implémentations réelles interviendront lors des phases fonctionnelles (Phase 5+, Wallet, E-commerce, etc.).

## Organisation
L'architecture de l'application repose principalement sur **Firebase** :
- Les **lectures de données publiques ou appartenant à l'utilisateur** se font directement via les SDKs Frontend Firestore, protégés par les règles de sécurité (`firestore.rules`).
- Les **opérations sensibles** (qui impliquent des calculs, des validations complexes ou des interactions avec des services tiers comme les passerelles de paiement) passent par des API REST développées via **Firebase Cloud Functions**.

## Sécurité & Authentification
Toutes les requêtes adressées à l'API (à l'exception des webhooks publics) doivent inclure un token d'authentification Firebase :
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```
Le serveur vérifiera la validité du token, son expiration, et extraira l'`uid` pour vérifier l'identité de l'utilisateur.

## Flux Sécurisés : Le Code PIN
Pour autoriser une transaction financière ou une modification sensible, le client devra envoyer son code PIN (à 4 chiffres) en clair (ou pré-hashé selon l'implémentation future) via TLS.
Le backend (Cloud Functions) va hacher cette entrée et la comparer au hash `pinHash` (Argon2 ou bcrypt) stocké dans le document utilisateur. 
**Aucune opération n'est exécutée si la vérification échoue.**

## Format des Requêtes et Réponses
Les échanges se font au format `application/json`.

### Requête (Exemple Transfert P2P)
```json
POST /v1/wallet/transfer
Idempotency-Key: a1b2c3d4-e5f6-7890-abcd-1234567890ab

{
  "recipientPhone": "+2376XXXXXXXX",
  "amount": 5000,
  "pin": "1234"
}
```

### Réponse Succès
```json
{
  "status": "success",
  "data": {
    "transactionId": "tx_abc123",
    "newBalance": 10000
  }
}
```

### Réponse Erreur
```json
{
  "status": "error",
  "code": "INSUFFICIENT_FUNDS",
  "message": "Votre solde est insuffisant pour ce transfert."
}
```

## Conventions
- **Noms de clés** : `camelCase`.
- **Montants** : Toujours en entier (ex: 5000 pour 5000 XAF) afin d'éviter les erreurs d'arrondi sur les flottants.
- **Dates** : Format ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Erreurs HTTP** : 
  - `400 Bad Request` : Erreur de validation (ex: Zod).
  - `401 Unauthorized` : Token manquant ou invalide.
  - `403 Forbidden` : PIN incorrect, ou l'utilisateur n'a pas les droits.
  - `404 Not Found` : Ressource introuvable.
  - `429 Too Many Requests` : Rate Limiting (ex: tentatives PIN).
  - `500 Internal Server Error` : Crash inattendu serveur.
