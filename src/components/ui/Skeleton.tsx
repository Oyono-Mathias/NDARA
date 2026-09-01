import React from 'react';
import { classNames } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={classNames("animate-pulse rounded-xl bg-gray-200", className)}
      aria-hidden="true"
      {...props}
    />
  );
};
