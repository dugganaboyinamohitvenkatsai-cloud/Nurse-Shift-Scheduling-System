import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SkeletonLoader = ({ className, width, height, circle }) => {
  return (
    <div
      style={{ width, height }}
      className={cn(
        "bg-gray-200 animate-pulse",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
    />
  );
};

export default SkeletonLoader;
