import React, { useEffect, useState, useRef } from 'react';
import { fmtNum, fmtMoney } from '../../lib/calculations';

interface AnimatedNumberProps {
  value: number;
  isMoney?: boolean;
  className?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, isMoney = false, className, duration = 600 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayValue(0);
    startTimeRef.current = null;

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      const progress = time - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easePercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setDisplayValue(value * easePercentage);

      if (percentage < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {isMoney ? fmtMoney(displayValue) : fmtNum(Math.round(displayValue))}
    </span>
  );
};
