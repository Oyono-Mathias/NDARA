import * as tus from 'tus-js-client';
import { auth } from '../firebase';

export async function uploadVideoToBunny(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ videoId: string, iframeUrl: string }> {
  // 1. Get Auth Token
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Non authentifié");

  // 2. Call backend to create video and get TUS signature
  let data;
  try {
    const res = await fetch('/api/video/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: file.name })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server API Create Video error:", res.status, errorText);
      throw new Error(`Erreur de création vidéo: ${res.status} - ${errorText}`);
    }
    data = await res.json();
  } catch (err) {
    console.error("API Create Video failed:", err);
    throw new Error("Erreur de création de la vidéo sur Bunny Stream. Vérifiez la configuration.");
  }

  const { videoId, libraryId, signature, expireTime } = data;

  // 3. Upload using TUS
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: expireTime.toString(),
        VideoId: videoId,
        LibraryId: libraryId,
      },
      metadata: {
        filetype: file.type,
        title: file.name,
        collection: ""
      },
      onError: function (error) {
        console.error("Bunny TUS Upload failed:", error);
        reject(error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = (bytesUploaded / bytesTotal) * 100;
        onProgress(Math.round(percentage));
      },
      onSuccess: function () {
        resolve({
          videoId,
          iframeUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
        });
      }
    });

    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    }).catch(reject);
  });
}
