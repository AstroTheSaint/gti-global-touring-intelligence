import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../types';

export const SkeletonBase = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#1C212B] relative overflow-hidden rounded", className)}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

export const SkeletonRow = () => (
  <div className="grid grid-cols-[80px_1fr_120px_100px_120px_40px] gap-4 items-center px-6 py-4 border border-[#242A35] rounded-lg bg-[#12151C] mb-2">
    <div className="flex flex-col items-center gap-1">
      <SkeletonBase className="w-8 h-3" />
      <SkeletonBase className="w-10 h-6" />
    </div>
    <div className="space-y-2">
      <SkeletonBase className="w-24 h-4" />
      <SkeletonBase className="w-32 h-3" />
    </div>
    <div className="flex items-center gap-3">
      <SkeletonBase className="flex-1 h-1" />
      <SkeletonBase className="w-8 h-3" />
    </div>
    <div className="flex justify-end">
      <SkeletonBase className="w-16 h-4" />
    </div>
    <div className="flex justify-center">
      <SkeletonBase className="w-20 h-5" />
    </div>
    <div className="flex justify-end">
      <SkeletonBase className="w-4 h-4" />
    </div>
  </div>
);

export const SkeletonKPICard = () => (
  <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg space-y-4">
    <SkeletonBase className="w-20 h-3" />
    <SkeletonBase className="w-32 h-8" />
    <SkeletonBase className="w-24 h-3" />
  </div>
);

export const SkeletonDetailPanel = () => (
  <div className="p-8 space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <SkeletonBase className="w-32 h-4" />
        <SkeletonBase className="w-full aspect-video rounded-lg" />
      </div>
      <div className="space-y-4">
        <SkeletonBase className="w-32 h-4" />
        <SkeletonBase className="w-full h-48 rounded-lg" />
      </div>
    </div>
    <div className="space-y-4">
      <SkeletonBase className="w-32 h-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <SkeletonBase key={i} className="w-full h-20" />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonTransition = ({ 
  isLoading, 
  skeleton, 
  children 
}: { 
  isLoading: boolean; 
  skeleton: React.ReactNode; 
  children: React.ReactNode;
}) => {
  return (
    <div className="relative">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};
