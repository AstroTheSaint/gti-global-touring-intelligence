import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Zap, 
  Flame, 
  Snowflake, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { cn, Show } from '../types';

interface TourPulseProps {
  shows: Show[];
  onDismiss?: () => void;
}

const TourPulse = ({ shows, onDismiss }: TourPulseProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || shows.length === 0) return null;

  const now = new Date();
  
  // Tonight's show (closest upcoming)
  const upcomingShows = shows
    .filter(s => new Date(s.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const tonight = upcomingShows[0];
  const tonightSellThrough = tonight ? (tonight.sold / tonight.capacity) * 100 : 0;

  // Hottest Market (highest sell-through)
  const hottest = [...shows].sort((a, b) => (b.sold / b.capacity) - (a.sold / a.capacity))[0];
  
  // Coldest Market (lowest sell-through, upcoming only)
  const coldest = upcomingShows.sort((a, b) => (a.sold / a.capacity) - (b.sold / b.capacity))[0];

  // Gross to date
  const grossToDate = shows.reduce((acc, s) => acc + (s.gross || 0), 0);

  // Mock opportunities count
  const opportunitiesCount = 3;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative group"
        >
          <div className="card p-1 bg-gradient-to-r from-gti-primary/20 via-gti-surface-1 to-gti-primary/5 border-gti-primary/30">
            <div className="bg-gti-bg/40 backdrop-blur-sm p-4 rounded-md flex flex-col md:flex-row items-center gap-6 md:gap-12">
              
              {/* Tonight's Pulse */}
              <div className="flex items-center gap-4 md:border-r border-gti-border md:pr-8 w-full md:w-auto border-b md:border-b-0 pb-6 md:pb-0">
                <div className="w-10 h-10 rounded-full bg-gti-primary/10 flex items-center justify-center text-gti-primary animate-pulse">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="micro-label mb-0.5">Tonight: {tonight?.city || 'N/A'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-bold text-white">{tonightSellThrough.toFixed(1)}%</span>
                    <span className="text-[10px] text-gti-success font-bold uppercase tracking-tighter">Pacing High</span>
                  </div>
                </div>
              </div>

              {/* Market Insights */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8 w-full">
                <div>
                  <p className="micro-label flex items-center gap-1.5 mb-1">
                    <Flame size={10} className="text-gti-warning" /> Hottest
                  </p>
                  <p className="text-xs font-bold text-white truncate">{hottest?.city}</p>
                  <p className="text-[10px] font-mono text-gti-text-tertiary">{( (hottest?.sold / hottest?.capacity) * 100).toFixed(0)}% Sold</p>
                </div>

                <div>
                  <p className="micro-label flex items-center gap-1.5 mb-1">
                    <Snowflake size={10} className="text-gti-primary" /> Coldest
                  </p>
                  <p className="text-xs font-bold text-white truncate">{coldest?.city}</p>
                  <p className="text-[10px] font-mono text-gti-text-tertiary">{( (coldest?.sold / coldest?.capacity) * 100).toFixed(0)}% Sold</p>
                </div>

                <div>
                  <p className="micro-label flex items-center gap-1.5 mb-1">
                    <DollarSign size={10} className="text-gti-success" /> Gross To Date
                  </p>
                  <p className="text-xs font-mono font-bold text-white">${(grossToDate / 1000000).toFixed(2)}M</p>
                  <p className="text-[10px] text-gti-text-tertiary uppercase">Institutional</p>
                </div>

                <div>
                  <p className="micro-label flex items-center gap-1.5 mb-1">
                    <Briefcase size={10} className="text-gti-primary" /> Opportunities
                  </p>
                  <p className="text-xs font-mono font-bold text-white">{opportunitiesCount}</p>
                  <p className="text-[10px] text-gti-primary font-bold uppercase tracking-tighter">Action Required</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button className="px-4 py-2 rounded-md text-[10px] font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 uppercase tracking-widest">
                  View Full Briefing <ChevronRight size={12} />
                </button>
                <button 
                  onClick={handleDismiss}
                  className="p-2 text-gti-text-tertiary hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourPulse;
