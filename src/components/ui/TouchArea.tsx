import React from 'react';
import { classNames } from '../../lib/utils';

export interface TouchAreaProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * Garantit une zone tactile minimale de 44x44px.
 * Si onClick est fourni, effectue un rendu sémantique <button>.
 */
export const TouchArea = React.forwardRef<HTMLElement, TouchAreaProps>(
  ({ children, onClick, disabled, className, 'aria-label': ariaLabel, ...props }, ref) => {
    const baseClasses = "min-w-[44px] min-h-[44px] inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg";
    
    if (onClick) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          className={classNames(baseClasses, "cursor-pointer active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none", className)}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={classNames(baseClasses, className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }
);
TouchArea.displayName = "TouchArea";
