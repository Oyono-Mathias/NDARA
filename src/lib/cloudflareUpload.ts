import { auth } from '../firebase';

export async function uploadVideoToCloudflare(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ videoId: string, iframeUrl: string }> {
  // 1. Get Auth Token
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Non authentifié");

  // 2. Call backend to get direct upload URL
  let data;
  try {
    const res = await fetch('/api/video/cloudflare/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: file.name })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server API Create Cloudflare Video error:", res.status, errorText);
      throw new Error(`Erreur de création vidéo CF: ${res.status} - ${errorText}`);
    }
    data = await res.json();
  } catch (err) {
    console.error("API Create CF Video failed:", err);
    throw new Error("Erreur de création de la vidéo sur Cloudflare. Vérifiez la configuration.");
  }

  const { uploadUrl, videoId } = data;

  if (!uploadUrl) {
      throw new Error("Impossible d'obtenir l'URL de téléversement Cloudflare");
  }

  // 3. Upload file directly via HTTP POST to the returned uploadUrl
  // For standard direct upload (not TUS), we can use XMLHttpRequest for progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Enregistrez le domaine client de CF Steam
        const customerCode = import.meta.env.VITE_CLOUDFLARE_CUSTOMER_CODE || "customer-12345";
        resolve({
          videoId,
          iframeUrl: `https://${customerCode}.cloudflarestream.com/${videoId}/iframe`
        });
      } else {
        reject(new Error(`Erreur de téléversement : ${xhr.status} ${xhr.responseText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Erreur de connexion réseau lors du téléversement."));
    });

    xhr.open("POST", uploadUrl, true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    xhr.send(formData);
  });
}
