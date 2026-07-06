# NDARA Afrique - Notes de Version RC1

## Bienvenue dans la version Release Candidate 1 (RC1)
NDARA passe aujourd'hui de l'état de développement actif à l'état de produit complet, prêt à la publication pour les premiers utilisateurs Beta en Afrique.

### Fonctionnalités Clés Livrées :
- **Ecosystème Financier Mobile Money** : Les étudiants peuvent acheter via Orange/MTN/Wave. Les formateurs et ambassadeurs peuvent retirer leurs gains par les mêmes canaux, avec un système de transaction atomique qui protège chaque centime.
- **Affiliation Virale** : Chaque utilisateur dispose d'un lien traçable lui rapportant 10% de commission sur chaque inscription payante, bloquée par un séquestre de 14 jours.
- **Formation 100% Mobile First** : Vidéos, eBooks, Quiz et Certificats natifs, adaptés aux petites connexions africaines.

### Pour les Testeurs QA
La phase de test RC1 requiert de la concentration sur :
1. L'intégrité du transfert des fonds entre Portefeuille -> Demande de Retrait -> Validation Admin.
2. La réactivité des `onSnapshot` dans des environnements de faible connexion.
3. Les transitions entre les espaces Etudiant, Formateur, et Admin sans rechargement lourd.

*Fin des développements. Phase de QA, optimisation et stabilisation enclenchée.*
