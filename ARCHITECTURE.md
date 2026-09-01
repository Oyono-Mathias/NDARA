# 🏗️ Architecture du Projet Ndara Afrique

## 1. Vue d'ensemble
Ndara Afrique est une plateforme web moderne et exhaustive, structurée selon une approche "Android First". L'application est conçue pour offrir une expérience utilisateur fluide sur smartphone Android (Material Design 3, gestes tactiles, offline-first), tout en restant responsive pour les tablettes et les environnements desktop. Elle est conçue sous forme de PWA (Progressive Web App).

## 2. Stack Technologique
- **Frontend** : React 18+, TypeScript, Vite, Tailwind CSS (v4)
- **Internationalisation** : Français (défaut) / Anglais (i18n)
- **State Management** : React Context + Hooks personnalisés (Zustand prévu si nécessaire pour les états globaux complexes)
- **Backend / BaaS** : Firebase (Authentication, Firestore, Cloud Functions, Cloud Storage)
- **Sécurité & Intégrité** : Firebase Security Rules strictes, vérification côté serveur des opérations sensibles (paiements, rôles), architecture "Zero Trust" côté client.

## 3. Principes "Android First" et PWA (Non-négociables)
- **Navigation** : Optimisation pour un usage à une main (Bottom Navigation Bar priorisée sur mobile).
- **Composants** : Privilégier les Bottom Sheets aux modales centrées sur mobile.
- **Feedback** : Snackbars non-intrusives pour les notifications, pas d'alertes natives (`alert()`).
- **Touch Targets** : Zones cliquables de 48x48px minimum.
- **Layout** : Prise en charge des "Safe Areas" pour l'encoche et les barres de navigation natives.
- **Performance** : Animations CSS fluides, prévention des comportements de rebond (`overscroll-behavior`), suppression des hover states sur tactile.

## 4. Organisation Logique et Modulaire
La structure est conçue pour accueillir les 46 phases du projet :
```text
src/
├── components/       # Composants UI isolés et réutilisables (Button, Card, BottomSheet)
├── contexts/         # Contextes React globaux (Auth, Theme, i18n)
├── docs/             # Documentation technique (API, Swagger)
├── features/         # Modules métier isolés (auth, wallet, catalogue, chat, ecommerce)
├── hooks/            # Hooks personnalisés
├── services/         # Interactions Firebase, appels API externes
├── utils/            # Fonctions pures, helpers, formatage
├── types/            # Définitions et interfaces TypeScript (modèles de données)
├── routes/           # Configuration des routes et Guards (Private/Public)
├── views/            # Pages principales (composants conteneurs)
├── i18n.ts           # Configuration multilingue
├── index.css         # Styles globaux (Tailwind, Safe areas)
└── main.tsx & App.tsx # Point d'entrée et Layout principal
```

## 5. Stratégie Backend (Firebase)
- **Authentication** : Gestion des identités sécurisée.
- **Firestore** : Base de données NoSQL (Collections structurées par domaine métier).
- **Cloud Functions** : Logique serveur pour toutes les opérations sensibles (transactions, calculs financiers, modifications de rôles).
- **Storage** : Stockage sécurisé des médias, assets de cours, avatars.
- **Sécurité** : Application stricte des `firestore.rules` limitant les droits d'écriture et de lecture par rôle et appartenance de la donnée.

## 6. Principes d'Ingénierie
- **Séparation des responsabilités** : Les vues (`views/`) orchestrent, les services (`services/`) exécutent, les composants (`components/`) affichent.
- **Typage strict** : Tout objet transitant entre le client et le backend doit posséder une interface TypeScript dédiée.
- **Sécurité "By Design"** : Ne jamais faire confiance au client. Toute opération financière, attribution de rôle, ou modification de droits d'accès doit être validée par une Cloud Function.
- **Absence de secrets côté client** : Aucun token d'API privé ou clé secrète ne doit figurer dans le frontend.
- **Évolutivité** : L'architecture doit permettre l'intégration fluide des futures briques (catalogue, gamification, paiements) sans réécritures globales.
