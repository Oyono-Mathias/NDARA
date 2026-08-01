import { logger } from '../lib/logger';
import { getAuth } from 'firebase/auth';

/**
 * Uploads a file via backend proxy, bypassing client-side CORS issues, and reports progress.
 * Uses chunked upload to bypass 413 Payload Too Large limits.
 */
export const uploadToR2 = async (
  file: File,
  bucketFolder: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('Non autorisé');
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
  const contentType = file.type || 'application/octet-stream';
  
  try {
    // 1. Initialize upload session
    const initRes = await fetch(`/api/storage/multipart/start?fileName=${encodeURIComponent(safeFileName)}&folder=${encodeURIComponent(bucketFolder)}&contentType=${encodeURIComponent(contentType)}`, {
      method: "POST",
      credentials: "include",
        
      
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!initRes.ok) {
      const errorText = await initRes.text(); throw new Error(`Erreur d.initialisation de l.upload: ${initRes.status} - ${errorText}`);
    }
    
    const initText = await initRes.text();
    let initData;
    try {
      initData = JSON.parse(initText);
    } catch(e) {
      if (initText.includes("<!doctype html>") || initText.includes("<html")) {
        throw new Error("Upload intercepté par le proxy. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
      throw new Error("Réponse serveur invalide (non-JSON).");
    }
    const { uploadId } = initData;

    const chunkSize = 1024 * 1024; // 1MB chunks to bypass NGINX limits safely
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const chunkRes = await fetch(`/api/storage/multipart/${uploadId}/chunk/${i}`, {
        method: "PUT",
      credentials: "include",
        
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        },
        body: chunk
      });
      
      if (!chunkRes.ok) {
         throw new Error(`Upload failed at chunk ${i + 1}/${totalChunks}`);
      }

      onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
    }

    // 3. Finalize upload
    const finishRes = await fetch(`/api/storage/multipart/${uploadId}/finish`, {
      method: "POST",
      credentials: "include",
        
      
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!finishRes.ok) {
      const finishErrorText = await finishRes.text(); throw new Error(`Erreur lors de la finalisation: ${finishRes.status} - ${finishErrorText}`);
    }

    const finishText = await finishRes.text();
    let finishData;
    try {
      finishData = JSON.parse(finishText);
    } catch(e) {
      if (finishText.includes("<!doctype html>") || finishText.includes("<html")) {
        throw new Error("Upload intercepté par le proxy. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
      throw new Error("Réponse serveur invalide (non-JSON).");
    }
    const { publicUrl } = finishData;
    
    // If it returned a dummy image/video, log a warning but still return it so the UI doesn't hang
    if (publicUrl.includes("dummyimage.com") || publicUrl.includes("commondatastorage.googleapis.com") || publicUrl.includes("test-streams.mux.dev")) {
      throw new Error("L'upload a échoué : le serveur de stockage n'est pas configuré correctement.");
      // console.warn("Backend returned dummy URL because Storage is not configured properly. Proceeding with dummy URL.");
    }
    
    return publicUrl;
  } catch (backendError) {
    // logger.error("Backend upload completely failed:", backendError);
    throw backendError;
  }
};
