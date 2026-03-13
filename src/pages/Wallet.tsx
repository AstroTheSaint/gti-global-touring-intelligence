import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTourData } from '../hooks/useTourData';
import { 
  fmtMoney, 
  fmtNum, 
  fmtDate, 
  DEFAULT_ASSUMPTIONS 
} from '../lib/calculations';
import { cn } from '../types';

// --- Sub-components ---

const WaterfallRow = ({ 
  label, 
  amount, 
  isAddition = false, 
  isSubtotal = false, 
  isFinal = false 
}: { 
  label: string, 
  amount: number, 
  isAddition?: boolean, 
  isSubtotal?: boolean, 
  isFinal?: boolean 
}) => {
  const colorClass = isFinal 
    ? "text-[#10B981]" 
    : isSubtotal 
      ? "text-white font-bold" 
      : isAddition 
        ? "text-[#10B981]" 
        : "text-[#EF4444]";

  return (
    <div className={cn(
      "flex justify-between items-center py-2 border-b border-[#242A35]/50 last:border-0",
      isSubtotal && "border-b-white/10 pt-4",
      isFinal && "pt-6 border-t border-white/10 mt-2"
    )}>
      <span className={cn(
        "text-xs uppercase tracking-widest",
        isSubtotal || isFinal ? "text-white font-bold" : "text-[#475569] font-medium"
      )}>
        {label}
      </span>
      <span className={cn(
        "font-mono",
        isFinal ? "text-2xl" : "text-sm",
        colorClass
      )}>
        {isAddition && amount > 0 ? "+" : ""}{fmtMoney(amount)}
      </span>
    </div>
  );
};

const StatusChip = ({ status }: { status: string }) => {
  const isConfirmed = status === 'settled' || status === 'verified' || status === 'reported';
  return (
    <div className={cn(
      "px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest",
      isConfirmed 
        ? "border-[#10B981] text-[#10B981]" 
        : "border-[#F59E0B] text-[#F59E0B]"
    )}>
      {isConfirmed ? "CONFIRMED" : "ESTIMATED"}
    </div>
  );
};

// --- Main Component ---

