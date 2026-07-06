# Architecture NDARA
## Frontend (React + Vite)
- **Framework** : React 18
- **Routing** : React Router DOM
- **State Management** : Context API & Hooks locaux
- **Styling** : Tailwind CSS
- **Bundling** : Vite avec configuration de split-chunks (Lazy Loading et Memoization)
- **Caching** : persistentLocalCache (Firestore)

## Backend (Node + Express)
- **Serveur** : Express (API REST et Proxy sécurisé)
- **Jobs & Cron** : Scripts Node.js exécutés en continu via `setInterval` pour les tâches planifiées (statistiques, nettoyage).
- **Database** : Firebase Firestore (NoSQL)
- **Auth** : Firebase Authentication

## Infrastructure & Déploiement
- **Hosting** : Cloud Run (Conteneur Docker / Node)
- **Storage** : BunnyCDN / Cloudflare R2 / Firebase Storage (Règles sécurisées)
- **Monitoring** : Middleware d'audit des requêtes lentes / erreurs, couplé à `audit_logs` sur Firestore.
