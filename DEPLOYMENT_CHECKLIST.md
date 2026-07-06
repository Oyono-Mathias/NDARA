# Checklist de Déploiement Production - NDARA

### 1. Variables d'Environnement (Secrets)
- [ ] `GEMINI_API_KEY` (Serveur Node)
- [ ] `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] Clefs Firebase Admin (`firebase-applet-config.json` ou variable encodée en B64)

### 2. Infrastructure Firebase (Firestore, Storage, Auth)
- [ ] Déployer les Security Rules `firestore.rules`.
- [ ] Déployer les Security Rules `storage.rules`.
- [ ] Vérifier les indexes Firestore composites : Les requêtes avec `orderBy` et `where` sur différentes propriétés (par ex. transactions et pagination des cours) requièrent la création d'indexes. Lancer les requêtes en Staging pour récolter et valider les liens de création d'index.

### 3. Tâches Planifiées (Cron)
- [ ] S'assurer que Cloud Scheduler est configuré ou que le setInterval en production sur le serveur Node s'exécute convenablement et uniquement sur un nœud leader (si multi-conteneurs). 

### 4. Nom de Domaine & SSL
- [ ] Lier le domaine officiel (ex. app.ndara.africa)
- [ ] Vérifier le HTTPS (SSL) forcé

### 5. Services Tiers
- [ ] BunnyCDN / R2 : Les buckets de stockage pour l'hébergement de vidéos sont-ils actifs et protégés ?
- [ ] Intégration Mobile Money : Le Webhook de retour de paiement point-il bien vers la route `/api/wallet/webhook` de la production ?

### 6. Mode Production Vite
- [ ] S'assurer que le build s'exécute avec `NODE_ENV=production`.
- [ ] Vérifier que le PWA s'installe correctement sur Android et iOS.
