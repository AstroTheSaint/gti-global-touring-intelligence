import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ChevronDown, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Users,
  Zap,
  Plus,
  Flag,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useTourData } from '../hooks/useTourData';
import { 
  fmtMoney, 
  fmtNum, 
  getShowStatus,
  isColdZone,
  calcSellThrough
} from '../lib/calculations';
import { cn } from '../types';
import { SkeletonRow, SkeletonDetailPanel, SkeletonTransition } from '../components/Skeleton';

// Fix for default marker icon
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// --- Components ---

const StatusChip = ({ status, sellThrough, daysToShow }: { status: string, sellThrough: number, daysToShow: number }) => {
  const cold = isColdZone(sellThrough, daysToShow);
  
  if (sellThrough >= 100) {
    return (
      <div className="px-2 py-0.5 rounded border border-[#10B981] text-[#10B981] text-[9px] font-bold uppercase tracking-widest">
        SOLD OUT
      </div>
    );
  }
  
  if (cold === 'critical') {
    return (
      <div className="px-2 py-0.5 rounded border border-[#EF4444] text-[#EF4444] text-[9px] font-bold uppercase tracking-widest shadow-[0_0_8px_rgba(239,68,68,0.3)]">
        COLD ZONE
      </div>
    );
  }

  if (cold === 'low') {
    return (
      <div className="px-2 py-0.5 rounded border border-[#F59E0B] text-[#F59E0B] text-[9px] font-bold uppercase tracking-widest">
        LOW PACING
      </div>
    );
  }

  return (
    <div className="px-2 py-0.5 rounded border border-[#475569] text-[#475569] text-[9px] font-bold uppercase tracking-widest">
      ON SALE
    </div>
  );
};

