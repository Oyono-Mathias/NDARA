import React, { useState } from 'react';
import { classNames } from '../../lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", size = 'md', fallbackText, className, ...props }) => {
  const [error, setError] = useState(false);

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-xl"
  };

  return (
    <div
      className={classNames(
        "relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200",
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-gray-500 uppercase">
          {fallbackText ? fallbackText.slice(0, 2) : <User className="w-1/2 h-1/2 opacity-50" />}
        </div>
      )}
    </div>
  );
};
