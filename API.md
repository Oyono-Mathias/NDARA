# API Interne & Monitoring
Le backend de l'application (situé dans `server.ts`) expose les endpoints suivants :
- `GET /api/health` : Vérification du statut du serveur.
- `POST /bunny/upload` : Signature de requêtes pour BunnyCDN.
- `POST /proxy` : Proxy pour les appels API externes.
- `MIDDLEWARE` : Logging automatique des requêtes lentes (>1000ms) et des erreurs vers Firestore.

## Tâches Planifiées (Cron)
Situées dans `src/jobs/cronTasks.ts` :
- `generateDailyStats` : Agrégation des utilisateurs et inscriptions.
- `generateCertificates` : Création des certificats de fin de cours.
- `generateNotifications` : Rappels d'inactivité.
- `cleanupExpiredData` : Suppression des logs de plus de 30 jours.
- `archiveData` : Archivage des cours brouillons inactifs.
- `deleteExpiredAccounts` : Désactivation des comptes inactifs depuis 3 ans.
- `generateReports` : Création de rapports mensuels financiers.
