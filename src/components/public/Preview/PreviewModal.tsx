/**
 * @file PreviewModal.tsx
 * @description Premium preview modal with glassmorphism, backdrop blur,
 *              device switching, and Framer Motion animations.
 *
 * @architecture Orchestration component — composes PreviewFrame,
 *              DeviceSwitcher, and usePreviewModal hook.
 *
 * @usage
 *   <PreviewModal
 *     open={open}
 *     onClose={close}
 *     title="Marketplace Preview"
 *     previewUrl="https://app.ndara.africa/preview/marketplace"
 *     description="Interactive preview of the NDARA marketplace"
 *   />
 */

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PreviewFrame } from "./PreviewFrame";
import { DeviceSwitcher } from "./DeviceSwitcher";
import { usePreviewModal } from "./usePreviewModal";
import {
  type PreviewModalProps,
  type DeviceType,
  DEVICE_DIMENSIONS,
} from "./types";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const overlayVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: [0.55, 0, 0.67, 0.19],
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: {
      duration: 0.2,
      ease: [0.55, 0, 0.67, 0.19],
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.15, ease: [0.55, 0, 0.67, 0.19] },
  },
};

// ============================================================================
// HEADER BAR COMPONENT
// ============================================================================

function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2
          className="text-lg sm:text-xl font-bold text-white truncate"
          id="preview-modal-title"
        >
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Close preview modal"
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#111827] border border-[#1f2937] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#374151] transition-all min-w-[44px] min-h-[44px] sm:min-h-auto"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// PREVIEW CONTAINER WITH DEVICE TRANSITION
// ============================================================================

function PreviewContainer({
  device,
  url,
  title,
  allowDeviceSwitch,
  onDeviceChange,
}: {
  device: DeviceType;
  url: string;
  title: string;
  allowDeviceSwitch?: boolean;
  onDeviceChange: (device: DeviceType) => void;
}) {
  const dimensions = DEVICE_DIMENSIONS[device];
  const isMobile = device === "mobile";
  const isTablet = device === "tablet";

  // Mobile: fullscreen, no device chrome
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {allowDeviceSwitch && (
          <div className="flex justify-center mb-3">
            <DeviceSwitcher current={device} onChange={onDeviceChange} />
          </div>
        )}
        <motion.div
          layout
          className="flex-1 min-h-0 rounded-2xl overflow-hidden"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
          <PreviewFrame url={url} title={title} />
        </motion.div>
      </div>
    );
  }

  // Tablet / Desktop: contained preview with device chrome
  return (
    <div className="flex flex-col gap-4 items-center">
      {allowDeviceSwitch && (
        <motion.div variants={contentVariants} custom={0}>
          <DeviceSwitcher current={device} onChange={onDeviceChange} />
        </motion.div>
      )}

      <motion.div
        layout
        className="w-full max-w-full"
        style={{
          maxWidth: isTablet
            ? `${dimensions.width}px`
            : `${dimensions.width}px`,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
      >
        {/* Device frame for tablet */}
        {isTablet && (
          <div className="relative bg-[#1f2937] rounded-[24px] p-3 border border-[#374151] shadow-2xl">
            <div className="absolute top-1/2 -left-1 w-1 h-12 bg-[#374151] rounded-r-md -translate-y-1/2" />
            <div className="absolute top-1/2 -right-1 w-1 h-12 bg-[#374151] rounded-l-md -translate-y-1/2" />
            <motion.div
              layout
              className="rounded-[20px] overflow-hidden"
              style={{
                aspectRatio: `${dimensions.width} / ${dimensions.height}`,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            >
              <PreviewFrame url={url} title={title} />
            </motion.div>
          </div>
        )}

        {/* Desktop: clean frame */}
        {!isTablet && (
          <motion.div
            layout
            className="w-full rounded-xl overflow-hidden border border-[#1f2937] shadow-2xl"
            style={{
              aspectRatio: `${dimensions.width} / ${dimensions.height}`,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          >
            <PreviewFrame url={url} title={title} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW MODAL COMPONENT
// ============================================================================

export function PreviewModal({
  open,
  onClose,
  title,
  previewUrl,
  description,
  initialDevice = "desktop",
  allowDeviceSwitch = true,
}: PreviewModalProps) {
  const { modalRef, handleOverlayClick, handleClose, isMounted } =
    usePreviewModal(open, onClose);

  const [device, setDevice] = useState<DeviceType>(initialDevice);

  // Reset device when modal opens
  useEffect(() => {
    if (open) {
      setDevice(initialDevice);
    }
  }, [open, initialDevice]);

  // Don't render until mounted (lazy mount for performance)
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          aria-describedby={description ? "preview-modal-desc" : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onClick={handleOverlayClick}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0)",
          }}
        >
          {/* Backdrop overlay */}
          <motion.div
            className="absolute inset-0 bg-[#0b0f19]/80"
            variants={overlayVariants}
          />

          {/* Modal panel */}
          <motion.div
            className="relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-[#111827] border border-[#1f2937] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                "0 0 60px rgba(16, 185, 129, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Subtle emerald glow at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {/* Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-[#1f2937]">
              <ModalHeader
                title={title}
                description={description}
                onClose={handleClose}
              />
            </div>

            {/* Preview content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
              <PreviewContainer
                device={device}
                url={previewUrl}
                title={title}
                allowDeviceSwitch={allowDeviceSwitch}
                onDeviceChange={setDevice}
              />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-[#1f2937] flex items-center justify-between bg-[#0b0f19]/50">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live preview
              </div>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#1f2937] hover:bg-[#374151] rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-h-auto"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PreviewModal;
