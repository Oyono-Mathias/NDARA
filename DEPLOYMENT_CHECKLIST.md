# ✅ Checklist de Déploiement - Ndara Afrique

Cette checklist définit les contrôles qualité et sécurité obligatoires avant, pendant et après chaque déploiement majeur du projet Ndara Afrique.

## 1. Avant le Déploiement (Pre-flight)

### Qualité du Code
- [ ] `npm run typecheck` s'exécute sans erreur.
- [ ] `npm run lint` s'exécute sans erreur (s'il est configuré).
- [ ] Le build de production (`npm run build`) est réussi et optimisé.
- [ ] Tous les tests unitaires / intégration sont au vert.

### Variables d'Environnement & Sécurité
- [ ] Le fichier `.env` de production est à jour.
- [ ] Aucun secret (clé d'API, credential Firebase privé) n'est exposé côté client (`VITE_...`).
- [ ] Les clés d'API (Mesomb, Flutterwave) de production sont configurées dans l'environnement des Cloud Functions.

### Firebase & Backend
- [ ] Les `firestore.rules` sont mises à jour et vérifiées avec le script d'audit.
- [ ] Les Cloud Functions sont transpilées et prêtes à être déployées (`firebase deploy --only functions`).
- [ ] Les index Firestore (composites) requis sont configurés dans `firestore.indexes.json`.

### Architecture & SEO
- [ ] Le fichier `manifest.json` est valide pour la PWA.
- [ ] Les fichiers `robots.txt` et `sitemap.xml` pointent vers le domaine de production final.
- [ ] Les balises meta (viewport Android First, theme-color) sont intactes.

## 2. Phase de Déploiement (Production)

- [ ] Déploiement des règles de sécurité : `firebase deploy --only firestore:rules`
- [ ] Déploiement des fonctions serveur : `firebase deploy --only functions`
- [ ] Déploiement de l'application frontend sur l'hébergement cible (ex: Firebase Hosting, Vercel, Cloud Run).
- [ ] Validation de l'activation du SSL/TLS (HTTPS obligatoire).
- [ ] Vérification du statut des systèmes de sauvegarde (Backups Firestore).

## 3. Après le Déploiement (Post-flight)

### Smoke Tests
- [ ] Le site se charge correctement sur Mobile (Android) et Desktop.
- [ ] Connexion / Déconnexion d'un compte test (Authentification Firebase).
- [ ] Pas d'erreurs (404, 500, ou CORS) dans la console du navigateur.

### Tests Critiques (Fonctionnalités métier)
- [ ] (Future phase) Simulation de dépôt / retrait via un compte test sécurisé.
- [ ] (Future phase) Achat de cours / Accès à un contenu payant vérifié.
- [ ] (Future phase) Réception des notifications (FCM).

### Monitoring & Rollback
- [ ] Vérification des logs Firebase Functions (absence de crash ou boucles infinies).
- [ ] Le système d'APM (ex: Sentry, Firebase Crashlytics) capte bien l'environnement de "production".
- [ ] En cas de faille critique, la procédure de Rollback (revenir au build précédent) est documentée et testable.
