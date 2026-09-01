import React, { useState } from 'react';
import { useVideoStreaming } from '../../hooks/useVideoStreaming';
import { VideoQualitySelector } from './VideoQualitySelector';
import { VideoTranscript } from './VideoTranscript';
import { 
  Play, Pause, Loader2, AlertTriangle, 
  RefreshCw, Lock, Subtitles, Volume2, VolumeX, Maximize
} from 'lucide-react';

interface AdaptiveStreamPlayerProps {
  videoId: string;
}

export const AdaptiveStreamPlayer: React.FC<AdaptiveStreamPlayerProps> = ({ videoId }) => {
  const {
    videoRef,
    metadata,
    sources,
    transcript,
    status,
    error,
    accessReason,
    currentTime,
    duration,
    bufferedTime,
    currentQuality,
    play,
    pause,
    seek,
    changeQuality,
    retry,
    videoHandlers
  } = useVideoStreaming(videoId);

  const [showTranscript, setShowTranscript] = useState(false);
  const [muted, setMuted] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const togglePlay = () => {
    if (status === 'playing') pause();
    else play();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById(`video-container-${videoId}`);
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // UI States Handling
  if (status === 'loading') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium">Chargement du lecteur...</p>
      </div>
    );
  }

  if (status === 'access_denied') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-gray-800">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Accès restreint</h3>
        <p className="text-gray-400 text-sm max-w-md">{accessReason}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-gray-800">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
        <p className="text-gray-300 mb-6">{error}</p>
        <button 
          onClick={retry}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  const currentSource = sources.find(s => s.quality === currentQuality) || sources[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      
      {/* Container Principal Vidéo */}
      <div 
        id={`video-container-${videoId}`}
        className="relative w-full bg-black rounded-2xl overflow-hidden shadow-xl group flex flex-col justify-center"
      >
        {/* L'élément Vidéo natif */}
        <video
          ref={videoRef}
          src={currentSource?.url}
          className="w-full aspect-video object-contain"
          playsInline
          {...videoHandlers}
          onClick={togglePlay}
        />

        {/* Overlay Buffering */}
        {status === 'buffering' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        )}

        {/* Overlay Mock Badge */}
        {metadata?.isMock && (
          <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg z-10 pointer-events-none">
            Mode Mock (UI Uniquement)
          </div>
        )}

        {/* Contrôles du lecteur (Android First - Grandes zones de clic) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          
          {/* Barre de progression */}
          <div className="relative w-full h-1.5 sm:h-2 bg-gray-600/50 rounded-full mb-4 cursor-pointer group/progress">
            {/* Buffered */}
            <div 
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full" 
              style={{ width: `${duration ? (bufferedTime / duration) * 100 : 0}%` }} 
            />
            {/* Current */}
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} 
            />
            {/* Input Range invisible au dessus pour l'interaction */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Barre de progression"
              aria-valuenow={currentTime}
              aria-valuemin={0}
              aria-valuemax={duration || 100}
            />
          </div>

          {/* Boutons et Options */}
          <div className="flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-indigo-400 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={status === 'playing' ? 'Mettre en pause' : 'Lire'}
              >
                {status === 'playing' ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <div className="text-white text-xs sm:text-sm font-mono opacity-90 hidden sm:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-indigo-400 transition-colors p-2 hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px]"
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Qualité */}
              {sources.length > 0 && (
                <VideoQualitySelector
                  availableSources={sources}
                  currentQuality={currentQuality}
                  onSelectQuality={changeQuality}
                />
              )}

              {/* Toggle Transcription Mobile */}
              {transcript && (
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className={`
                    p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center
                    ${showTranscript ? 'bg-indigo-600 text-white' : 'bg-black/40 text-white hover:bg-black/60'}
                  `}
                  aria-label="Afficher la transcription"
                  aria-pressed={showTranscript}
                >
                  <Subtitles className="w-5 h-5" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-indigo-400 bg-black/40 hover:bg-black/60 rounded-lg transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Plein écran"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Informations et Transcription (Flex Column - Android First) */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Metadonnées */}
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
            {metadata?.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-words">
            {metadata?.description}
          </p>
        </div>

        {/* Transcription conditionnelle */}
        {showTranscript && transcript && (
          <div className="w-full md:w-1/3 min-w-[300px]">
            <VideoTranscript
              transcript={transcript}
              currentTime={currentTime}
              onSeek={seek}
            />
          </div>
        )}

      </div>
    </div>
  );
};
