import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check, ChevronDown } from 'lucide-react';
import { VideoQuality, StreamSource } from '../../services/videoService';

interface VideoQualitySelectorProps {
  availableSources: StreamSource[];
  currentQuality: VideoQuality;
  onSelectQuality: (quality: VideoQuality) => void;
  disabled?: boolean;
}

export const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
  availableSources,
  currentQuality,
  onSelectQuality,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Extract qualities (Auto is always first, then by resolution descending typically)
  const qualities: VideoQuality[] = ['Auto'];
  
  // Sort sources basically, assuming labels like '1080p', '720p'
  const sortedSources = [...availableSources].sort((a, b) => {
    const aVal = parseInt(a.quality.replace('p', '')) || 0;
    const bVal = parseInt(b.quality.replace('p', '')) || 0;
    return bVal - aVal;
  });

  sortedSources.forEach(s => {
    if (s.quality !== 'Auto' && !qualities.includes(s.quality)) {
      qualities.push(s.quality);
    }
  });

  const handleSelect = (quality: VideoQuality) => {
    onSelectQuality(quality);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors backdrop-blur-sm min-h-[44px]"
        aria-label="Sélectionner la qualité vidéo"
        aria-expanded={isOpen}
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-bold uppercase">{currentQuality}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex flex-col py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
              Qualité vidéo
            </div>
            {qualities.map((quality) => (
              <button
                key={quality}
                onClick={() => handleSelect(quality)}
                className={`
                  flex items-center justify-between px-4 py-3 min-h-[44px] text-left transition-colors
                  ${currentQuality === quality 
                    ? 'text-indigo-400 bg-indigo-900/20 font-bold' 
                    : 'text-gray-200 hover:bg-gray-800'
                  }
                `}
              >
                <span>{quality}</span>
                {currentQuality === quality && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
