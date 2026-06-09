/**
 * @file PreviewFrame.tsx
 * @description Sandboxed iframe wrapper with loading states,
 *              skeleton loaders, error handling, and lazy loading.
 * @architecture Isolated responsibility — only handles iframe lifecycle
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PreviewFrameProps } from "./types";

// ============================================================================
// SKELETON LOADER COMPONENT
// ============================================================================

function SkeletonLoader() {
  return (
    <div className="absolute inset-0 bg-[#111827] rounded-xl overflow-hidden">
      {/* Top bar skeleton */}
      <div className="h-8 bg-[#1f2937] flex items-center px-3 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#374151]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#374151]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#374151]" />
        </div>
        <div className="flex-1 h-4 bg-[#374151] rounded-md mx-4" />
      </div>
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-24 bg-[#1f2937] rounded-lg animate-pulse" />
        <div className="flex gap-3">
          <div className="flex-1 h-4 bg-[#1f2937] rounded animate-pulse" />
          <div className="w-20 h-4 bg-[#1f2937] rounded animate-pulse" />
        </div>
        <div className="h-32 bg-[#1f2937] rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-[#1f2937] rounded animate-pulse" />
          <div className="flex-1 h-8 bg-[#1f2937] rounded animate-pulse" />
        </div>
        <div className="h-4 bg-[#1f2937] rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
}

// ============================================================================
// ERROR FALLBACK COMPONENT
// ============================================================================

function ErrorFallback({
  onRetry,
  title,
}: {
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="absolute inset-0 bg-[#111827] rounded-xl flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white mb-1">
          Impossible de charger l'aperçu
        </p>
        <p className="text-xs text-gray-500 max-w-xs">
          La prévisualisation de &quot;{title}&quot; n'est pas disponible pour
          le moment.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}

// ============================================================================
// BROWSER CHROME COMPONENT
// ============================================================================

function BrowserChrome({ title }: { title: string }) {
  return (
    <div className="h-8 bg-[#1f2937] border-b border-[#374151] flex items-center px-3 gap-3 flex-shrink-0 rounded-t-xl">
      {/* Window controls */}
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
      </div>
      {/* URL bar */}
      <div className="flex-1 h-5 bg-[#111827] rounded-md flex items-center px-2">
        <svg
          className="w-3 h-3 text-emerald-500 mr-1.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <span className="text-[10px] text-gray-500 truncate">
          app.ndara.africa/preview/{title.toLowerCase().replace(/\s+/g, "-")}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW FRAME COMPONENT
// ============================================================================

export function PreviewFrame({
  url,
  title,
  loading = false,
  onError,
  onLoaded,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(false);
    onLoaded?.();
  }, [onLoaded]);

  const handleIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
    onError?.(new Error("Failed to load iframe content"));
  }, [onError]);

  const handleRetry = useCallback(() => {
    setIframeError(false);
    setIframeLoading(true);
    setRetryKey((prev) => prev + 1);
  }, []);

  // Reset loading state when URL changes
  useEffect(() => {
    setIframeLoading(true);
    setIframeError(false);
  }, [url, retryKey]);

  // Fallback: force hide skeleton after timeout
  useEffect(() => {
    if (iframeLoading) {
      const timer = setTimeout(() => {
        setIframeLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [iframeLoading]);

  return (
    <div className="relative flex flex-col w-full h-full bg-[#0b0f19] rounded-xl overflow-hidden border border-[#1f2937] shadow-2xl">
      <BrowserChrome title={title} />

      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Skeleton loader */}
          {(loading || iframeLoading) && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10"
            >
              <SkeletonLoader />
            </motion.div>
          )}

          {/* Error fallback */}
          {iframeError && !iframeLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 z-20"
            >
              <ErrorFallback onRetry={handleRetry} title={title} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iframe */}
        <iframe
          key={retryKey}
          ref={iframeRef}
          src={url}
          title={`Preview: ${title}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="w-full h-full bg-[#0b0f19]"
          style={{
            border: "none",
            willChange: "opacity",
          }}
        />
      </div>
    </div>
  );
}

export default PreviewFrame;
