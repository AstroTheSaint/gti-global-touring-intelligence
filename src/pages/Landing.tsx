import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "../types";

// ━━ DESIGN SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Using Tailwind colors that match the requested system
const C = {
  bg0: "bg-[#0A0C10]",
  bg1: "bg-[#12151C]",
  bg2: "bg-[#1C212B]",
  border: "border-[#242A35]",
  borderStrong: "border-[#3B4455]",
  blue: "text-[#2E66FF]",
  blueBg: "bg-[#2E66FF]",
  green: "text-[#10B981]",
  greenBg: "bg-[#10B981]",
  amber: "text-[#F59E0B]",
  amberBg: "bg-[#F59E0B]",
  red: "text-[#EF4444]",
  redBg: "bg-[#EF4444]",
  text1: "text-[#FFFFFF]",
  text2: "text-[#94A3B8]",
  text3: "text-[#475569]",
};

// ━━ DEMO DATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const wafflesShows = [
  { city: "Amsterdam", venue: "Ziggo Dome", cap: 17000, sold: 14500, gross: 754000, date: "2026-06-01", status: "on_sale", region: "Europe" },
  { city: "Berlin", venue: "Uber Arena", cap: 17000, sold: 15000, gross: 720000, date: "2026-06-04", status: "on_sale", region: "Europe" },
  { city: "Zürich", venue: "Hallenstadion", cap: 15000, sold: 4500, gross: 270000, date: "2026-06-09", status: "cold_zone", region: "Europe" },
  { city: "Munich", venue: "Olympiahalle München", cap: 15500, sold: 12500, gross: 687500, date: "2026-06-11", status: "on_sale", region: "Europe" },
  { city: "Brussels", venue: "ING Arena", cap: 15000, sold: 13000, gross: 650000, date: "2026-06-14", status: "on_sale", region: "Europe" },
  { city: "London", venue: "The O2", cap: 20000, sold: 19500, gross: 1267500, date: "2026-06-18", status: "sold_out", region: "Europe" },
  { city: "Birmingham", venue: "Utilita Arena Birmingham", cap: 15800, sold: 14000, gross: 770000, date: "2026-06-20", status: "on_sale", region: "Europe" },
  { city: "Manchester", venue: "Co-op Live", cap: 23500, sold: 21000, gross: 1260000, date: "2026-06-23", status: "on_sale", region: "Europe" },
];

const metroShows = [
  { city: "Kansas City", venue: "T-Mobile Center", cap: 15000, sold: 14200, gross: 1775000, date: "2026-07-30", status: "on_sale", region: "Midwest" },
  { city: "Saint Paul", venue: "Xcel Energy Center", cap: 18000, sold: 17500, gross: 2187500, date: "2026-07-31", status: "sold_out", region: "Midwest" },
  { city: "Milwaukee", venue: "Fiserv Forum", cap: 17000, sold: 16800, gross: 2100000, date: "2026-08-02", status: "on_sale", region: "Midwest" },
  { city: "Chicago", venue: "Grant Park", cap: 50000, sold: 22000, gross: 2750000, date: "2026-08-03", status: "cold_zone", region: "Midwest" },
  { city: "Detroit", venue: "Little Caesars Arena", cap: 19000, sold: 18200, gross: 2275000, date: "2026-08-04", status: "on_sale", region: "Midwest" },
  { city: "Nashville", venue: "Bridgestone Arena", cap: 17500, sold: 16900, gross: 2112500, date: "2026-08-06", status: "on_sale", region: "South" },
  { city: "Atlanta", venue: "State Farm Arena", cap: 13215, sold: 13215, gross: 1847293, date: "2026-08-08", status: "sold_out", region: "South" },
  { city: "Columbus", venue: "Value City Arena", cap: 18000, sold: 17100, gross: 2137500, date: "2026-08-10", status: "on_sale", region: "Midwest" },
  { city: "Toronto", venue: "Scotiabank Arena", cap: 14761, sold: 13816, gross: 1678930, date: "2026-08-11", status: "on_sale", region: "Canada" },
  { city: "Boston", venue: "TD Garden", cap: 13874, sold: 11313, gross: 1420977, date: "2026-08-13", status: "on_sale", region: "Northeast" },
  { city: "Philadelphia", venue: "Wells Fargo Center", cap: 19000, sold: 18400, gross: 2300000, date: "2026-08-14", status: "on_sale", region: "Northeast" },
  { city: "New York", venue: "Barclays Center", cap: 14672, sold: 14672, gross: 1829768, date: "2026-08-15", status: "sold_out", region: "Northeast" },
];

