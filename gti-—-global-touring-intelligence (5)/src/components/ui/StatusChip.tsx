import React from 'react';
import { cn } from '../../types';

interface StatusChipProps {
  label: string;
  color?: string;
  className?: string;
}

export const StatusChip = ({ label, color = "#2E66FF", className }: StatusChipProps) => {
  return (
    <span 
      className={cn(
        "px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border font-mono",
        className
      )}
      style={{ 
        borderColor: `${color}33`, 
        color: color,
        backgroundColor: `${color}11`
      }}
    >
      {label}
    </span>
  );
};
