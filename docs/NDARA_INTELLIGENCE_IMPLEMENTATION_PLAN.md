# NDARA Intelligence — plan d’intégration technique

> Statut : document de cadrage technique, pas une fonctionnalité déjà déployée.
> Cible : budget initial 0 FCFA, architecture hybride, compréhension vidéo audio + image + texte.
> Dépôt : `Oyono-Mathias/NDARA`.

## 1. Décision d’architecture

NDARA reste une application React + Vite + TypeScript. Le client ne contacte jamais directement les fournisseurs IA avec une clé secrète. Tous les appels passent par un backend Firebase Admin / Cloud Functions.

- **Gemini API (Google AI Studio)** : moteur multimodal principal pour analyser une vidéo avec sa piste audio et ses images, répondre avec des timecodes, résumer et générer des quiz.
- **Groq** : connecteur de transcription de secours (Whisper multilingue), mais ne pas l’activer dans le parcours à 0 FCFA sans vérifier dans la console que l’usage est effectivement gratuit ; la documentation affiche des tarifs à l’heure pour la transcription.
- **Mistral** : fournisseur secondaire pour les tâches texte (reformulation, résumé, quiz) ; son mode Free est destiné à l’évaluation/prototypage et ses limites sont faibles. Ne pas le considérer comme remplaçant multimodal vidéo.
- **OpenRouter** : banc d’essai/fallback de modèles texte gratuits uniquement. Son offre gratuite est limitée (50 requêtes/jour selon la page de tarification consultée) ; ne pas en faire une dépendance de production.
- **Firebase existant** : Auth, Firestore, Storage. Réutiliser l’application Firebase existante et vérifier les règles/quotas avant tout déploiement.
- **Traitement asynchrone** : création d’un job Firestore, worker backend, progression persistée dans Firestore. Ne pas analyser une vidéo pendant une requête HTTP longue.

### Pourquoi Gemini en premier

La compréhension vidéo native permet de traiter simultanément audio et images et de poser des questions sur des segments avec timestamps. Le pipeline NDARA doit néanmoins conserver une transcription horodatée et des segments indexables : cela améliore les citations, la recherche et la résilience en cas de changement de fournisseur.

## 2. Comptes à créer / préparer

Créer les comptes avec une adresse administrateur NDARA et activer l’authentification à deux facteurs.

| Service | Lien | Action |
|---|---|---|
| Google AI Studio | https://aistudio.google.com/ | Créer un projet API, générer une clé Gemini et vérifier les modèles/quota Free disponibles dans le pays et le compte |
| Groq Console | https://console.groq.com/ | Créer une organisation, une clé API et vérifier les limites du modèle Whisper choisi |
| Mistral Console | https://console.mistral.ai/ | Facultatif : créer une clé pour le fallback texte et vérifier que le mode Free est activé |
| OpenRouter | https://openrouter.ai/ | Facultatif : créer une clé pour tester des modèles texte `:free`; surveiller le plafond journalier |
| Firebase Console | https://console.firebase.google.com/ | Ouvrir le projet Firebase réellement utilisé par NDARA, vérifier Auth, Firestore, Storage, régions et règles |
| GitHub | https://github.com/Oyono-Mathias/NDARA | Garder les secrets fournisseurs hors du dépôt ; utiliser GitHub Actions uniquement pour le déploiement si nécessaire |

**Ne pas créer plusieurs projets Firebase par réflexe.** Le dépôt initialise déjà Firebase depuis `firebase-applet-config.json` dans `src/firebase.ts`. Confirmer dans Firebase Console que ce projet et la base Firestore configurée sont bien l’environnement cible avant d’ajouter des ressources.

## 3. Clés et variables d’environnement

Noms de secrets backend proposés :

- `GEMINI_API_KEY` — obligatoire pour le moteur principal.
- `GROQ_API_KEY` — facultatif, transcription de secours.
- `MISTRAL_API_KEY` — facultatif, fallback texte.
- `OPENROUTER_API_KEY` — facultatif, expérimentation seulement.
- `AI_PROVIDER_MODE` — configuration non secrète : `hybrid`.
- `AI_DAILY_USER_LIMIT` — quota applicatif par utilisateur.
- `AI_MAX_VIDEO_MINUTES` — durée maximale admise au MVP.

Stockage recommandé en environnement Firebase : Firebase Functions Secret Parameters / Google Secret Manager, avec accès limité aux fonctions qui en ont besoin. En local, utiliser un fichier `.env.local` non versionné ou l’émulateur et vérifier que les fichiers secrets sont dans `.gitignore`.

