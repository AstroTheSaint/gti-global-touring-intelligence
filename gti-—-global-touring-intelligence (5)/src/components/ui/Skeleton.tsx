import React from 'react';
import { cn } from '../../types';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "bg-gti-surface-2 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 text-transparent to-transparent" />
    </div>
  );
};
