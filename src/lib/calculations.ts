import { Show } from '../types';

export interface Assumptions {
  venueFee: number;
  artistSplit: number;
  mgmtFee: number;
  agentFee: number;
  taxReserve: number;
  merchNet: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  venueFee: 0.15,
  artistSplit: 0.85,
  mgmtFee: 0.15,
  agentFee: 0.10,
  taxReserve: 0.20,
  merchNet: 0.04,
};

export const calcSellThrough = (sold: number, capacity: number): number => {
  if (!capacity) return 0;
  return (sold / capacity) * 100;
};

export const calcPacing = (snapshots: { sold: number, timestamp: string }[]) => {
  if (!snapshots || snapshots.length < 2) return { sevenDay: 0, thirtyDay: 0, acceleration: 0 };

  const sorted = [...snapshots].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const now = new Date();
  
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const latest = sorted[0];
  const s7 = sorted.find(s => new Date(s.timestamp) <= sevenDaysAgo) || sorted[sorted.length - 1];
  const s30 = sorted.find(s => new Date(s.timestamp) <= thirtyDaysAgo) || sorted[sorted.length - 1];

  const sevenDay = latest.sold - s7.sold;
  const thirtyDay = latest.sold - s30.sold;
  
  // Acceleration: compare last 7 days to previous 7 days if possible
  const s14 = sorted.find(s => new Date(s.timestamp) <= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000));
  const prevSevenDay = s14 ? s7.sold - s14.sold : sevenDay;
  const acceleration = prevSevenDay > 0 ? (sevenDay - prevSevenDay) / prevSevenDay : 0;

  return { sevenDay, thirtyDay, acceleration };
};

export const isColdZone = (sellThrough: number, daysToShow: number): "low" | "critical" | null => {
  if (sellThrough < 25 && daysToShow < 90) return "critical";
  if (sellThrough < 45 && daysToShow < 180) return "critical"; // Catching larger shows like Chicago
  if (sellThrough < 60 && daysToShow < 30) return "low";
  return null;
};

export interface Waterfall {
  gross: number;
  venueFee: number;
  merchNet: number;
  production: number;
  travel: number;
  marketing: number;
  crew: number;
  insurance: number;
  promoterProfit: number;
  artistGross: number;
  artistSplit: number;
  mgmtFee: number;
  agentFee: number;
  taxReserve: number;
  netPayout: number;
}

export const calcWaterfall = (gross: number, capacity: number = 0, assumptions: Assumptions = DEFAULT_ASSUMPTIONS): Waterfall => {
  const venueFee = gross * assumptions.venueFee;
  const merchNet = gross * assumptions.merchNet;
  
  // Production scales with capacity
  const production = capacity > 10000 ? 150000 : capacity > 5000 ? 75000 : 25000;
  const travel = 15000; 
  const marketing = 10000;
  const crew = 20000;
  const insurance = 5000;
  
  const promoterProfit = (gross - venueFee) * 0.15;
  const artistGross = gross - venueFee - production - travel - marketing - crew - insurance - promoterProfit;
  
  const artistSplit = Math.max(0, artistGross * assumptions.artistSplit);
  const mgmtFee = artistSplit * assumptions.mgmtFee;
  const agentFee = artistSplit * assumptions.agentFee;
  const taxReserve = artistSplit * assumptions.taxReserve;
  
  const netPayout = artistSplit - mgmtFee - agentFee - taxReserve;

  return {
    gross,
    venueFee,
    merchNet,
    production,
    travel,
    marketing,
    crew,
    insurance,
    promoterProfit,
    artistGross,
    artistSplit,
    mgmtFee,
    agentFee,
    taxReserve,
    netPayout
  };
};

