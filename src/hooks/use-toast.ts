import { useState, useEffect, useCallback } from 'react';

export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: ToastListener[] = [];

const MAX_TOASTS = 3;

const emitChange = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const dismissToast = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
};

export const toast = (t: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { ...t, id };
  
  toasts = [newToast, ...toasts].slice(0, MAX_TOASTS);
  emitChange();

  if (t.duration !== 0) {
    setTimeout(() => {
      dismissToast(id);
    }, t.duration || 3000);
  }
};

export const useToast = () => {
  const [state, setState] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  const toastCallback = useCallback((t: Omit<Toast, 'id'>) => toast(t), []);
  const dismissCallback = useCallback((id: string) => dismissToast(id), []);

  return { toasts: state, toast: toastCallback, dismissToast: dismissCallback };
};
