import { useState } from 'react';
import { PreviewConfig } from './types';

export const usePreviewModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PreviewConfig | null>(null);

  const openPreview = (newConfig: PreviewConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return { isOpen, config, openPreview, closePreview };
};
