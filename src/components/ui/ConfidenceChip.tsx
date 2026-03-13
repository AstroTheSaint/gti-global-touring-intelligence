import React from 'react';
import { StatusChip } from './StatusChip';

interface ConfidenceChipProps {
  score: number;
}

export const ConfidenceChip = ({ score }: ConfidenceChipProps) => {
  const isConfirmed = score >= 0.95;
  return (
    <StatusChip 
      label={isConfirmed ? "CONFIRMED" : "ESTIMATED"} 
      color={isConfirmed ? "#10B981" : "#F59E0B"} 
    />
  );
};
