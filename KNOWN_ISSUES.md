# Liste des Problèmes Connus et Améliorations (RC1)

## Bugs Bloquants
- **Aucun bug critique ou bloquant** : L'application compile sans erreurs TypeScript bloquantes et le serveur Node/Express démarre de façon robuste. Le déploiement est fonctionnel.

## Bugs Mineurs
- **Taille du bundle en développement** : En mode dev, l'application peut sembler un peu lourde en raison du nombre massif de dépendances UI (lucide-react, framer-motion) avant la minification finale.
- **Rendu initial des images** : Lors d'une connexion réseau faible, l'avatar ou certaines miniatures d'e-books peuvent mettre quelques secondes à charger (absence de squelettes d'images partout).

## Améliorations UX (Futures)
- **Support complet Offline (PWA)** : Actuellement, seul le `CoursePlayer` dispose d'un cache rudimentaire pour les données hors-ligne. Une intégration plus profonde des Service Workers serait bénéfique.
- **Animation de squelette globale** : Généraliser l'utilisation de `ListSkeleton` sur l'ensemble des pages lors de la récupération initiale Firestore.
- **Micro-interactions sur le tableau de bord Formateur** : Ajouter des graphiques Recharts interactifs au lieu de KPI statiques pour visualiser l'évolution des ventes sur la semaine.
- **Filtres Avancés Ambassadeur** : Pouvoir filtrer l'historique financier par date ou statut.
