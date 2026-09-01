import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Backend Node.js préparatoire.
 * Séparation stricte : aucun secret financier ou clé Firebase privée n'est exposé au frontend.
 * 
 * L'architecture repose sur Vite (dev) et potentiellement un hébergement statique (Firebase) en production.
 * Ce point d'entrée est un serveur Node.js natif, minimaliste, maintenu pour d'éventuelles
 * tâches d'infrastructure natives ou webhooks, évitant la dépendance à Express.
 */

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // En production simulée, on pourrait servir les fichiers statiques de dist/
  // Cependant, en l'absence de framework, on retourne simplement un message ou le point d'entrée
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found - Point d\'entrée serveur préparatoire');
});

// Démarrage manuel si exécuté directement (non automatique dans le flow standard)
if (process.env.START_SERVER === 'true') {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur natif préparatoire démarré sur http://0.0.0.0:${PORT}`);
  });
}

export default server;
