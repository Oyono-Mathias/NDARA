# NDARA Database Schema (Firestore)
## Collections Principales
- `users` : Informations sur les étudiants, formateurs, et administrateurs.
- `courses` : Catalogue de formations (status, metadata, rating).
- `enrollments` : Progression des étudiants par cours.
- `payments` : Historique des paiements.
- `wallets` : Portefeuilles virtuels pour le système NDARA.
- `audit_logs` : Journal d'activité (Monitoring admin & Requêtes lentes).
- `roles` : Gestion des rôles et permissions RBAC.
- `statistics` : Données de statistiques quotidiennes pré-calculées par le serveur.
- `reports` : Rapports générés automatiquement.

## Stratégie d'optimisation & Sécurité
- Utilisation de `getCountFromServer` et `getAggregateFromServer` pour réduire les lectures (reads).
- Indexation composite pour les requêtes de filtrage complexes (`status` + `createdAt`).
- Caching local hors-ligne activé via `persistentLocalCache` limitant les allers-retours serveurs.
- Suppression logique (`isDeleted: true`) au lieu de suppression physique pour l'archivage.
- Règles de sécurité Firestore avec fonctions de validation de types et de limites.
