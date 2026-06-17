"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  provider?: 'bunny' | 'cloudflare'; // 'cloudflare' for CF Stream, 'bunny' (or undefined) for Bunny Stream
  className?: string;
  onEnded?: () => void;
  // Bunny Stream Pull Zone (e.g. vz-xxx.b-cdn.net ou custom domain)
  cdnHostname?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  provider = 'bunny', // Par défaut `bunny` pour des raisons de compatibilité ascendante
  className, 
  onEnded,
  cdnHostname = import.meta.env.VITE_BUNNY_STREAM_CDN_HOSTNAME || "vz-a8b9c7d6.b-cdn.net"
}) => {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-black border border-red-500/20 text-red-500 rounded-2xl ${className || "w-full h-full"}`}>
        <div className="text-4xl mb-4">🔒</div>
        <p className="font-bold text-sm tracking-widest">VIDÉO INVALIDE</p>
        <p className="text-xs text-red-400/60 mt-2">Source introuvable</p>
      </div>
    );
  }

  // ==== CLOUDFLARE STREAM RENDER ====
  // Si le provider est explicitly cloudflare, on render l'iframe optimisée 
  if (provider === 'cloudflare' || src.includes('cloudflarestream.com') || src.includes('/iframe')) {
    return (
      <div className={`relative bg-[#0B0F19] rounded-2xl overflow-hidden ${className || "w-full h-full"}`}>
         <iframe
          src={src} // L'URL d'iframe directe est envoyée du backend
          className="w-full h-full border-none absolute inset-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onLoad={() => setLoading(false)}
        ></iframe>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 border border-[#1E293B] bg-[#0B0F19] pointer-events-none">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-xs text-emerald-500 font-mono tracking-widest uppercase">
              Chargement Cloudflare Stream...
            </p>
          </div>
        )}
      </div>
    );
  }

  // ==== BUNNY STREAM RENDER (Default HLS) ====
  
  // Extraction du videoId
  let videoId = src;
  if (src.includes('/')) {
    try {
      const parts = src.split('/').filter(Boolean);
      videoId = parts[parts.length - 1];
    } catch (e) {
      console.error("Impossible de parser l'ID de la vidéo:", e);
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // URL du flux HLS Bunny Stream
    const hlsUrl = `https://${cdnHostname}/${videoId}/playlist.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Configuration pour la gestion du cache et offline à l'avenir
        maxMaxBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          // Gérer la tentative de reprise
        }
      });
      
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Pour Safari (HLS natif)
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    }
  }, [videoId, cdnHostname]);

  return (
    <div className={`relative bg-[#0B0F19] rounded-2xl overflow-hidden ${className || "w-full h-full"}`}>
      {/* État de chargement CDN en Émeraude */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 border border-[#1E293B] bg-[#0B0F19]">
          <Loader2 className="w-10 h-10 text-[#10B981] animate-spin mb-4" />
          <p className="text-xs text-[#10B981] font-mono tracking-widest uppercase">
            Initialisation du lecteur Natif HLS...
          </p>
        </div>
      )}

      {/* Rendu vidéo natif */}
      <video
        ref={videoRef}
        controls
        playsInline
        onEnded={onEnded}
        onLoadedData={() => setLoading(false)}
        className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        controlsList="nodownload" // Interdire le téléchargement natif du navigateur
      />
    </div>
  );
};
