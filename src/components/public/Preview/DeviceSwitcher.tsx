/**
 * @file DeviceSwitcher.tsx
 * @description Responsive device switcher with spring animations,
 *              smooth width transitions, and accessible tab semantics.
 * @architecture Isolated — only handles device toggling UI
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type { DeviceSwitcherProps, DeviceType } from "./types";

// ============================================================================
// DEVICE ICON COMPONENTS
// ============================================================================

function MobileIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function DesktopIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
      />
    </svg>
  );
}

// ============================================================================
// DEVICE OPTIONS DATA
// ============================================================================

const DEVICE_OPTIONS: Array<{
  type: DeviceType;
  label: string;
  icon: React.ReactNode;
}> = [
  { type: "mobile", label: "Mobile", icon: <MobileIcon /> },
  { type: "tablet", label: "Tablette", icon: <TabletIcon /> },
  { type: "desktop", label: "Desktop", icon: <DesktopIcon /> },
];

// ============================================================================
// MAIN DEVICE SWITCHER COMPONENT
// ============================================================================

export function DeviceSwitcher({
  current,
  onChange,
  className = "",
}: DeviceSwitcherProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-[#111827] border border-[#1f2937] rounded-xl ${className}`}
      role="tablist"
      aria-label="Switch device preview"
    >
      {DEVICE_OPTIONS.map(({ type, label, icon }) => {
        const isActive = current === type;

        return (
          <button
            key={type}
            role="tab"
            aria-selected={isActive}
            aria-label={`Switch to ${label} view`}
            onClick={() => onChange(type)}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-[44px] min-h-[44px] sm:min-h-auto sm:px-3 sm:py-1.5 ${
              isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {/* Active background pill */}
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  layoutId="device-switcher-active"
                  className="absolute inset-0 bg-[#1f2937] rounded-lg border border-[#374151]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    mass: 0.5,
                  }}
                  style={{ zIndex: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Icon and label */}
            <span className="relative z-10 flex items-center gap-2">
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default DeviceSwitcher;
