export type VideoQuality = 'Auto' | '360p' | '480p' | '720p' | '1080p';
export type VideoAccessStatus = 'granted' | 'denied' | 'payment_required' | 'backend_not_connected';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: number; // en secondes
  thumbnailUrl?: string;
  isMock: boolean;
}

export interface StreamSource {
  quality: VideoQuality;
  url: string;
  type: string; // ex: 'application/x-mpegURL' (HLS) ou 'video/mp4'
  bitrate?: number;
}

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface VideoTranscript {
  language: string;
  segments: TranscriptSegment[];
  isMock: boolean;
}

export interface VideoAccessState {
  status: VideoAccessStatus;
  reason?: string;
  isMock: boolean;
}

export interface VideoResponse<T> {
  data: T;
  isMock: boolean;
}

// Données Mockées
const MOCK_METADATA: Record<string, VideoMetadata> = {
  'vid-123': {
    id: 'vid-123',
    title: 'Introduction au Développement Web',
    description: 'Découvrez les bases du web : HTML, CSS et JavaScript.',
    duration: 120, // 2 minutes pour le test
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    isMock: true
  },
  'vid-locked': {
    id: 'vid-locked',
    title: 'Architecture Avancée',
    description: 'Module premium nécessitant un achat.',
    duration: 3600,
    isMock: true
  }
};

const MOCK_SOURCES: Record<string, StreamSource[]> = {
  'vid-123': [
    { quality: 'Auto', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video/mp4' },
    { quality: '1080p', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video/mp4', bitrate: 4500000 },
    { quality: '720p', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video/mp4', bitrate: 2500000 },
    { quality: '480p', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video/mp4', bitrate: 1000000 },
    { quality: '360p', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video/mp4', bitrate: 500000 }
  ]
};

const MOCK_TRANSCRIPTS: Record<string, VideoTranscript> = {
  'vid-123': {
    language: 'fr',
    isMock: true,
    segments: [
      { id: 't1', startTime: 0, endTime: 3, text: 'Bienvenue dans cette nouvelle vidéo.' },
      { id: 't2', startTime: 3.5, endTime: 7, text: 'Aujourd\'hui, nous allons apprendre les bases du développement.' },
      { id: 't3', startTime: 7.5, endTime: 12, text: 'Tout d\'abord, regardons comment fonctionne un navigateur web.' },
      { id: 't4', startTime: 12.5, endTime: 20, text: 'Le navigateur lit le code HTML et le transforme en interface graphique.' }
    ]
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service de gestion de la vidéo (Métadonnées, Streaming, Accès).
 * ZERO TRUST: Le frontend simule ici un appel réseau. Dans l\'architecture
 * finale, c\'est le backend qui validera l\'accès, génèrera des tokens HLS
 * signés et vérifiera les droits.
 */
export class VideoService {
  /**
   * Vérifie si l\'utilisateur a le droit de lire la vidéo.
   */
  static async checkVideoAccess(videoId: string): Promise<VideoResponse<VideoAccessState>> {
    await delay(600);

    if (videoId === 'vid-locked') {
      return {
        data: {
          status: 'payment_required',
          reason: 'Vous devez acheter ce cours pour visionner cette vidéo.',
          isMock: true
        },
        isMock: true
      };
    }

    if (!MOCK_METADATA[videoId]) {
      return {
        data: {
          status: 'denied',
          reason: 'Vidéo introuvable.',
          isMock: true
        },
        isMock: true
      };
    }

    return {
      data: {
        status: 'granted',
        isMock: true
      },
      isMock: true
    };
  }

  static async getVideoMetadata(videoId: string): Promise<VideoResponse<VideoMetadata>> {
    await delay(400);
    const metadata = MOCK_METADATA[videoId];
    if (!metadata) throw new Error('Vidéo introuvable');
    return { data: metadata, isMock: true };
  }

  static async getVideoSources(videoId: string): Promise<VideoResponse<StreamSource[]>> {
    await delay(500);
    const sources = MOCK_SOURCES[videoId];
    if (!sources) throw new Error('Sources introuvables');
    return { data: sources, isMock: true };
  }

  static async getVideoTranscript(videoId: string): Promise<VideoResponse<VideoTranscript>> {
    await delay(300);
    const transcript = MOCK_TRANSCRIPTS[videoId];
    if (!transcript) throw new Error('Transcription indisponible');
    return { data: transcript, isMock: true };
  }

  /**
   * (Optionnel) Sauvegarde la progression de visionnage.
   * ZERO TRUST: Le frontend informe, le backend valide et persiste.
   */
  static async saveProgress(videoId: string, currentTime: number): Promise<void> {
    // Cette méthode est appelée discrètement en arrière-plan
    // Dans l'implémentation finale, elle interrogera une Cloud Function.
    console.debug(`[Mock] Progression sauvegardée pour ${videoId} : ${currentTime}s`);
  }
}
