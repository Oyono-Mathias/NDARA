# 🗄️ Modèle de Données Ndara Afrique (Firebase Firestore)

## Principes Généraux
- Sécurité et intégrité : Les écritures sensibles sont protégées par les Security Rules.
- Horodatage : Les champs `createdAt` et `updatedAt` exploitent `serverTimestamp()`.
- Modèle monétaire : La devise par défaut est le **XAF** (Franc CFA). Les montants sont toujours des entiers pour éviter les erreurs de virgule flottante.
- Évolutivité : Le schéma intègre les fondations des 46 phases prévues (catalogue, e-commerce, gamification, chat, etc.) mais leur structure détaillée sera définie dans les phases respectives.

## Collections Principales Définies

### 1. `users`
- `uid` (string) : ID d'authentification Firebase.
- `phone` (string) : Numéro de téléphone (E.164, indexé).
- `email` (string, optionnel).
- `pinHash` (string) : Hachage sécurisé du code PIN (système de sécurité à venir).
- `kycStatus` (string) : 'pending', 'verified', 'rejected'.
- `role` (string) : 'user', 'admin', 'instructor', 'agent'.
- `createdAt` (timestamp).
*(Note : Les préférences multi-devises, abonnements, portfolio et statistiques de gamification viendront enrichir cette collection dans les phases dédiées).*

### 2. `wallets`
- `userId` (string) : Référence à `users.uid`.
- `balance` (number) : Solde en XAF.
- `currency` (string) : 'XAF'.
- `status` (string) : 'active', 'frozen'.

### 3. `transactions`
- `id` (string) : ID unique.
- `userId` (string) : Propriétaire du portefeuille.
- `type` (string) : 'deposit', 'withdrawal', 'p2p_send', 'p2p_receive', 'course_purchase', 'fee'.
- `amount` (number) : Montant en XAF.
- `status` (string) : 'pending', 'completed', 'failed'.
- `reference` (string) : Référence externe (ex: Mesomb, Flutterwave).
- `hmacSignature` (string) : Intégrité cryptographique.
- `createdAt` (timestamp).

### 4. `kyc_records`
- `userId` (string).
- `documentType` (string).
- `documentUrl` (string) : Référence Cloud Storage protégée.
- `status` (string) : 'pending', 'approved', 'rejected'.

### 5. `audit_logs` (Lecture seule pour admins)
- `action` (string) : Tracabilité stricte (RGPD, fraudes).
- `userId` (string).
- `timestamp` (timestamp).

## Collections Futures (Planifiées)

Les collections suivantes seront créées et détaillées lors de leurs phases respectives :

- `courses` & `catalogue` : Architecture des formations, syllabus, et assets vidéos.
- `enrollments` & `learning_paths` : Suivi de progression des étudiants.
- `products` & `orders` : E-commerce (articles physiques ou virtuels).
- `chat_rooms` & `messages` : Messagerie et sessions live.
- `notifications` : Alertes ciblées (in-app et push).
- `gamification` & `certifications` : Badges, points, et diplômes générés.
- `reviews` & `mentoring` : Évaluations et réservations de sessions.
- `coupons` & `affiliations` : Codes promo et commissions.

## Principes d'Indexation
- La majorité des requêtes étant centrées sur l'utilisateur, des index composites (ex: `userId` + `createdAt DESC`) devront être créés pour les transactions, les notifications et les cours.