const fmt = (n: number) => {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
};

const pct = (sold: number, cap: number) => cap === 0 ? 0 : Math.round((sold / cap) * 100);

// ━━ ANIMATED COUNTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Counter({ end, prefix = "", suffix = "", duration = 1800 }: { end: number, prefix?: string, suffix?: string, duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(eased * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ━━ STATUS CHIP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string, color: string, dotColor: string, borderColor: string, bgColor: string }> = {
    sold_out: { label: "SOLD OUT", color: "text-[#10B981]", dotColor: "bg-[#10B981]", borderColor: "border-[#10B981]/20", bgColor: "bg-[#10B981]/5" },
    on_sale: { label: "ON SALE", color: "text-[#94A3B8]", dotColor: "bg-[#94A3B8]", borderColor: "border-[#94A3B8]/20", bgColor: "bg-[#94A3B8]/5" },
    cold_zone: { label: "COLD ZONE", color: "text-[#EF4444]", dotColor: "bg-[#EF4444]", borderColor: "border-[#EF4444]/20", bgColor: "bg-[#EF4444]/5" },
    low_pacing: { label: "LOW PACING", color: "text-[#F59E0B]", dotColor: "bg-[#F59E0B]", borderColor: "border-[#F59E0B]/20", bgColor: "bg-[#F59E0B]/5" },
    past: { label: "PAST", color: "text-[#475569]", dotColor: "bg-[#475569]", borderColor: "border-[#475569]/20", bgColor: "bg-[#475569]/5" },
  };
  const s = map[status] || map.on_sale;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-bold tracking-widest font-mono",
      s.color, s.borderColor, s.bgColor
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        s.dotColor,
        status === "cold_zone" && "shadow-[0_0_6px_#EF4444]"
      )} />
      {s.label}
    </span>
  );
}

// ━━ SELL-THROUGH BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SellBar({ sold, cap, status }: { sold: number, cap: number, status: string }) {
  const p = pct(sold, cap);
  const color = status === "cold_zone" ? "bg-[#EF4444]" : status === "sold_out" ? "bg-[#10B981]" : "bg-[#2E66FF]";
  const barBg = status === "cold_zone" ? "bg-[#EF4444]/10" : status === "sold_out" ? "bg-[#10B981]/10" : "bg-[#2E66FF]/10";
  
  return (
    <div className="flex items-center gap-2 min-w-[100px] md:min-w-[120px]">
      <div className={cn("flex-1 h-1 rounded-full overflow-hidden", barBg)}>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${p}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full", color)} 
        />
      </div>
      <span className="text-[11px] font-mono text-[#94A3B8] min-w-[32px]">
        {p}%
      </span>
    </div>
  );
}