const ExpandedPanel = ({ showId, capacity }: { showId: string, capacity: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/show/${showId}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, [showId]);

  if (loading) return <SkeletonDetailPanel />;

  const sparklineData = data.snapshots?.map((s: any) => ({ sold: s.sold })) || [];
  const latestSnapshot = data.snapshots?.[0] || {};
  const gross = latestSnapshot.gross || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#0D1016]"
    >
      {/* Column 1: Map */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
          <MapPin size={12} />
          Venue Location
        </div>
        <div className="h-[180px] rounded-lg overflow-hidden border border-[#242A35] relative z-0">
          {data.show?.lat && data.show?.lng ? (
            <MapContainer 
              center={[data.show.lat, data.show.lng]} 
              zoom={13} 
              scrollWheelZoom={false}
              zoomControl={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[data.show.lat, data.show.lng]} />
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#12151C] text-[#475569] text-xs">
              Location not available
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Pacing & Audience */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
          <TrendingUp size={12} />
          Sales Pacing
        </div>
        <div className="h-[80px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area 
                type="monotone" 
                dataKey="sold" 
                stroke="#2E66FF" 
                fill="#2E66FF" 
                fillOpacity={0.1} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[#475569] uppercase font-bold tracking-widest mb-1">Audience Reach</p>
            <p className="text-lg font-mono font-bold text-white">{fmtNum(Math.round(capacity * 1.2))}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#475569] uppercase font-bold tracking-widest mb-1">Conversion</p>
            <p className="text-lg font-mono font-bold text-[#10B981]">3.2%</p>
          </div>
        </div>
      </div>

      {/* Column 3: Financials & Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
          <DollarSign size={12} />
          Financial Summary
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#94A3B8]">Gross Revenue</span>
            <span className="text-xs font-mono text-white">{fmtMoney(gross)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#94A3B8]">Total Expenses</span>
            <span className="text-xs font-mono text-[#EF4444]">-{fmtMoney(gross * 0.4)}</span>
          </div>
          <div className="pt-2 border-t border-[#242A35] flex justify-between items-center">
            <span className="text-xs font-bold text-white">Net Margin</span>
            <span className="text-sm font-mono font-bold text-[#10B981]">{fmtMoney(gross * 0.6)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2E66FF] text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-[#2E66FF]/90 transition-colors">
            <Zap size={12} />
            Boost Market
          </button>
          <button className="px-3 py-2 bg-transparent border border-[#242A35] text-[#94A3B8] text-[10px] font-bold rounded uppercase tracking-widest hover:bg-[#1C212B] transition-colors">
            Add Note
          </button>
          <button className="p-2 bg-transparent border border-[#242A35] text-[#94A3B8] rounded hover:bg-[#1C212B] transition-colors">
            <Flag size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Roadmap() {
  const { selectedTourId } = useAppContext();
  const { shows, loading, error } = useTourData(selectedTourId);
  const [searchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const showId = searchParams.get('showId');
    if (showId) setExpandedId(showId);
  }, [searchParams]);

  if (loading) return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-[#12151C] border border-[#EF4444]/30 rounded-lg">
      <p className="text-[#EF4444] font-bold">Error loading roadmap</p>
      <p className="text-[#94A3B8] text-sm mt-2">{error}</p>
    </div>
  );

  return (
    <SkeletonTransition 
      isLoading={loading} 
      skeleton={
        <div className="space-y-1">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} />)}
        </div>
      }
    >
      <div className="space-y-4">
      {/* Table Headers */}
      <div className="grid grid-cols-[80px_1fr_120px_100px_120px_40px] gap-4 px-6 text-[10px] font-bold text-[#475569] uppercase tracking-widest font-mono">
        <span>Date</span>
        <span>Market / Venue</span>
        <span>Sell-Through</span>
        <span className="text-right">Gross</span>
        <span className="text-center">Status</span>
        <span></span>
      </div>

      {/* Timeline Table */}
      <div className="space-y-1">
        {shows.map((show) => {
          const isExpanded = expandedId === show.id;
          const date = new Date(show.date);
          const day = date.getDate();
          const month = date.toLocaleDateString('en', { month: 'short' }).toUpperCase();
          const sellThrough = (show.sold / show.capacity) * 100;
          const now = new Date();
          const daysToShow = (date.getTime() - now.getTime()) / (1000 * 3600 * 24);
          const cold = isColdZone(sellThrough, daysToShow);

          let barColor = '#2E66FF';
          if (sellThrough >= 100) barColor = '#10B981';
          if (cold) barColor = '#EF4444';

          return (
            <div key={show.id} className="border border-[#242A35] rounded-lg overflow-hidden bg-[#12151C]">
              {/* Collapsed Row */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : show.id)}
                className={cn(
                  "grid grid-cols-[80px_1fr_120px_100px_120px_40px] gap-4 items-center px-6 py-4 cursor-pointer transition-colors",
                  isExpanded ? "bg-[#1C212B]" : "hover:bg-[#1C212B]"
                )}
              >
                {/* DateNode */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest leading-none mb-1">{month}</span>
                  <span className="text-[20px] font-mono font-bold text-white leading-none">{day}</span>
                </div>

                {/* City & Venue */}
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-white truncate">{show.city}</h4>
                  <p className="text-[12px] text-[#475569] truncate">
                    {show.venue} · <span className="font-mono">{fmtNum(show.capacity)}</span> CAP
                  </p>
                </div>

                {/* Sell-through */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-[#242A35] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sellThrough}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8] w-8">{Math.round(sellThrough)}%</span>
                </div>

                {/* Gross */}
                <div className="text-right font-mono text-[13px] text-white">
                  {fmtMoney(show.gross || 0)}
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <StatusChip status={show.status} sellThrough={sellThrough} daysToShow={daysToShow} />
                </div>

                {/* Chevron */}
                <div className="flex justify-end text-[#475569]">
                  <ChevronDown 
                    size={18} 
                    className={cn("transition-transform duration-300", isExpanded && "rotate-180 text-white")} 
                  />
                </div>
              </div>

              {/* Expanded Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden border-t border-[#242A35]"
                  >
                    <ExpandedPanel showId={show.id} capacity={show.capacity} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      </div>
    </SkeletonTransition>
  );
}
