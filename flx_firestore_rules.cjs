const fs = require('fs');
const path = require('path');

/**
 * flx_firestore_rules.cjs
 * 
 * Script d'analyse statique basique pour les règles de sécurité Firestore.
 * Conçu pour vérifier la présence des protections essentielles (Deny by default, 
 * vérification de rôle, protection des écritures).
 */

function runAudit() {
  console.log("🛡️ Démarrage de l'audit statique des règles Firestore...");
  
  const rulesPath = path.join(__dirname, 'firestore.rules');
  
  if (!fs.existsSync(rulesPath)) {
    console.error("❌ ERREUR: Fichier firestore.rules introuvable.");
    process.exit(1);
  }

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  let errors = 0;

  // 1. Vérifier la présence du Deny by Default
  if (!rulesContent.includes("match /{document=**} {") || !rulesContent.includes("allow read, write: if false;")) {
    console.error("❌ ERREUR: 'Deny by default' manquant. Assurez-vous d'avoir 'match /{document=**} { allow read, write: if false; }' au début.");
    errors++;
  } else {
    console.log("✅ 'Deny by default' détecté.");
  }

  // 2. Vérifier la protection de la collection WALLETS (Pas d'update côté client)
  if (rulesContent.includes("match /wallets/{walletId}") && rulesContent.includes("allow update: if true;")) {
    console.error("❌ ERREUR SÉCURITÉ: La collection WALLETS permet une mise à jour ouverte.");
    errors++;
  } else {
    console.log("✅ Collection WALLETS semble protégée contre l'écriture ouverte.");
  }

  // 3. Vérifier la présence de la fonction d'authentification
  if (!rulesContent.includes("function isAuthenticated()")) {
    console.warn("⚠️ ATTENTION: Fonction 'isAuthenticated()' introuvable.");
  }

  // 4. Vérifier la protection des données sensibles de l'utilisateur (rôle)
  if (rulesContent.includes("match /users/{userId}") && !rulesContent.includes("!request.resource.data.keys().hasAny(")) {
    console.warn("⚠️ ATTENTION: La mise à jour des users ne bloque pas explicitement certains champs (comme 'role').");
  } else {
    console.log("✅ Protection des champs sensibles utilisateur (role/pinHash) détectée.");
  }

  if (errors > 0) {
    console.error(`\n❌ Audit échoué avec ${errors} erreur(s) critique(s).`);
    process.exit(1);
  } else {
    console.log("\n✅ Audit réussi. Les règles de base semblent conformes à l'architecture Ndara Afrique.");
  }
}

runAudit();