// ━━ SHOW ROW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ShowRow({ show, i }: { show: any, i: number }) {
  const d = new Date(show.date + "T00:00:00");
  const mon = d.toLocaleDateString("en", { month: "short" }).toUpperCase();
  const day = d.getDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.04 }}
      className="grid grid-cols-[54px_1fr_auto] md:grid-cols-[54px_1fr_140px_100px_90px] items-center gap-3 md:gap-4 px-4 py-3 border-b border-[#242A35] hover:bg-[#1C212B]/50 transition-colors group cursor-default"
    >
      {/* Date */}
      <div className="text-center">
        <div className="text-[10px] font-bold text-[#475569] tracking-widest font-mono">{mon}</div>
        <div className="text-xl font-bold text-white font-mono leading-none">{day}</div>
      </div>
      
      {/* Venue */}
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white truncate">{show.city}</div>
        <div className="text-xs text-[#475569] truncate">{show.venue} · {show.cap.toLocaleString()} cap</div>
      </div>
      
      {/* Sell-through (Hidden on very small mobile, shown on md+) */}
      <div className="hidden md:block">
        <SellBar sold={show.sold} cap={show.cap} status={show.status} />
      </div>
      
      {/* Gross (Hidden on mobile, shown on md+) */}
      <div className="hidden md:block text-right text-[13px] font-mono text-[#94A3B8]">
        {show.gross > 0 ? fmt(show.gross) : "—"}
      </div>
      
      {/* Status */}
      <div className="text-right">
        <StatusChip status={show.status} />
      </div>
    </motion.div>
  );
}

