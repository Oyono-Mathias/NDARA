import { useCallback } from 'react';

// SECURITY WARNING:
// NEVER store sensitive data like PINs, passwords, tokens, API secrets, 
// KYC docs, or financial data using this hook.
// This is strictly for non-sensitive offline preferences or caches.

export const useOfflineStorage = <T>(key: string, initialValue: T) => {
  const getItem = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading offline storage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const setItem = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(getItem()) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting offline storage key "${key}" (Quota exceeded?):`, error);
    }
  }, [key, getItem]);

  const removeItem = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing offline storage key "${key}":`, error);
    }
  }, [key]);

  return { getItem, setItem, removeItem };
};
