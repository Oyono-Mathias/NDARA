import React, { useState, useRef, useEffect } from 'react';
import { Currency } from '../../services/currencyService';
import { ChevronDown, Globe } from 'lucide-react';

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  onSelect: (currency: Currency) => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedCurrency,
  onSelect,
  disabled = false,
  isLoading = false,
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled && !isLoading && currencies.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto min-w-[200px]" ref={dropdownRef}>
      {error && (
        <div 
          className="text-red-600 dark:text-red-400 text-xs mb-1.5 font-medium px-1 truncate"
          role="alert"
        >
          {error}
        </div>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || isLoading || currencies.length === 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sélectionner une devise"
        className="w-full min-h-[44px] px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          
          {isLoading ? (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Chargement...</span>
          ) : selectedCurrency ? (
            <div className="flex items-baseline gap-2 truncate">
              <span className="font-bold text-gray-900 dark:text-white shrink-0">
                {selectedCurrency.code}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
                {selectedCurrency.name}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Aucune devise
            </span>
          )}
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true" 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 right-0 sm:right-auto sm:w-64 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden"
          role="listbox"
          tabIndex={-1}
        >
          <ul className="flex flex-col max-h-64 overflow-y-auto overscroll-contain py-1.5">
            {currencies.map((currency) => {
              const isSelected = selectedCurrency?.code === currency.code;
              return (
                <li key={currency.code}>
                  <button
                    type="button"
                    className={`w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between text-left transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleSelect(currency)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="font-bold text-sm truncate">
                        {currency.code}
                      </span>
                      <span className="text-xs opacity-70 truncate">
                        {currency.name}
                      </span>
                    </div>
                    <span className="font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs shrink-0">
                      {currency.symbol}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