export const calcTourHealthScore = (shows: Show[]): number => {
  if (!shows.length) return 0;

  const now = new Date();
  
  // 40% Sell-through
  const totalSold = shows.reduce((acc, s) => acc + (s.sold || 0), 0);
  const totalCap = shows.reduce((acc, s) => acc + s.capacity, 0);
  const sellThroughScore = totalCap > 0 ? (totalSold / totalCap) * 100 : 0;

  // 25% Cold Zone Ratio
  const coldZoneCount = shows.filter(s => {
    const st = (s.sold / s.capacity) * 100;
    const days = (new Date(s.date).getTime() - now.getTime()) / (1000 * 3600 * 24);
    return isColdZone(st, days) !== null;
  }).length;
  const coldZoneRatioScore = ((shows.length - coldZoneCount) / shows.length) * 100;

  // 20% Data Completeness
  const avgCompleteness = shows.reduce((acc, s) => acc + (s.completeness_score || 0), 0) / shows.length;
  const dataCompletenessScore = avgCompleteness * 100;

  // 15% Margin
  const totalGross = shows.reduce((acc, s) => acc + (s.gross || 0), 0);
  const totalRevenue = shows.reduce((acc, s) => acc + (s.total_revenue || 0), 0);
  const totalExpense = shows.reduce((acc, s) => acc + (s.total_expense || 0), 0);
  const net = (totalRevenue - totalExpense) * 0.85;
  const margin = totalGross > 0 ? net / totalGross : 0;
  const marginScore = margin >= 0.3 ? 100 : (margin / 0.3) * 100;

  return Math.round(
    (sellThroughScore * 0.4) +
    (coldZoneRatioScore * 0.25) +
    (dataCompletenessScore * 0.2) +
    (marginScore * 0.15)
  );
};

export const calcConfidence = (inputs: number[]): number => {
  return inputs.reduce((acc, val) => acc * val, 1);
};

export const getShowStatus = (show: Show) => {
  const sellThrough = (show.sold / show.capacity) * 100;
  const now = new Date();
  const days = (new Date(show.date).getTime() - now.getTime()) / (1000 * 3600 * 24);
  const cold = isColdZone(sellThrough, days);

  if (sellThrough >= 100) return { label: "SOLD OUT", color: "#10B981" };
  if (cold === "critical") return { label: "CRITICAL", color: "#EF4444" };
  if (cold === "low") return { label: "COLD ZONE", color: "#F59E0B" };
  if (sellThrough > 80) return { label: "HOT", color: "#10B981" };
  return { label: "ON SALE", color: "#94A3B8" };
};

export const fmtMoney = (n: number): string => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

export const fmtNum = (n: number): string => {
  return new Intl.NumberFormat('en-US').format(n);
};

export const fmtDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const fmtDateFull = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export interface RadiusConflict {
  show1Id: string;
  show2Id: string;
  show1City: string;
  show2City: string;
  distanceMiles: number;
  daysBetween: number;
  severity: "high" | "medium";
}

export const checkRadiusConflicts = (shows: Show[]): RadiusConflict[] => {
  const conflicts: RadiusConflict[] = [];
  
  for (let i = 0; i < shows.length; i++) {
    for (let j = i + 1; j < shows.length; j++) {
      const s1 = shows[i];
      const s2 = shows[j];
      
      if (!s1.lat || !s1.lng || !s2.lat || !s2.lng) continue;

      const date1 = new Date(s1.date);
      const date2 = new Date(s2.date);
      const daysBetween = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 3600 * 24);

      if (daysBetween > 60) continue;

      const distance = haversineDistance(s1.lat, s1.lng, s2.lat, s2.lng);

      if (distance < 150) {
        const severity = (distance < 90 && daysBetween < 30) ? "high" : "medium";
        conflicts.push({
          show1Id: s1.id,
          show2Id: s2.id,
          show1City: s1.city,
          show2City: s2.city,
          distanceMiles: Math.round(distance),
          daysBetween: Math.round(daysBetween),
          severity
        });
      }
    }
  }
  
  return conflicts;
};
