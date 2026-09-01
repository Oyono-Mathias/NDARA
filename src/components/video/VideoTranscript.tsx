import React, { useRef, useEffect } from 'react';
import { VideoTranscript as VideoTranscriptType } from '../../services/videoService';
import { AlignLeft, AlertCircle } from 'lucide-react';

interface VideoTranscriptProps {
  transcript: VideoTranscriptType | null;
  currentTime: number;
  onSeek: (time: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const VideoTranscript: React.FC<VideoTranscriptProps> = ({
  transcript,
  currentTime,
  onSeek,
  isLoading,
  error
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime]); // Triggers when time updates, though might be jumpy. We'll rely on activeSegmentRef changes.

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl animate-pulse">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (!transcript || transcript.segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
        <AlignLeft className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Aucune transcription disponible.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[400px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <AlignLeft className="w-4 h-4 text-indigo-500" />
          Transcription
        </h3>
        {transcript.isMock && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
            Mock
          </span>
        )}
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 scroll-smooth"
        role="region"
        aria-label="Transcription de la vidéo"
      >
        {transcript.segments.map((segment) => {
          const isActive = currentTime >= segment.startTime && currentTime < segment.endTime;
          
          return (
            <button
              key={segment.id}
              ref={isActive ? activeSegmentRef : null}
              onClick={() => onSeek(segment.startTime)}
              className={`
                w-full text-left p-3 rounded-xl transition-all mb-1 min-h-[44px]
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                ${isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 font-medium' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }
              `}
              aria-current={isActive ? 'true' : 'false'}
            >
              <div className="flex items-start gap-3">
                <span className={`
                  text-xs font-mono mt-0.5 shrink-0
                  ${isActive ? 'text-indigo-500 dark:text-indigo-400 font-bold' : 'text-gray-400 dark:text-gray-500'}
                `}>
                  {formatTime(segment.startTime)}
                </span>
                <p className="text-sm leading-relaxed break-words">
                  {segment.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
