import React from 'react';
import { DeviceType } from './types';

interface Props {
  device: DeviceType;
  url: string;
}

export const PreviewFrame: React.FC<Props> = ({ device, url }) => {
  const getContainerClasses = () => {
    switch (device) {
      case 'mobile': return 'w-[375px] h-[812px]';
      case 'tablet': return 'w-[768px] h-[1024px]';
      case 'desktop': return 'w-full h-full min-h-[600px]';
      default: return 'w-full h-full';
    }
  };

  return (
    <div className={`mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${getContainerClasses()}`}>
      <div className="w-full h-full flex flex-col">
        <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 shrink-0">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="mx-auto text-xs text-gray-500 truncate px-4">{url}</div>
        </div>
        <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center text-gray-500 overflow-y-auto">
          <p>Preview UI for {url} (Simulated)</p>
        </div>
      </div>
    </div>
  );
};