export default function Wallet() {
  const { selectedTourId } = useAppContext();
  const { summary, ledger, shows, loading, error } = useTourData(selectedTourId);
  const [isAssumptionsExpanded, setIsAssumptionsExpanded] = useState(false);

  const waterfallData = useMemo(() => {
    if (!summary) return null;

    const gross = summary.total_gross;
    const venueFees = gross * 0.15;
    const adjustedGross = gross - venueFees;
    const merchNet = gross * 0.04; // Assumption for demo
    const vip = gross * 0.08; // Assumption for demo
    const netRevenue = adjustedGross + merchNet + vip;
    
    const production = summary.total_expense * 0.6;
    const travel = summary.total_expense * 0.2;
    const crew = summary.total_expense * 0.2;
    const grossProfit = netRevenue - production - travel - crew;
    
    const artistShare = grossProfit * 0.85;
    const management = artistShare * 0.15;
    const agent = artistShare * 0.10;
    const taxReserve = artistShare * 0.20;
    const netTakeHome = artistShare - management - agent - taxReserve;

    return {
      gross,
      venueFees,
      adjustedGross,
      merchNet,
      vip,
      netRevenue,
      production,
      travel,
      crew,
      grossProfit,
      artistShare,
      management,
      agent,
      taxReserve,
      netTakeHome,
      confidenceScore: 0.92 // Demo value
    };
  }, [summary]);

  const sortedLedger = useMemo(() => {
    return [...ledger].sort((a, b) => {
      const showA = shows.find(s => s.id === a.show_id);
      const showB = shows.find(s => s.id === b.show_id);
      if (!showA || !showB) return 0;
      return new Date(showA.date).getTime() - new Date(showB.date).getTime();
    });
  }, [ledger, shows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#2E66FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-[#12151C] border border-[#EF4444]/30 rounded-lg">
        <p className="text-[#EF4444] font-bold">Error loading wallet data</p>
        <p className="text-[#94A3B8] text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!summary || !waterfallData) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Section 1: Waterfall Header */}
      <div className="bg-[#12151C] border border-[#242A35] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#242A35] flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
            Financial Waterfall — Tour Settlement Cascade
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Live Settlement</span>
          </div>
        </div>
        
        <div className="p-8 max-w-3xl mx-auto space-y-1">
          <WaterfallRow label="Gross Revenue" amount={waterfallData.gross} isSubtotal />
          <WaterfallRow label="Venue Fees (15%)" amount={-waterfallData.venueFees} />
          <WaterfallRow label="Adjusted Gross" amount={waterfallData.adjustedGross} isSubtotal />
          <WaterfallRow label="Merch Net" amount={waterfallData.merchNet} isAddition />
          <WaterfallRow label="VIP Revenue" amount={waterfallData.vip} isAddition />
          <WaterfallRow label="Net Revenue" amount={waterfallData.netRevenue} isSubtotal />
          <WaterfallRow label="Production" amount={-waterfallData.production} />
          <WaterfallRow label="Travel" amount={-waterfallData.travel} />
          <WaterfallRow label="Crew" amount={-waterfallData.crew} />
          <WaterfallRow label="Gross Profit" amount={waterfallData.grossProfit} isSubtotal />
          <WaterfallRow label="Artist Share (85%)" amount={waterfallData.artistShare} isSubtotal />
          <WaterfallRow label="Management (15%)" amount={-waterfallData.management} />
          <WaterfallRow label="Agent (10%)" amount={-waterfallData.agent} />
          <WaterfallRow label="Tax Reserve (20%)" amount={-waterfallData.taxReserve} />
          <WaterfallRow label="Net Take-Home" amount={waterfallData.netTakeHome} isFinal />
          
          <div className="pt-4 text-center">
            <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-1">Confidence Score</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-32 h-1 bg-[#242A35] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981]" style={{ width: `${waterfallData.confidenceScore * 100}%` }} />
              </div>
              <span className="text-[11px] font-mono text-[#10B981] font-bold">
                {Math.round(waterfallData.confidenceScore * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Ledger Table */}
      <div className="bg-[#12151C] border border-[#242A35] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#242A35]">
          <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
            Financial Ledger — Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0C10] border-b border-[#242A35]">
                <th className="px-6 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">City</th>
                <th className="px-6 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center">Source</th>
              </tr>
            </thead>
            <tbody>
              {sortedLedger.map((item, i) => {
                const show = shows.find(s => s.id === item.show_id);
                return (
                  <tr 
                    key={item.id} 
                    className={cn(
                      "border-b border-[#242A35]/30 last:border-0 transition-colors hover:bg-[#1C212B]",
                      i % 2 === 0 ? "bg-[#0A0C10]" : "bg-[#12151C]"
                    )}
                  >
                    <td className="px-6 py-4 text-xs font-mono text-[#94A3B8]">
                      {show ? fmtDate(show.date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white">
                      {show?.city || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest bg-[#1C212B] px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-xs font-mono text-right font-bold",
                      item.type === 'revenue' ? "text-[#10B981]" : "text-[#EF4444]"
                    )}>
                      {item.type === 'revenue' ? '+' : '-'}{fmtMoney(item.amount)}
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      <StatusChip status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Assumptions Panel */}
      <div className="bg-[#12151C] border border-[#242A35] rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsAssumptionsExpanded(!isAssumptionsExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-[#1C212B] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info size={16} className="text-[#475569]" />
            <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
              Settlement Assumptions & Global Splits
            </h3>
          </div>
          <ChevronDown 
            size={16} 
            className={cn("text-[#475569] transition-transform", isAssumptionsExpanded && "rotate-180")} 
          />
        </button>
        
        <AnimatePresence>
          {isAssumptionsExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-0 border-t border-[#242A35]/50 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Venue Fees", val: "15%" },
                  { label: "Merch Net", val: "20%" },
                  { label: "Artist Split", val: "85%" },
                  { label: "Management", val: "15%" },
                  { label: "Agent", val: "10%" },
                  { label: "Tax Reserve", val: "20%" }
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-[9px] font-bold text-[#475569] uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-mono font-bold text-white">{item.val}</p>
                    <p className="text-[8px] text-[#475569] italic">Applied to all non-settled dates.</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
