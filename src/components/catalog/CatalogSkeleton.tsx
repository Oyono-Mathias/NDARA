import React from 'react';

export function CatalogSkeleton() {
  return (
    <div className="space-y-8 pb-24 animate-pulse">
      <div className="bg-white/5 p-6 rounded-3xl space-y-6">
        <div>
          <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
        </div>
        <div className="h-14 bg-white/10 rounded-2xl w-full"></div>
      </div>

      <div className="flex gap-3 overflow-x-hidden px-2">
        <div className="w-24 h-10 bg-white/10 rounded-full"></div>
        <div className="w-32 h-10 bg-white/10 rounded-full"></div>
        <div className="w-28 h-10 bg-white/10 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white/5 rounded-3xl overflow-hidden h-[350px]"></div>
        ))}
      </div>
    </div>
  );
}
