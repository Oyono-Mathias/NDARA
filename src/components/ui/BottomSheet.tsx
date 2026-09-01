import React, { useEffect, useState } from 'react';
import { classNames } from '../../lib/utils';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setMounted(false), 300); // Wait for transition
      document.body.style.overflow = 'unset';
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen && !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby={title ? "bottom-sheet-title" : undefined}>
      <div 
        className={classNames("absolute inset-0 bg-black/50 transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div 
        className={classNames(
          "relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 safe-area-bottom",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: '90vh' }}
      >
        <div className="w-full flex items-center justify-center p-3 shrink-0" onClick={onClose} aria-hidden="true">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer" />
        </div>
        {title && (
          <h2 id="bottom-sheet-title" className="px-6 pb-2 text-xl font-bold text-gray-900 text-center shrink-0">
            {title}
          </h2>
        )}
        <div className="px-6 pb-6 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
