import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { DeviceType } from './types';

interface Props {
  device: DeviceType;
  onChange: (device: DeviceType) => void;
}

export const DeviceSwitcher: React.FC<Props> = ({ device, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      <button 
        onClick={() => onChange('mobile')}
        className={`p-2 rounded-md ${device === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        aria-label="Mobile"
      >
        <Smartphone className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onChange('tablet')}
        className={`p-2 rounded-md ${device === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        aria-label="Tablet"
      >
        <Tablet className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onChange('desktop')}
        className={`p-2 rounded-md ${device === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        aria-label="Desktop"
      >
        <Monitor className="w-5 h-5" />
      </button>
    </div>
  );
};
