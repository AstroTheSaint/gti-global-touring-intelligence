import React from 'react';
import { cn } from '../../types';

interface ProgressBarProps {
  value: number; // 0 to 100
  height?: number;
  color?: string;
  className?: string;
}

export const ProgressBar = ({ value, height = 6, color = "#2E66FF", className }: ProgressBarProps) => {
  return (
    <div 
      className={cn("w-full bg-gti-surface-2 rounded-full overflow-hidden", className)}
      style={{ height: `${height}px` }}
    >
      <div 
        className="h-full transition-all duration-500 ease-out"
        style={{ 
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};
