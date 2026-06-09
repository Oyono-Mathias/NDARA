/**
 * @file usePreviewModal.ts
 * @description Custom hook managing modal lifecycle, focus trap,
 *              keyboard navigation, and escape/close logic.
 * @architecture Extracted logic — keeps components pure
 */

import type React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import type { FocusTrapOptions } from './types';

// ============================================================================
// FOCUS TRAP UTILITIES
// ============================================================================

const FOCUSABLE_SELECTORS = [
  'a[href]:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
    .filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
}

function useFocusTrap(options: FocusTrapOptions): void {
  const { container, enabled = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !container) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusables = getFocusableElements(container);
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    // Focus first focusable element on mount
    requestAnimationFrame(() => {
      firstFocusable?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const currentFocusables = getFocusableElements(container);
      if (currentFocusables.length === 0) return;

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [container, enabled]);
}

// ============================================================================
// KEYBOARD HANDLER
// ============================================================================

function useKeyboardEscape(onEscape: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, enabled]);
}

// ============================================================================
// BODY SCROLL LOCK
// ============================================================================

function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [enabled]);
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UsePreviewModalReturn {
  modalRef: React.RefObject<HTMLDivElement>;
  handleOverlayClick: (e: React.MouseEvent) => void;
  handleClose: () => void;
  isMounted: boolean;
}

export function usePreviewModal(
  open: boolean,
  onClose: () => void
): UsePreviewModalReturn {
  const modalRef = useRef<HTMLDivElement>(null);

  // Use a small delay for lazy mount (performance optimization)
  const [isMounted, setIsMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
    } else {
      // Allow exit animation to complete before unmounting
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Focus trap
  useFocusTrap({
    container: modalRef.current!,
    enabled: open && !!modalRef.current,
  });

  // Escape key
  useKeyboardEscape(onClose, open);

  // Scroll lock
  useScrollLock(open);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the overlay itself, not the modal content
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    modalRef: modalRef as React.RefObject<HTMLDivElement>,
    handleOverlayClick,
    handleClose,
    isMounted,
  };
}

export default usePreviewModal;
