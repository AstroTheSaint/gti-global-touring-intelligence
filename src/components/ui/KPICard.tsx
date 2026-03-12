import React from 'react';
import { cn } from '../../types';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  className?: string;
}

export const KPICard = ({ label, value, subtitle, accentColor, className }: KPICardProps) => {
  return (
    <div className={cn("card p-5 flex flex-col justify-between h-32", className)}>
      <div className="flex justify-between items-start">
        <p className="micro-label">{label}</p>
        {accentColor && (
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        )}
      </div>
      <div>
        <h3 className="text-2xl font-mono font-medium text-white">{value}</h3>
        {subtitle && (
          <p className="text-[10px] text-gti-text-tertiary mt-1 uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
