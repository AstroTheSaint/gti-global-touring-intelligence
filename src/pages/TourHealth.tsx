import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useTourData } from '../hooks/useTourData';
import { 
  fmtMoney, 
  fmtNum, 
  calcWaterfall, 
  isColdZone,
  calcSellThrough
} from '../lib/calculations';
import { cn } from '../types';
import { SkeletonKPICard, SkeletonTransition } from '../components/Skeleton';

// --- Components ---

/**
 * Animated number that counts up from 0 on mount
 */
const AnimatedNumber = ({ value, prefix = "", suffix = "", isMoney = false }: { 
  value: number, 
  prefix?: string, 
  suffix?: string,
  isMoney?: boolean 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const duration = 1500; // 1.5 seconds

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      setDisplayValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = isMoney ? fmtMoney(displayValue) : fmtNum(displayValue);

  return (
    <span className="font-mono">
      {prefix}{formatted}{suffix}
    </span>
  );
};

const KPICard = ({ label, value, subtitle, accentColor, valueColor }: { 
  label: string, 
  value: React.ReactNode, 
  subtitle?: string,
  accentColor?: string,
  valueColor?: string
}) => (
  <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">{label}</p>
      {accentColor && (
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
      )}
    </div>
    <div>
      <h3 className={cn("text-2xl font-mono font-medium tracking-tight", valueColor || "text-white")}>{value}</h3>
      {subtitle && (
        <p className="text-[10px] text-[#475569] mt-1 uppercase tracking-wider font-medium">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// --- Main Component ---

export default function TourHealth() {
  const { selectedTourId } = useAppContext();
  const { shows, snapshots, loading, error } = useTourData(selectedTourId);
  const now = new Date();

  const metrics = useMemo(() => {
    if (!shows.length) return null;

    const totalSold = shows.reduce((acc, s) => acc + (s.sold || 0), 0);
    const totalCap = shows.reduce((acc, s) => acc + s.capacity, 0);
    const totalGross = shows.reduce((acc, s) => acc + (s.gross || 0), 0);
    const showsRemaining = shows.filter(s => new Date(s.date) > now).length;
    
    const totalNetPayout = shows.reduce((acc, s) => {
      const waterfall = calcWaterfall(s.gross || 0, s.capacity);
      return acc + waterfall.netPayout;
    }, 0);

    const coldZoneData = shows.map(s => {
      const st = (s.sold / s.capacity) * 100;
      const days = (new Date(s.date).getTime() - now.getTime()) / (1000 * 3600 * 24);
      const level = isColdZone(st, days);
      return level ? { id: s.id, city: s.city } : null;
    }).filter(Boolean) as { id: string, city: string }[];

    return {
      totalGross,
      globalSellThrough: totalCap > 0 ? (totalSold / totalCap) * 100 : 0,
      totalNetPayout,
      showsRemaining,
      coldZones: coldZoneData
    };
  }, [shows]);

  const chartData = useMemo(() => {
    if (!snapshots.length || !shows.length) return [];

    // Get unique timestamps (sorted)
    const timestamps = Array.from(new Set(snapshots.map(s => s.timestamp))).sort();
    
    // Map timestamps to data points
    return timestamps.map(ts => {
      const point: any = { timestamp: ts };
      
      // For each show, find its sold value at this timestamp or the latest one before it
      shows.forEach(show => {
        const snapshot = snapshots
          .filter(s => s.show_id === show.id && s.timestamp <= ts)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        point[`show_${show.id}`] = snapshot ? snapshot.sold : 0;
      });
      
      return point;
    });
  }, [snapshots, shows]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <SkeletonKPICard key={i} />
          ))}
        </div>
        <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg h-[400px] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-[#12151C] border border-[#EF4444]/30 rounded-lg">
        <p className="text-[#EF4444] font-bold">Error loading tour health data</p>
        <p className="text-[#94A3B8] text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <SkeletonTransition isLoading={loading} skeleton={
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonKPICard key={i} />)}
        </div>
      </div>
    }>
      <div className="space-y-6">
      {/* Cold Zone Alert Bar */}
      {metrics.coldZones.length > 0 && (
        <div className="w-full bg-[#EF444410] border-y border-[#EF444420] py-2 px-6 flex items-center justify-center gap-2">
          <span className="text-white text-xs font-medium">
            {metrics.coldZones.length} shows require attention:
          </span>
          <div className="flex items-center gap-2">
            {metrics.coldZones.map((cz, i) => (
              <React.Fragment key={cz.id}>
                <Link 
                  to={`/app/roadmap?showId=${cz.id}`}
                  className="text-white text-xs font-bold underline underline-offset-2 hover:text-[#EF4444] transition-colors"
                >
                  {cz.city}
                </Link>
                {i < metrics.coldZones.length - 1 && <span className="text-[#475569] text-xs">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Global Sell-Through" 
          value={<><AnimatedNumber value={metrics.globalSellThrough} />%</>}
          accentColor="#10B981"
          valueColor="text-[#10B981]"
          subtitle="Tour Average"
        />
        <KPICard 
          label="Total Gross Revenue" 
          value={<AnimatedNumber value={metrics.totalGross} isMoney />}
          subtitle="Gross to Date"
        />
        <KPICard 
          label="Shows Remaining" 
          value={<AnimatedNumber value={metrics.showsRemaining} />}
          subtitle="Upcoming Dates"
        />
        <KPICard 
          label="Est. Net Take-Home" 
          value={<AnimatedNumber value={metrics.totalNetPayout} isMoney />}
          accentColor="#10B981"
          subtitle="Projected Net"
        />
      </div>

      {/* Pacing Line Chart */}
      <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
            Pacing Intelligence — Ticket Sales Velocity
          </h3>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242A35" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                hide 
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                tickFormatter={(val) => fmtNum(val)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0A0C10', 
                  border: '1px solid #242A35', 
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
                itemStyle={{ padding: '2px 0' }}
                labelStyle={{ color: '#475569', marginBottom: '4px', fontSize: '10px' }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: any, name: string) => {
                  const showId = name.replace('show_', '');
                  const show = shows.find(s => s.id === showId);
                  return [fmtNum(value), show?.city || 'Show'];
                }}
              />
              {shows.map(show => {
                const sellThrough = (show.sold / show.capacity) * 100;
                const days = (new Date(show.date).getTime() - now.getTime()) / (1000 * 3600 * 24);
                const isCold = isColdZone(sellThrough, days);
                
                let color = '#2E66FF'; // Default blue
                if (sellThrough >= 100) color = '#10B981'; // Sold out green
                if (isCold) color = '#EF4444'; // Cold zone red

                return (
                  <Line 
                    key={show.id}
                    type="monotone" 
                    dataKey={`show_${show.id}`} 
                    stroke={color} 
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </SkeletonTransition>
  );
}