Commandes indicatives, depuis la racine du projet après installation de Firebase CLI et configuration du projet :

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set GROQ_API_KEY
firebase functions:secrets:set MISTRAL_API_KEY
firebase functions:secrets:set OPENROUTER_API_KEY
```

Saisir uniquement les clés réellement créées. Ne jamais coller une clé dans un ticket GitHub, un commit, un fichier React/Vite `.env` exposé au navigateur, ni dans une conversation. Les clés Vite préfixées `VITE_` sont publiques : aucune clé fournisseur IA ne doit porter ce préfixe.

## 4. Architecture cible

```text
React / Vite (NDARA)
  ├─ Firebase Auth : identité de l’apprenant / formateur
  ├─ Firebase App Check : attestation anti-abus
  └─ NDARA Intelligence UI
       ├─ Assistant de cours / chat
       ├─ Résumé / chapitres / transcription
       └─ Quiz / questions avec timecodes
             |
             | Firebase callable / HTTPS (ID token + App Check)
             v
Firebase Cloud Functions (backend sécurisé)
  ├─ aiChat                 -> routeur de modèles
  ├─ requestVideoAnalysis   -> contrôle d’accès + création de job
  ├─ onVideoJobCreated      -> worker asynchrone
  ├─ getVideoAnalysis       -> statut / résultat autorisé
  └─ aiUsage                -> quotas / journalisation
             |
             ├─ Gemini API : vidéo, images, texte
             ├─ Groq API : transcription audio de secours
             └─ Mistral / OpenRouter : fallback texte
             |
             v
Firestore + Firebase Storage
  ├─ ai_video_jobs
  ├─ video_transcripts
  ├─ video_segments
  ├─ video_chapters
  ├─ ai_conversations
  └─ ai_usage
