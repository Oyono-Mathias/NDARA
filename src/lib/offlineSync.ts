export async function downloadVideoForOffline(
  videoId: string, 
  cdnHostname: string, 
  onProgress?: (progress: number) => void
) {
  try {
    const baseUrl = `https://${cdnHostname}/${videoId}`;
    
    // 1. Fetch master playlist
    const masterPlaylistUrl = `${baseUrl}/playlist.m3u8`;
    const masterRes = await fetch(masterPlaylistUrl);
    
    if (!masterRes.ok) {
        throw new Error("Impossible de récupérer la playlist principale");
    }
    
    const masterText = await masterRes.text();
    
    // Simple naive parser for the best or first playlist (e.g. 720p or just the first one)
    const lines = masterText.split('\n');
    let targetPlaylist = '';
    
    // Recherche de la version 720p, sinon la première disponible
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXT-X-STREAM-INF')) {
            // Regarde s'il y a 720p 
            if (line.includes('RESOLUTION=1280x720') || line.includes('RESOLUTION=1920x1080')) {
                 targetPlaylist = lines[i+1].trim();
                 break;
            } else if (!targetPlaylist) {
                 // Sauvegarde de secours
                 targetPlaylist = lines[i+1].trim();
            }
        }
    }
    
    if (!targetPlaylist) {
      // If it's not a master playlist, maybe it's directly a media playlist.
      targetPlaylist = 'playlist.m3u8';
    }

    // Le fichier .m3u8 de la résolution qu'on a sélectionnée
    const mediaPlaylistUrl = targetPlaylist.startsWith('http') 
        ? targetPlaylist 
        : `${baseUrl}/${targetPlaylist}`;

    // On s'assure que le SW met bien en cache ce fichier playlist spécifique
    await fetch(mediaPlaylistUrl).catch(() => {});

    // 2. Fetch media playlist
    const mediaRes = await fetch(mediaPlaylistUrl);
    if (!mediaRes.ok) throw new Error("Impossible de lire le stream vidéo");
    
    const mediaText = await mediaRes.text();

    // Récupérer le dossier de base pour les URLs relatives des segments
    const urlDir = mediaPlaylistUrl.substring(0, mediaPlaylistUrl.lastIndexOf('/') + 1);

    // 3. Extract all segment lengths and URLs
    const mediaLines = mediaText.split('\n');
    const segments: string[] = [];
    
    for (let i = 0; i < mediaLines.length; i++) {
        const line = mediaLines[i].trim();
        if (line && !line.startsWith('#')) {
             const segmentUrl = line.startsWith('http') ? line : `${urlDir}${line}`;
             segments.push(segmentUrl);
        }
    }

    if (segments.length === 0) {
        throw new Error("Aucun segment vidéo trouvé");
    }

    // 4. Fetch all segments to cache them
    let completed = 0;
    // On télécharge par lots (batch) de 4 pour ne pas surcharger la bande passante ni bloquer le navigateur
    const BATCH_SIZE = 4;
    
    for (let i = 0; i < segments.length; i += BATCH_SIZE) {
        const batch = segments.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (url) => {
            try {
                // Ce fetch passera par notre Service Worker (grâce à "NetworkFirst" ou "CacheFirst" sur b-cdn.net)
                // et sera stocké silencieusement.
                await fetch(url); 
            } catch (e) {
                console.error("Erreur téléchargement segment:", url, e);
            }
        }));
        
        completed += batch.length;
        if (onProgress) {
            onProgress(Math.floor((completed / segments.length) * 100));
        }
    }
    
    if (onProgress) {
        onProgress(100);
    }
    
    return true;
  } catch (error) {
    console.error("Le téléchargement de la vidéo a échoué", error);
    throw error;
  }
}
