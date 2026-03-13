import React from 'react';
import { cn } from '../../types';

interface DataPoint {
  label?: string;
  value: number;
}

interface MiniSparklineProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const MiniSparkline = ({ 
  data, 
  width = 100, 
  height = 30, 
  color = "#2E66FF", 
  className 
}: MiniSparklineProps) => {
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastPoint = data[data.length - 1];
  const lastX = width;
  const lastY = height - ((lastPoint.value - min) / range) * height;

  return (
    <div className={cn("inline-block", className)} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle
          cx={lastX}
          cy={lastY}
          r="2"
          fill={color}
          stroke="none"
        />
      </svg>
    </div>
  );
};
