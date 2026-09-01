import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PreviewConfig, DeviceType } from './types';
import { DeviceSwitcher } from './DeviceSwitcher';
import { PreviewFrame } from './PreviewFrame';

interface Props {
  isOpen: boolean;
  config: PreviewConfig | null;
  onClose: () => void;
}

export const PreviewModal: React.FC<Props> = ({ isOpen, config, onClose }) => {
  const [device, setDevice] = useState<DeviceType>('desktop');

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col" role="dialog" aria-modal="true">
      <div className="h-16 flex items-center justify-between px-4 bg-slate-900 text-white shrink-0">
        <div>
          <h3 className="font-bold">{config.title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <DeviceSwitcher device={device} onChange={setDevice} />
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg" aria-label="Fermer">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
        <PreviewFrame device={device} url={config.url} />
      </div>
    </div>
  );
};
