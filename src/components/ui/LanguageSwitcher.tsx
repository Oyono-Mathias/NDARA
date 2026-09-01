import React from 'react';
import { classNames } from '../../lib/utils';
import { Globe } from 'lucide-react';

export interface LanguageSwitcherProps {
  currentLang?: 'fr' | 'en';
  onChange?: (lang: 'fr' | 'en') => void;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  currentLang = 'fr', 
  onChange,
  className 
}) => {
  const toggleLang = () => {
    if (onChange) {
      onChange(currentLang === 'fr' ? 'en' : 'fr');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={classNames(
        "inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95",
        className
      )}
      aria-label={`Changer la langue. Actuellement ${currentLang.toUpperCase()}`}
    >
      <Globe className="w-5 h-5 mr-2 opacity-70" aria-hidden="true" />
      <span className="uppercase">{currentLang}</span>
    </button>
  );
};