```

### Flux de publication d’une vidéo

1. Le formateur publie une vidéo dans le Storage NDARA et associe le fichier à un cours/une leçon.
2. Le backend vérifie le rôle du formateur, l’accès au cours, le type MIME, la taille et la durée autorisée.
3. Le backend crée un document `ai_video_jobs/{jobId}` avec le statut `queued`. Un identifiant de version de vidéo empêche de retraiter le même fichier.
4. Un worker récupère la vidéo via une URL signée de courte durée ou un accès Storage côté serveur. Ne jamais rendre le bucket public pour faciliter l’analyse.
5. Gemini analyse le contenu audio-visuel et produit une synthèse structurée ; FFmpeg peut extraire l’audio et des images clés si une analyse séparée est nécessaire.
6. Groq Whisper peut produire une transcription horodatée de secours. Les timecodes sont normalisés en secondes.
7. Le backend découpe la transcription en segments, conserve les références temporelles et extrait les chapitres.
8. Les résultats sont enregistrés dans Firestore ; le job passe à `completed` ou `failed`.
9. L’interface affiche le lecteur, les chapitres et les réponses IA avec un lien « Voir à 03:24 ».

### Flux question/réponse

1. Le client envoie `courseId`, `lessonId`, `videoId`, la question et éventuellement le timecode courant.
2. Le backend vérifie Firebase Auth, App Check, l’inscription de l’apprenant et ses droits sur le cours.
3. Il récupère uniquement les segments de cette vidéo auxquels l’utilisateur a droit.
4. Le routeur choisit Gemini pour les demandes audio-visuelles ; Mistral/OpenRouter ne sont que des solutions de repli pour du texte.
5. Le modèle doit répondre à partir du contenu retrouvé, fournir des timecodes, et signaler explicitement quand la réponse ne figure pas dans la vidéo.
6. La conversation et la consommation sont journalisées sans conserver inutilement de données sensibles.

## 5. Modèle Firestore initial

### `ai_video_jobs/{jobId}`

```ts
{
  courseId: string;
  lessonId: string;
  videoId: string;
  videoVersion: string; // hash ou version Storage
  storagePath: string;
  requestedBy: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0..100
  provider: "gemini" | "hybrid";
  errorCode?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `video_segments/{segmentId}`

```ts
{
  videoId: string;
  courseId: string;
  lessonId: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  visualSummary?: string;
  source: "transcript" | "vision" | "multimodal";
  language?: string;
  createdAt: Timestamp;
}
```

Autres collections : `video_chapters`, `ai_conversations`, `ai_usage`. Les documents doivent contenir les identifiants de cours/vidéo et des champs de propriété utiles aux règles d’accès. Ne pas exposer directement les journaux internes aux apprenants.

**Recherche RAG :** MVP = segments horodatés récupérés par le backend avec recherche simple et contexte limité. Phase suivante = embeddings + index vectoriel (Firestore vector search ou Postgres/pgvector après validation des coûts et de la région). Ne pas ajouter une base vectorielle payante avant d’avoir mesuré le volume réel.

## 6. Contrat API backend

Routes / fonctions proposées (noms indicatifs) :

| Fonction | Entrée | Résultat |
|---|---|---|
| `requestVideoAnalysis` | `courseId, lessonId, videoId` | `jobId, status` |
| `getVideoAnalysis` | `jobId` | statut, progression, chapitres |
| `askVideoQuestion` | `videoId, question, currentTime?` | réponse, sources `[{startSeconds,endSeconds}]` |
| `generateVideoSummary` | `videoId, style?` | résumé avec timecodes |
| `generateVideoQuiz` | `videoId, difficulty, count` | questions, réponses, explications |
| `getAiUsage` | aucun (UID depuis Auth) | usage et quota de l’utilisateur |

Toutes les entrées doivent être validées par schéma (Zod côté serveur ou équivalent). Le backend déduit toujours l’UID depuis le jeton Firebase ; ne jamais accepter un `userId` fourni par le navigateur comme preuve d’identité.

## 7. Intégration dans le dépôt NDARA

État constaté sur la branche `main` au moment de l’audit :

- `package.json` : React 18, Vite 5, TypeScript, Firebase JS SDK 11 ; aucun SDK IA backend déclaré dans le package frontend.
- `src/firebase.ts` : Firebase App, Auth, Firestore et Storage déjà initialisés.
- `src/App.tsx` : routage React existant avec layouts apprenant/formateur/admin.
- `DATABASE.md` : collections utilisateurs, wallets, transactions, audit logs ; collections pédagogiques encore décrites comme futures.
- `functions/src/paymentWebhook.ts` existe, mais aucun `functions/package.json`, `functions/tsconfig.json` ni point d’entrée `functions/src/index.ts` n’a été trouvé dans les chemins audités. Il faut compléter et tester le projet Functions avant déploiement.
- Pas de `firebase.json` trouvé à la racine dans l’audit. La configuration Firebase CLI devra être créée après confirmation du projet et de ses règles existantes.

Structure proposée :

```text
functions/
  package.json
  tsconfig.json
  src/
    index.ts
    intelligence/
      router.ts
      geminiProvider.ts
      groqProvider.ts
      textFallbackProvider.ts
      videoJobs.ts
      prompts.ts
      schemas.ts
src/
  modules/
    intelligence/
      components/
        VideoAssistant.tsx
        VideoChapters.tsx
        VideoSummary.tsx
        VideoQuiz.tsx
      services/
        intelligenceClient.ts
      types/
        intelligence.ts
docs/
  NDARA_INTELLIGENCE_IMPLEMENTATION_PLAN.md
```

Intégration UI recommandée : ajouter les composants dans la page de lecture de leçon existante, pas créer un lecteur vidéo parallèle. Commencer par un panneau latéral « Assistant NDARA », puis onglets/sections « Transcription », « Chapitres », « Résumé », « Quiz ». Les routes React ne seront ajoutées que si une page dédiée devient nécessaire.

## 8. Sécurité, confidentialité et budget

- Authentification Firebase obligatoire ; vérifier côté serveur le rôle, l’inscription au cours et la propriété des vidéos.
- Activer App Check progressivement (métriques d’abord, enforcement ensuite) et appliquer des quotas par UID, vidéo et adresse IP.
- Les clés fournisseur restent dans Secret Manager et ne sont accessibles qu’aux fonctions concernées.
- Ne jamais analyser un contenu privé sans droit d’accès. Utiliser des URL signées à durée courte.
- Les offres gratuites peuvent utiliser les prompts/résultats pour améliorer les produits du fournisseur selon leurs conditions. Ne pas envoyer de données personnelles, informations KYC, conversations privées ou données de mineurs à un endpoint gratuit sans validation juridique et contractuelle préalable.
- Stocker le minimum nécessaire, définir une durée de conservation, permettre la suppression des transcriptions/segments liés à une vidéo et journaliser les accès.
- Ne pas laisser l’IA inventer des propos du formateur : distinguer « contenu de la vidéo » et « explication complémentaire de l’IA ».
- Les quotas gratuits changent et peuvent être suspendus. Le routeur doit reconnaître les erreurs 429/quota, appliquer un backoff, basculer vers un fournisseur autorisé ou expliquer que le service est temporairement indisponible.
- **0 FCFA n’est pas garanti en hébergement.** Firebase affiche des quotas sans frais pour plusieurs services, mais le déploiement Cloud Functions nécessite généralement le plan Blaze avec un compte de facturation. Les quotas gratuits ne sont pas un plafond de dépense. Avant d’activer la facturation, mettre alertes, budgets, limites applicatives et arrêt d’urgence. Tant que ce point n’est pas accepté, développer et tester avec les émulateurs Firebase et les quotas IA gratuits.

## 9. Ordre d’exécution

### Phase A — Préparer les comptes et l’environnement
- Créer Gemini ; Mistral/OpenRouter restent facultatifs. Ne créer/activer Groq que si son tarif affiché est nul pour le modèle et le quota visés.
- Confirmer le projet Firebase réellement associé au dépôt.
- Vérifier Storage, Firestore Rules, Auth, App Check et région.
- Configurer les secrets uniquement en local/Secret Manager.

**Critère de sortie :** appel de test Gemini depuis un script backend local, sans clé dans le navigateur ni dans Git.

### Phase B — Fondations backend
- Ajouter la configuration Firebase Functions v2 et le point d’entrée.
- Ajouter le middleware de vérification Auth/App Check et les validateurs.
- Ajouter le routeur IA avec timeouts, retry borné, gestion 429 et journalisation.
- Ajouter quotas et limites de taille/durée.

**Critère de sortie :** endpoint de test authentifié et testable avec l’émulateur.

### Phase C — Vidéo multimodale MVP
- Créer le job Firestore et le worker.
- Analyser une vidéo courte avec Gemini (audio + frames).
- Sauvegarder résumé, chapitres et timecodes.
- Ajouter transcription Groq en option si la sortie native Gemini est insuffisante.

**Critère de sortie :** une vidéo testée de bout en bout et réanalysée une seule fois par version.

### Phase D — Assistant RAG et UI
- Indexer les segments horodatés.
- Ajouter `askVideoQuestion` et les citations temporelles.
- Intégrer le panneau Assistant dans le lecteur de cours existant.
- Ajouter résumé, transcription et chapitres.

**Critère de sortie :** 10 questions de test dont les réponses renvoient à des timecodes corrects.

### Phase E — Quiz, pilote et mise en production
- Générer des quiz avec validation de structure et correction.
- Tester en français, anglais et langues utiles au public ciblé ; vérifier particulièrement les accents et termes locaux.
- Tester les erreurs quota, vidéos invalides, accès non autorisés et suppression.
- Faire un pilote avec un petit groupe de formateurs/apprenants.
- N’activer la facturation qu’après estimation documentée et accord explicite.

## 10. Checklist de validation avant production

- [ ] Aucun secret dans le code client, le dépôt ou les logs.
- [ ] Vérification Auth + droits au cours + App Check.
- [ ] Règles Firestore/Storage revues et testées avec Emulator Suite.
- [ ] Quotas par utilisateur et par vidéo.
- [ ] Traitement idempotent par `videoId + videoVersion`.
- [ ] Timecodes validés sur un échantillon réel.
- [ ] Les réponses indiquent « introuvable dans la vidéo » si le contexte manque.
- [ ] Procédure de suppression des données IA documentée.
- [ ] Budgets/alertes/arrêt d’urgence configurés avant tout plan de facturation.
- [ ] Tests de charge et de coût sur des vidéos représentatives.

## 11. Références officielles consultées

- Gemini API pricing : https://ai.google.dev/gemini-api/docs/pricing
- Gemini video understanding : https://ai.google.dev/gemini-api/docs/video-understanding
- Groq Speech-to-Text : https://console.groq.com/docs/speech-to-text
- Groq rate limits : https://console.groq.com/docs/rate-limits
- Mistral API rate limits : https://help.mistral.ai/en/articles/698531-why-am-i-hitting-api-rate-limits-and-how-do-i-increase-them
- OpenRouter pricing : https://openrouter.ai/pricing
- Firebase pricing : https://firebase.google.com/pricing
- Firebase Functions secrets : https://firebase.google.com/docs/functions/config-env
- Firebase App Check : https://firebase.google.com/docs/app-check
- Firebase video analysis with Gemini : https://firebase.google.com/docs/ai-logic/analyze-video
