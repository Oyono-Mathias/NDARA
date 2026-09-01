import React, { useEffect } from 'react';
import { classNames } from '../../lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={title ? "dialog-title" : undefined}>
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
      <div className={classNames("relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200", className)}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          {title && <h2 id="dialog-title" className="text-lg font-bold text-gray-900">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 ml-auto rounded-full hover:bg-gray-100 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
