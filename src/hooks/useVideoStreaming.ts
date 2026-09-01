import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  VideoService, 
  VideoMetadata, 
  StreamSource, 
  VideoTranscript, 
  VideoQuality,
  VideoAccessStatus
} from '../services/videoService';

export type VideoPlayerStatus = 
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error'
  | 'access_denied';

export const useVideoStreaming = (videoId: string) => {
  // Video Core Data
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null);
  
  // States
  const [status, setStatus] = useState<VideoPlayerStatus>('idle');
  const [accessStatus, setAccessStatus] = useState<VideoAccessStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessReason, setAccessReason] = useState<string | null>(null);

  // Playback States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('Auto');

  // Video Element Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadVideo = useCallback(async () => {
    if (!videoId) return;

    setStatus('loading');
    setError(null);
    setAccessReason(null);
    
    try {
      // 1. Check access (Zero Trust)
      const accessRes = await VideoService.checkVideoAccess(videoId);
      setAccessStatus(accessRes.data.status);
      
      if (accessRes.data.status !== 'granted') {
        setStatus('access_denied');
        setAccessReason(accessRes.data.reason || 'Accès refusé.');
        return;
      }

      // 2. Fetch metadata, sources and transcript in parallel
      const [metaRes, sourcesRes, transcriptRes] = await Promise.allSettled([
        VideoService.getVideoMetadata(videoId),
        VideoService.getVideoSources(videoId),
        VideoService.getVideoTranscript(videoId)
      ]);

      if (metaRes.status === 'rejected' || sourcesRes.status === 'rejected') {
        throw new Error('Données vidéo indisponibles.');
      }

      setMetadata(metaRes.value.data);
      setSources(sourcesRes.value.data);
      
      if (transcriptRes.status === 'fulfilled') {
        setTranscript(transcriptRes.value.data);
      }

      setStatus('ready');

    } catch (err) {
      setStatus('error');
      setError('Impossible de charger la vidéo. Veuillez vérifier votre connexion.');
    }
  }, [videoId]);

  // Initial load
  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  // Player Actions
  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay policy errors silently or show UI feedback
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeQuality = useCallback((quality: VideoQuality) => {
    if (quality === currentQuality) return;
    
    const source = sources.find(s => s.quality === quality);
    if (!source && quality !== 'Auto') return; // Fallback handled by UI

    setCurrentQuality(quality);
    
    // In a real HLS.js implementation, we would call hls.currentLevel = index
    // Here we simulate the change for a native MP4 player by keeping the current time
    if (videoRef.current) {
      const wasPlaying = !videoRef.current.paused;
      const time = videoRef.current.currentTime;
      
      // The component will re-render with the new source, we just need to restore state
      // (This is a simplified mock approach. Real adaptive streaming doesn't reload the <video> src)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          if (wasPlaying) videoRef.current.play();
        }
      }, 100);
    }
  }, [currentQuality, sources]);

  const retry = useCallback(() => {
    loadVideo();
  }, [loadVideo]);

  const updateProgress = useCallback((time: number) => {
    // This could throttle calls to the backend
    VideoService.saveProgress(videoId, time).catch(() => {});
  }, [videoId]);

  // Video Element Event Handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Save progress every 10 seconds
      if (Math.floor(videoRef.current.currentTime) % 10 === 0) {
        updateProgress(videoRef.current.currentTime);
      }
    }
  }, [updateProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handlePlaying = useCallback(() => setStatus('playing'), []);
  const handlePause = useCallback(() => setStatus('paused'), []);
  const handleEnded = useCallback(() => setStatus('ended'), []);
  const handleWaiting = useCallback(() => setStatus('buffering'), []);
  
  const handleProgress = useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const buffered = videoRef.current.buffered;
      setBufferedTime(buffered.end(buffered.length - 1));
    }
  }, []);

  return {
    videoRef,
    metadata,
    sources,
    transcript,
    status,
    accessStatus,
    error,
    accessReason,
    currentTime,
    duration,
    bufferedTime,
    currentQuality,
    
    // Actions
    play,
    pause,
    seek,
    changeQuality,
    retry,
    
    // Handlers to attach to <video>
    videoHandlers: {
      onTimeUpdate: handleTimeUpdate,
      onLoadedMetadata: handleLoadedMetadata,
      onPlaying: handlePlaying,
      onPause: handlePause,
      onEnded: handleEnded,
      onWaiting: handleWaiting,
      onProgress: handleProgress
    }
  };
};
