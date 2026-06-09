/**
 * @file types.ts
 * @description Shared TypeScript types for the Preview Modal system
 * @architecture Clean Architecture — Type contracts only
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  previewUrl: string;
  description?: string;
  initialDevice?: DeviceType;
  allowDeviceSwitch?: boolean;
}

export interface PreviewFrameProps {
  url: string;
  title: string;
  loading?: boolean;
  onError?: (error: Error) => void;
  onLoaded?: () => void;
}

export interface DeviceSwitcherProps {
  current: DeviceType;
  onChange: (device: DeviceType) => void;
  className?: string;
}

export interface PreviewDimensions {
  width: number;
  height: number;
  borderRadius: number;
}

export interface FocusTrapOptions {
  container: HTMLElement;
  enabled?: boolean;
}

// ============================================================================
// DEVICE DIMENSION CONFIG
// ============================================================================

export const DEVICE_DIMENSIONS: Record<DeviceType, PreviewDimensions> = {
  mobile: {
    width: 375,
    height: 667,
    borderRadius: 24,
  },
  tablet: {
    width: 768,
    height: 550,
    borderRadius: 20,
  },
  desktop: {
    width: 1200,
    height: 700,
    borderRadius: 16,
  },
};

export const DEFAULT_DIMENSIONS = DEVICE_DIMENSIONS.desktop;
