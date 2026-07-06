# Rapport QA - Corrections des Permissions Firestore (Blocages)

## 1. Fonctionnalité : Paramètres de Landing Page (LandingSettings)
- **Fichier concerné :** `src/hooks/useLandingSettings.ts` (Lignes 23-33)
- **Flux d'exécution :** Le hook écoute en temps réel (`onSnapshot`) le document `system_settings/landing_page`. Il met à jour l'état de la landing (prix mensuel, URL vidéo, etc.).
- **Dépendances :** `firebase/firestore` (onSnapshot, doc), `src/firebase.ts` (db).
- **Points d'entrée :** Page d'accueil publique `/` (`src/views/public/LandingPage.tsx`).
- **Test manuel :** Ouvrir l'application déconnecté. La Landing Page doit charger immédiatement sans l'erreur de console `Erreur hook LandingSettings`.
- **Cas d'erreur / Comportement :** Si la connexion échoue, le hook bascule sur des valeurs par défaut codées en dur (`monthly_price: 15000`).

## 2. Fonctionnalité : Statistiques Formateur (Dashboard Analytics)
- **Fichiers concernés :** `src/views/instructor/InstructorDashboard.tsx` (Lignes 50-181)
- **Flux d'exécution :** Au chargement (`useEffect`), le composant agrège le nombre d'étudiants (`enrollments`), le taux de complétion, les revenus (`payments`), et récupère les 5 derniers devoirs soumis (`assignments_submissions`).
- **Dépendances :** `firebase/firestore` (getCountFromServer, query, getDocs, onSnapshot).
- **Points d'entrée :** Route `/instructor/dashboard`.
- **Test manuel :** Se connecter avec un compte formateur et accéder au tableau de bord. Les KPI (Revenus, Étudiants) et les graphiques doivent s'afficher sans erreurs de permission dans la console.
- **Cas d'erreur / Comportement :** En cas d'échec de lecture, l'interface affiche `0` ou un état de chargement sans crasher l'UI complète (`try/catch` localisés).

## 3. Fonctionnalité : Statistiques Étudiant (Dashboard FinOps)
- **Fichiers concernés :** `src/views/Dashboard.tsx` (Lignes 44-140)
- **Flux d'exécution :** Le tableau de bord étudiant lit ses inscriptions (`enrollments`), l'historique de lecture (`user_history`), et les cours disponibles (`courses`) pour afficher ses métriques d'apprentissage et des recommandations.
- **Dépendances :** `firebase/firestore` (getCountFromServer, getDocs, limit, where).
- **Points d'entrée :** Route `/student/dashboard`.
- **Test manuel :** Se connecter avec un compte étudiant. Vérifier que la jauge de progression globale, les cours récents, et les cours recommandés apparaissent.
- **Cas d'erreur / Comportement :** Chaque requête est isolée. L'échec de la récupération de l'historique n'empêche pas l'affichage des cours recommandés.

### Action effectuée
Déploiement des règles Firestore mises à jour pour autoriser l'accès en lecture à ces collections (`system_settings`, `user_history`, `assignments_submissions`, `payments`, `enrollments` avec filtrage par `instructorId` ou `studentId`). Les requêtes sont désormais sécurisées et fonctionnelles.
