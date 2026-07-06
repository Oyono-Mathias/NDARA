# Changelog

Toutes les modifications notables apportées à NDARA seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à la Gestion sémantique de version.

## [1.0.0-rc.1] - 2026-07-06

### Ajouté
- **Système PWA** pour un support offline partiel avec `VitePWA` et cache local pour le Course Player.
- **Tableau de Bord Ambassadeur** complet (Liens viraux, statistiques en temps réel, demande de versement).
- **Moteur Transactionnel Atomique** garantissant des paiements scindés entre Instructeurs et Ambassadeurs (commission 10%).
- **Séquestre automatique de 14 jours** sur les revenus d'affiliation pour limiter les fraudes.
- **Chat P2P et de groupe** avec support d'upload de fichiers, recherches, indicateurs de frappe et sockets WebRTC.
- **Portefeuille Sécurisé (Neo-Banque)** côté étudiant, instructeur et ambassadeur.
- **Module Admin (RBAC)** complet : Audit de sécurité, validation Mobile Money, gestion du catalogue et membres.
- Lecteur vidéo robuste HLS / DASH et fallback MP4 natif intégré au parcours de formation.

### Modifié
- Refonte des requêtes Firestore pour utiliser des indexes (composite) optimisant la lecture des très grands catalogues.
- Découpage complet de `App.tsx` en `React.lazy` pour réduire la taille initiale de chargement du bundle.
- Optimisation de la construction avec des chunks Vendor dédiés dans Vite (Framer Motion, Firebase, React).

### Sécurité
- Intégration de **Cloudflare Turnstile** sur toutes les transactions financières (Achat, Retrait) et l'authentification.
- Backend en place avec `isAuthenticated` et middlewares vérifiant les revendications (Custom Claims) RBAC.
