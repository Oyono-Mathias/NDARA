# Checklist Assurance Qualité (QA) - Écrans NDARA

## Portail Public
- [x] **LandingPage (`/`)**
  - [x] Responsive (Desktop/Mobile)
  - [x] Call-to-actions fonctionnels (Inscription/Connexion)
- [x] **Auth (Login, Register, Forgot Password, Verify Email)**
  - [x] Validation des formulaires
  - [x] Firebase Auth intégré
  - [x] Gestion des messages d'erreur

## Espace Étudiant (`/student/*`)
- [x] **Dashboard (`/student/dashboard`)**
  - [x] Récupération de la progression en temps réel
  - [x] Accès rapide aux cours récents
- [x] **Catalogue (`/student/catalog`)**
  - [x] Filtres et recherche
  - [x] Chargement asynchrone des vignettes
- [x] **CoursePlayer (`/student/courses/:courseId`)**
  - [x] Lecteur vidéo (HLS/DASH/MP4)
  - [x] Sauvegarde de progression
  - [x] Protection des DRM
- [x] **Wallet & Paiement (`/student/wallet`, `/checkout/:courseId`)**
  - [x] Intégration paiement
  - [x] Gestion du solde (XAF)
  - [x] Sécurité des requêtes (Turnstile)
- [x] **Quiz & Certificats (`/student/quiz`, `/student/certificates`)**
  - [x] Évaluation temps réel
  - [x] Génération et attribution conditionnelle de certificat
- [x] **Chat / Messages (`/student/messages`)**
  - [x] WebSocket ou Firestore real-time
  - [x] Notifications
  - [x] Appels vidéo/audio (UI)

## Espace Formateur (`/instructor/*`)
- [x] **Dashboard (`/instructor/dashboard`)**
  - [x] KPIs : Étudiants, Revenus, Cours
- [x] **Gestion des Cours (`/instructor/courses`)**
  - [x] Création/Édition de modules
  - [x] Upload sécurisé de médias
- [x] **Portefeuille / Revenus (`/instructor/wealth`)**
  - [x] Affichage des revenus nets
  - [x] Historique des transactions
  - [x] Demandes de retrait (Payouts)

## Espace Ambassadeur (`/ambassador`)
- [x] **Dashboard Affiliation**
  - [x] Copie du lien de parrainage
  - [x] Suivi des clics, inscriptions, ventes
  - [x] Soldes et demande de retrait (Escrow 14 jours)

## Espace Admin (`/admin/*`)
- [x] **Vue d'ensemble (`/admin/dashboard`)**
  - [x] Statistiques globales (Revenus, Inscriptions)
- [x] **Gestion Utilisateurs (`/admin/members`)**
  - [x] Actions : Bannir, Modifier rôle
- [x] **Validation Transactions (`/admin/transactions`)**
  - [x] Approbation atomique des retraits (Payouts)
  - [x] Registre comptable inaltérable
- [x] **Modération & Sécurité (`/admin/moderation`, `/admin/security`)**
  - [x] Traitement des signalements
  - [x] Logs d'audit
