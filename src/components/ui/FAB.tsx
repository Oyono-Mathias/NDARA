import React from 'react';
import { classNames } from '../../lib/utils';

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FAB: React.FC<FABProps> = ({ icon, label, position = 'bottom-right', className, disabled, ...props }) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2'
  };

  return (
    <button
      disabled={disabled}
      className={classNames(
        "fixed z-40 flex items-center justify-center min-w-[56px] min-h-[56px] rounded-2xl bg-blue-600 text-white shadow-lg transition-all active:scale-95 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none",
        positions[position],
        label ? "px-6" : "px-4",
        className
      )}
      {...props}
    >
      <span className={classNames("flex items-center justify-center", label ? "mr-2" : "")}>{icon}</span>
      {label && <span className="font-semibold">{label}</span>}
    </button>
  );
};
