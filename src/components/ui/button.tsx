import React, { ButtonHTMLAttributes } from 'react';
import { classNames } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
      outline: "border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900 focus:ring-gray-500",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };

    const sizes = {
      sm: "min-h-[36px] px-3 text-sm rounded-lg",
      md: "min-h-[44px] px-4 text-base rounded-xl", // Minimum 44px for Android
      lg: "min-h-[52px] px-6 text-lg rounded-xl",
      icon: "min-h-[44px] min-w-[44px] p-2 rounded-xl"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classNames(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? "w-full" : "",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