// ━━ MINI ROADMAP TABLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RoadmapTable({ shows, artist, tour }: { shows: any[], artist: string, tour: string }) {
  const totalSold = shows.reduce((s, sh) => s + sh.sold, 0);
  const totalCap = shows.reduce((s, sh) => s + sh.cap, 0);
  const totalGross = shows.reduce((s, sh) => s + sh.gross, 0);
  const soldOut = shows.filter(s => s.status === "sold_out").length;
  const coldZones = shows.filter(s => s.status === "cold_zone").length;

  return (
    <div className="bg-[#12151C] border border-[#242A35] rounded-lg overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-[#242A35] flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#475569] uppercase font-mono mb-1">
            {artist}
          </div>
          <div className="text-lg md:text-xl font-bold text-white">{tour}</div>
        </div>
        <div className="flex gap-6 md:gap-8 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="text-[10px] text-[#475569] font-bold tracking-widest uppercase mb-1">Sell-Through</div>
            <div className="text-lg md:text-xl font-bold text-[#10B981] font-mono">{pct(totalSold, totalCap)}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#475569] font-bold tracking-widest uppercase mb-1">Gross</div>
            <div className="text-lg md:text-xl font-bold text-white font-mono">{fmt(totalGross)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#475569] font-bold tracking-widest uppercase mb-1">Shows</div>
            <div className="text-lg md:text-xl font-bold text-white font-mono">{shows.length}</div>
          </div>
        </div>
      </div>
      
      {/* Column headers (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-[54px_1fr_140px_100px_90px] gap-4 px-4 py-2 border-b border-[#242A35] text-[10px] font-bold tracking-widest text-[#475569] uppercase font-mono">
        <span>Date</span>
        <span>Venue</span>
        <span>Sell-Through</span>
        <span className="text-right">Gross</span>
        <span className="text-right">Status</span>
      </div>
      
      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {shows.map((s, i) => <ShowRow key={i} show={s} i={i} />)}
      </div>
      
      {/* Footer stats */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 p-4 border-t border-[#242A35] text-[11px] text-[#475569] font-mono">
        <span><span className="text-[#10B981]">{soldOut}</span> sold out</span>
        {coldZones > 0 && <span><span className="text-[#EF4444]">{coldZones}</span> cold zone{coldZones > 1 ? "s" : ""}</span>}
        <span>{totalSold.toLocaleString()} / {totalCap.toLocaleString()} tickets</span>
      </div>
    </div>
  );
}

// ━━ FEATURE CARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Feature({ icon, title, desc, accent = "text-[#2E66FF]" }: { icon: string, title: string, desc: string, accent?: string }) {
  const accentBg = accent.replace("text-", "bg-").replace("]", "/12]");
  const accentBorder = accent.replace("text-", "border-").replace("]", "/25]");

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-7 bg-[#12151C] border border-[#242A35] rounded-lg flex flex-col gap-4 shadow-lg hover:border-[#3B4455] transition-all"
    >
      <div className={cn(
        "w-10 h-10 rounded-lg border flex items-center justify-center text-xl",
        accentBg, accentBorder, accent
      )}>{icon}</div>
      <div className="text-[15px] font-bold text-white">{title}</div>
      <div className="text-[13px] text-[#94A3B8] lineHeight-[1.7] leading-relaxed">{desc}</div>
    </motion.div>
  );
}

// ━━ MAIN LANDING PAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Landing() {
  const navigate = useNavigate();
  const [activeArtist, setActiveArtist] = useState("waffles");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "Artist", message: "" });
  const [error, setError] = useState("");

  const shows = activeArtist === "waffles" ? wafflesShows : metroShows;
  const artistName = activeArtist === "waffles" ? "Uncle Waffles" : "Metro Boomin & Future";
  const tourName = activeArtist === "waffles" ? "2026 Tour Dates" : "We Trust You Tour";

  const allShows = [...wafflesShows, ...metroShows];
  const globalGross = allShows.reduce((s, sh) => s + sh.gross, 0);
  const globalSold = allShows.reduce((s, sh) => s + sh.sold, 0);
  const globalCap = allShows.reduce((s, sh) => s + sh.cap, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0A0C10] text-white min-h-screen font-instrument selection:bg-[#2E66FF]/40 overflow-x-hidden scroll-smooth">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-[100] flex justify-between items-center px-6 md:px-10 py-4 bg-[#0A0C10]/90 backdrop-blur-xl border-b border-[#242A35]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#2E66FF] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="10" height="2.5" rx="0.5" fill="white"/>
              <rect x="2" y="5.75" width="10" height="2.5" rx="0.5" fill="white"/>
              <rect x="2" y="9.5" width="10" height="2.5" rx="0.5" fill="white"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight">GTI</span>
          <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#2E66FF]/15 text-[#2E66FF] font-mono">V1</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-[13px] text-[#94A3B8]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
          <a href="#confidence" className="hover:text-white transition-colors">Confidence</a>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 rounded-md bg-[#2E66FF] text-white text-[13px] font-semibold hover:bg-[#2E66FF]/90 transition-all active:scale-95"
        >
          Request Access
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          }} 
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2E66FF]/10 border border-[#2E66FF]/20 text-xs font-semibold text-[#2E66FF] mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Global Touring Intelligence
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-tight max-w-4xl mb-6"
        >
          The operating system<br />
          for <span className="text-[#2E66FF]">global tours</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-[#94A3B8] leading-relaxed max-w-xl mb-10"
        >
          GTI transforms fragmented settlement data into unified intelligence.
          Real-time pacing, financial waterfalls, and market-by-market analytics
          — in one institutional-grade platform.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <button 
            onClick={() => navigate("/app/health")}
            className="px-8 py-3.5 rounded-md bg-[#2E66FF] text-white text-sm font-bold hover:bg-[#2E66FF]/90 transition-all active:scale-95 shadow-lg shadow-[#2E66FF]/20"
          >
            Launch Dashboard →
          </button>
          <button 
            onClick={() => document.getElementById('intelligence')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-md border border-[#242A35] text-[#94A3B8] text-sm font-semibold hover:bg-white/5 transition-all"
          >
            View Demo Data
          </button>
        </motion.div>

        {/* Global KPIs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#242A35] rounded-lg overflow-hidden mt-20 shadow-2xl border border-[#242A35]"
        >
          {[
            { label: "Global Gross", value: <Counter end={Math.round(globalGross / 1e6)} prefix="$" suffix="M" />, sub: "Across 20 shows" },
            { label: "Sell-Through", value: <Counter end={pct(globalSold, globalCap)} suffix="%" />, sub: "Average pacing" },
            { label: "Sold Out", value: <Counter end={allShows.filter(s => s.status === "sold_out").length} />, sub: "Of 20 dates" },
            { label: "Cold Zones", value: <Counter end={allShows.filter(s => s.status === "cold_zone").length} />, sub: "Requiring action" },
          ].map((kpi, i) => (
            <div key={i} className="p-6 md:p-8 bg-[#12151C]">
              <div className="text-[10px] font-bold tracking-widest text-[#475569] uppercase font-mono mb-2">
                {kpi.label}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tighter">
                {kpi.value}
              </div>
              <div className="text-[11px] text-[#475569] mt-1.5">{kpi.sub}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-[10px] font-bold tracking-[0.12em] text-[#2E66FF] uppercase font-mono mb-4">
          Core Modules
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
          Everything the touring team needs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <Feature icon="◎" title="Tour Health" desc="Real-time performance metrics and market-by-market pacing analysis with cold zone detection." accent="text-[#10B981]" />
          <Feature icon="◈" title="Roadmap" desc="Centralized timeline with venue metadata, geographic context, and expandable show intelligence." accent="text-[#2E66FF]" />
          <Feature icon="◇" title="Financial Wallet" desc="Transparent waterfalls from gross to net take-home. Every dollar tracked with confidence scoring." accent="text-[#F59E0B]" />
          <Feature icon="⬡" title="Admin Portal" desc="AI-powered ingestion of raw settlement reports. Parse, review, diff, and publish in minutes." accent="text-[#EF4444]" />
        </div>
      </section>

      {/* ── INTELLIGENCE SECTION ── */}
      <section id="intelligence" className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-[10px] font-bold tracking-[0.12em] text-[#2E66FF] uppercase font-mono mb-4">
          Live Intelligence
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Two tours. One platform.
        </h2>
        <p className="text-sm md:text-base text-[#94A3B8] mb-10 max-w-lg">
          Toggle between artists to see how GTI surfaces actionable intelligence across different tour profiles and markets.
        </p>

        {/* Artist Toggle */}
        <div className="inline-flex p-1 rounded-lg bg-[#12151C] border border-[#242A35] mb-8">
          {[
            { key: "waffles", label: "Uncle Waffles", sub: "Europe · 8 shows" },
            { key: "metro", label: "Metro Boomin & Future", sub: "US Arena · 12 shows" },
          ].map(a => (
            <button
              key={a.key}
              onClick={() => setActiveArtist(a.key)}
              className={cn(
                "px-5 py-2.5 rounded-md text-left transition-all",
                activeArtist === a.key ? "bg-[#1C212B] shadow-lg" : "hover:bg-white/5"
              )}
            >
              <div className={cn("text-[13px] font-bold", activeArtist === a.key ? "text-white" : "text-[#94A3B8]")}>
                {a.label}
              </div>
              <div className="text-[10px] text-[#475569] mt-0.5 font-medium">{a.sub}</div>
            </button>
          ))}
        </div>

        {/* Roadmap */}
        <RoadmapTable shows={shows} artist={artistName} tour={tourName} />
      </section>

      {/* ── AGENT INSIGHTS ── */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-[10px] font-bold tracking-[0.12em] text-[#F59E0B] uppercase font-mono mb-4">
          Agent-Grade Intelligence
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
          Insights that move the needle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "🔥", text: "Atlanta sold out with 14 days left. High secondary market risk — consider dynamic pricing.", color: "border-[#10B981]" },
            { icon: "🧊", text: "Chicago (Grant Park) pacing at 44%. 28,000 unsold = $3.5M gross at risk. Marketing push recommended.", color: "border-[#EF4444]" },
            { icon: "📈", text: "Saint Paul 7-day velocity is 2.1× tour average. Viral momentum detected — hold promo spend.", color: "border-[#2E66FF]" },
            { icon: "💰", text: "Paris Hippodrome production costs 18% above tour average. Renegotiate venue fees before settlement.", color: "border-[#F59E0B]" },
            { icon: "🎯", text: "Toronto campaign: $450 spend → 120 conversions = $3.75 CPA. Increase budget by 3×.", color: "border-[#10B981]" },
            { icon: "⚠️", text: "4 EU-leg shows missing final settlements. Using AI estimates (0.7 confidence). Upload actuals.", color: "border-[#F59E0B]" },
          ].map((insight, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex gap-4 p-5 bg-[#12151C] border border-[#242A35] rounded-lg border-l-4 shadow-md",
                insight.color
              )}
            >
              <span className="text-xl shrink-0">{insight.icon}</span>
              <p className="text-[13px] text-[#94A3B8] leading-relaxed">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CONFIDENCE SYSTEM ── */}
      <section id="confidence" className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="text-[10px] font-bold tracking-[0.12em] text-[#10B981] uppercase font-mono mb-4">
              Data Integrity
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Every number has a source
            </h2>
            <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed mb-10">
              GTI's confidence scoring system distinguishes between hard settlement data and AI-estimated projections. No more guessing which numbers are real.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "CONFIRMED", desc: "Final settlement uploaded, verified", conf: "1.0", color: "text-[#10B981]", borderColor: "border-[#10B981]/20" },
                { label: "ESTIMATED", desc: "AI projection from partial data", conf: "0.5–0.9", color: "text-[#F59E0B]", borderColor: "border-[#F59E0B]/20" },
                { label: "PARTIAL", desc: "Incomplete source, low reliability", conf: "< 0.5", color: "text-[#EF4444]", borderColor: "border-[#EF4444]/20" },
              ].map(tier => (
                <div key={tier.label} className="flex items-center gap-4 p-4 bg-[#12151C] border border-[#242A35] rounded-lg">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest font-mono border",
                    tier.color, tier.borderColor
                  )}>{tier.label}</span>
                  <span className="text-[13px] text-[#94A3B8] flex-1">{tier.desc}</span>
                  <span className={cn("text-xs font-mono font-bold", tier.color)}>{tier.conf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial waterfall preview */}
          <div className="bg-[#12151C] border border-[#242A35] rounded-lg p-6 md:p-8 shadow-2xl">
            <div className="text-[10px] font-bold tracking-widest text-[#475569] uppercase font-mono mb-6">
              Net Payout Waterfall · Atlanta
            </div>
            <div className="space-y-0.5">
              {[
                { label: "Ticket Gross", val: "$1,155,000", color: "text-white", indent: false },
                { label: "− Venue Fees (15%)", val: "−$173,250", color: "text-[#EF4444]", indent: true },
                { label: "Adjusted Gross", val: "$981,750", color: "text-[#94A3B8]", indent: false },
                { label: "+ Merch Net (Est)", val: "+$178,500", color: "text-[#10B981]", indent: true },
                { label: "+ VIP Revenue (Est)", val: "+$252,000", color: "text-[#10B981]", indent: true },
                { label: "Net Revenue", val: "$1,412,250", color: "text-white", indent: false },
                { label: "− Production", val: "−$45,000", color: "text-[#EF4444]", indent: true },
                { label: "− Travel", val: "−$5,000", color: "text-[#EF4444]", indent: true },
                { label: "− Crew", val: "−$35,000", color: "text-[#EF4444]", indent: true },
                { label: "Gross Profit", val: "$1,327,250", color: "text-white", indent: false, bold: true },
                { label: "Artist Share (85%)", val: "$1,128,163", color: "text-[#2E66FF]", indent: false },
                { label: "− Management (15%)", val: "−$169,224", color: "text-[#475569]", indent: true },
                { label: "− Agent (10%)", val: "−$112,816", color: "text-[#475569]", indent: true },
                { label: "− Tax Reserve (20%)", val: "−$225,633", color: "text-[#475569]", indent: true },
              ].map((row, i) => (
                <div key={i} className={cn(
                  "flex justify-between items-center py-1.5 border-b border-[#242A35]/30",
                  row.bold && "border-b-[#3B4455] py-2.5",
                  row.indent && "pl-4"
                )}>
                  <span className={cn(
                    "text-xs",
                    row.indent ? "text-[#475569]" : "text-[#94A3B8]",
                    row.bold && "font-bold text-white"
                  )}>
                    {row.label}
                  </span>
                  <span className={cn(
                    "text-xs font-mono font-medium",
                    row.color,
                    row.bold && "font-bold"
                  )}>{row.val}</span>
                </div>
              ))}
            </div>
            {/* Final */}
            <div className="flex justify-between items-center pt-6 pb-1">
              <span className="text-sm font-bold text-[#10B981]">Est. Net Take-Home</span>
              <span className="text-2xl font-bold text-[#10B981] font-mono tracking-tighter">$620,490</span>
            </div>
            <div className="text-[10px] text-[#475569] text-right font-mono font-medium">
              Confidence: 0.82 · ESTIMATED
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 md:px-10 text-center border-t border-[#242A35] bg-gradient-to-b from-transparent to-[#2E66FF]/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to see your tour data?
          </h2>
          <p className="text-base md:text-lg text-[#94A3B8] leading-relaxed mb-10">
            GTI V1 is in private beta for select artists, managers, and agencies.
            Request access to bring institutional-grade intelligence to your touring operation.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 rounded-md bg-[#2E66FF] text-white text-base font-bold hover:bg-[#2E66FF]/90 transition-all active:scale-95 shadow-xl shadow-[#2E66FF]/20"
          >
            Request Access →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 md:px-10 border-t border-[#242A35] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#475569]">
        <div className="font-medium">GTI — Global Touring Intelligence · V1.0</div>
        <div className="font-mono font-bold flex items-center gap-2">
          Data Integrity: <span className="text-[#10B981]">●</span> <span className="uppercase tracking-widest">Operational</span>
        </div>
      </footer>

      {/* ── REQUEST ACCESS MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0A0C10]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#12151C] border border-[#242A35] rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Request Access</h3>
                    <p className="text-sm text-[#94A3B8] mt-1">Join the waitlist for GTI V1 Private Beta.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 5L5 15M5 5l10 10" />
                    </svg>
                  </button>
                </div>

                {isSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mx-auto">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-white">You're on the list!</h4>
                    <p className="text-[#94A3B8] text-sm">We'll reach out to you at <span className="text-white font-medium">{formData.email}</span> as soon as a spot opens up.</p>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-3 bg-[#2E66FF] text-white rounded-md font-bold text-sm mt-4"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Full Name</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#0A0C10] border border-[#242A35] rounded-md px-4 py-2.5 text-sm text-white outline-none focus:border-[#2E66FF] transition-colors"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Email Address</label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-[#0A0C10] border border-[#242A35] rounded-md px-4 py-2.5 text-sm text-white outline-none focus:border-[#2E66FF] transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Role</label>
                      <select 
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full bg-[#0A0C10] border border-[#242A35] rounded-md px-4 py-2.5 text-sm text-white outline-none focus:border-[#2E66FF] transition-colors appearance-none"
                      >
                        <option>Artist</option>
                        <option>Manager</option>
                        <option>Agent</option>
                        <option>Label</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Message (Optional)</label>
                      <textarea 
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-[#0A0C10] border border-[#242A35] rounded-md px-4 py-2.5 text-sm text-white outline-none focus:border-[#2E66FF] transition-colors h-24 resize-none"
                        placeholder="Tell us about your tour..."
                      />
                    </div>
                    
                    {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}

                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full py-3.5 bg-[#2E66FF] text-white rounded-md font-bold text-sm mt-2 flex items-center justify-center gap-2 hover:bg-[#2E66FF]/90 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Join Waitlist"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #242A35; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3B4455; }
      `}</style>
    </div>
  );
}
