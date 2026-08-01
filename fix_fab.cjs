const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/PromptCopierFAB.tsx', 'utf8');

const fullPrompt = `PHASE 1 — SÉCURISATION ET STABILISATION DU MODULE INSTRUCTOR

Avant toute modification, analyse l'existant et respecte strictement l'architecture actuelle. Ne supprime aucune fonctionnalité déjà opérationnelle.

OBJECTIF :
Corriger les problèmes critiques identifiés dans l'audit du module Instructor et préparer une base stable pour les futurs développements.

TRAVAIL À EFFECTUER :

1. SÉCURITÉ FIRESTORE (PRIORITÉ ABSOLUE)
Réécrire les règles Firestore concernant :
- courses
- course_coupons
- course_announcements
- course_resources
- course_qna
- certificates
- enrollments
... (et la suite des 8 points)`;

code = code.replace(
  /const promptText = ".*";/s,
  `const promptText = \`${fullPrompt}\`;`
);

fs.writeFileSync('src/components/instructor/PromptCopierFAB.tsx', code);
