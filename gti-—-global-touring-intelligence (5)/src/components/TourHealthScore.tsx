import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { cn, Show } from '../types';

interface TourHealthScoreProps {
  shows: Show[];
  loading?: boolean;
}

const TourHealthScore = ({ shows, loading }: TourHealthScoreProps) => {
  if (loading || shows.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center h-full min-h-[160px]">
        <div className="w-8 h-8 border-2 border-gti-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Aggregate Sell-Through (40%)
  const totalSold = shows.reduce((acc, s) => acc + (s.sold || 0), 0);
  const totalCap = shows.reduce((acc, s) => acc + s.capacity, 0);
  const sellThroughScore = totalCap > 0 ? (totalSold / totalCap) * 100 : 0;

  // 2. Cold Zone Health (25%)
  const now = new Date();
  const coldZoneShows = shows.filter(s => {
    const st = s.sold / s.capacity;
    const isFuture = new Date(s.date) > now;
    return st < 0.4 && isFuture;
  });
  const coldZoneHealthScore = ((shows.length - coldZoneShows.length) / shows.length) * 100;

  // 3. Data Completeness (20%)
  const avgCompleteness = shows.reduce((acc, s) => acc + (s.completeness_score || 0), 0) / shows.length;
  const completenessScore = avgCompleteness * 100;

  // 4. Margin Health (15%)
  const totalGross = shows.reduce((acc, s) => acc + (s.gross || 0), 0);
  const totalRevenue = shows.reduce((acc, s) => acc + (s.total_revenue || 0), 0);
  const totalExpense = shows.reduce((acc, s) => acc + (s.total_expense || 0), 0);
  const net = (totalRevenue - totalExpense) * 0.85; // Using 85% artist split as per app logic
  const margin = totalGross > 0 ? net / totalGross : 0;
  const marginScore = margin >= 0.3 ? 100 : (margin / 0.3) * 100;

  // Final Score
  const finalScore = Math.round(
    (sellThroughScore * 0.4) +
    (coldZoneHealthScore * 0.25) +
    (completenessScore * 0.2) +
    (marginScore * 0.15)
  );

  const getColor = (score: number) => {
    if (score >= 75) return 'text-gti-success';
    if (score >= 50) return 'text-gti-warning';
    return 'text-gti-critical';
  };

  const getBgColor = (score: number) => {
    if (score >= 75) return 'stroke-gti-success';
    if (score >= 50) return 'stroke-gti-warning';
    return 'stroke-gti-critical';
  };

  const getIcon = (score: number) => {
    if (score >= 75) return <ShieldCheck size={20} className="text-gti-success" />;
    if (score >= 50) return <Shield size={20} className="text-gti-warning" />;
    return <ShieldAlert size={20} className="text-gti-critical" />;
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (finalScore / 100) * circumference;

  return (
    <div className="card p-6 flex flex-col md:flex-row items-center gap-8 h-full">
      <div className="relative w-32 h-32 shrink-0">
        {/* Background Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gti-surface-2"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={cn("transition-colors duration-500", getBgColor(finalScore))}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-mono font-bold", getColor(finalScore))}>
            {finalScore}
          </span>
          <span className="text-[8px] font-bold text-gti-text-tertiary uppercase tracking-widest">Index</span>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              Tour Health Score {getIcon(finalScore)}
            </h3>
            <p className="text-[10px] text-gti-text-tertiary mt-0.5 uppercase tracking-widest">Weighted Institutional Performance Index</p>
          </div>
          <div className="text-right">
            <p className="micro-label">Status</p>
            <p className={cn("text-[10px] font-bold uppercase", getColor(finalScore))}>
              {finalScore >= 75 ? 'Optimal' : finalScore >= 50 ? 'Caution' : 'Critical'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <ScoreMetric label="Inventory" score={sellThroughScore} weight="40%" />
          <ScoreMetric label="Risk" score={coldZoneHealthScore} weight="25%" />
          <ScoreMetric label="Data" score={completenessScore} weight="20%" />
          <ScoreMetric label="Margin" score={marginScore} weight="15%" />
        </div>
      </div>
    </div>
  );
};

const ScoreMetric = ({ label, score, weight }: { label: string, score: number, weight: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-[9px] font-bold text-gti-text-secondary uppercase tracking-widest">{label}</span>
      <span className="text-[8px] font-mono text-gti-text-tertiary">{weight}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-gti-surface-2 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000",
            score >= 75 ? 'bg-gti-success' : score >= 50 ? 'bg-gti-warning' : 'bg-gti-critical'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[9px] font-mono font-bold text-white w-6 text-right">{Math.round(score)}</span>
    </div>
  </div>
);

export default TourHealthScore;
