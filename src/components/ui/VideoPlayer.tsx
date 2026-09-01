import React, { useRef } from 'react';
import { classNames } from '../../lib/utils';
import { PlayCircle } from 'lucide-react';

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  fallbackMessage?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  className, 
  fallbackMessage = "Votre navigateur ne supporte pas la lecture de vidéos.",
  controls = true,
  ...props 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!src) {
    return (
      <div className={classNames("bg-gray-100 rounded-2xl flex flex-col items-center justify-center aspect-video text-gray-500", className)}>
        <PlayCircle className="w-12 h-12 mb-2 opacity-20" aria-hidden="true" />
        <p className="text-sm font-medium">Vidéo non disponible</p>
      </div>
    );
  }

  return (
    <div className={classNames("relative overflow-hidden rounded-2xl bg-black aspect-video", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={controls}
        className="w-full h-full object-contain"
        playsInline // Important pour mobile/iOS
        {...props}
      >
        <p>{fallbackMessage}</p>
      </video>
    </div>
  );
};
