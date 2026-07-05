import React from 'react';
import { Lock } from 'lucide-react';
import {
  GLOBAL_TOURING_RANKINGS,
  getDemographicEstimation,
  TouringRanking,
} from '../../data/industryData';
import { formatCompactCurrency, formatNumber } from '../../lib/landingStats';

const VISIBLE_COUNT = 8;
const BLURRED_COUNT = 6;

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function RankingRow({
  item,
  showExtended = false,
  blurred = false,
}: {
  item: TouringRanking;
  showExtended?: boolean;
  blurred?: boolean;
}) {
  const demo = getDemographicEstimation(item.artist);
  const primaryAge =
    demo.age_18_24 >= demo.age_25_34
      ? `${Math.round(demo.age_18_24 * 100)}% 18–24`
      : `${Math.round(demo.age_25_34 * 100)}% 25–34`;

  const rowClass = blurred
    ? 'blur-[6px] select-none pointer-events-none opacity-40'
    : 'hover:bg-[#1C212B]/60';

  return (
    <tr className={`border-b border-[#242A35]/60 transition-colors ${rowClass}`}>
      <td className="py-3.5 px-4 text-center font-mono text-[#94A3B8] text-xs">{item.rank}</td>
      <td className="py-3.5 px-4">
        <span className="font-semibold text-white text-sm">{item.artist}</span>
        <span className="block text-[11px] text-[#2E66FF] mt-0.5">{item.tourName}</span>
      </td>
      <td className="py-3.5 px-4 text-right font-mono text-[#10B981] text-sm font-semibold">
        {formatCompactCurrency(item.grossUSD)}
      </td>
      <td className="py-3.5 px-4 text-right font-mono text-[#94A3B8] text-sm">
        {formatNumber(item.ticketsSold)}
      </td>
      {showExtended && (
        <>
          <td className="py-3.5 px-4 text-center text-xs text-[#94A3B8]">{primaryAge}</td>
          <td className="py-3.5 px-4 text-center font-mono text-xs text-[#94A3B8]">
            {formatNumber(item.ticketsSold)}
          </td>
          <td className="py-3.5 px-4 text-right font-mono text-xs text-[#94A3B8]">
            {formatCurrencyFull(item.averageTicketPrice)}
          </td>
        </>
      )}
    </tr>
  );
}

export default function LandingDataSection() {
  const visible = GLOBAL_TOURING_RANKINGS.slice(0, VISIBLE_COUNT);
  const blurred = GLOBAL_TOURING_RANKINGS.slice(VISIBLE_COUNT, VISIBLE_COUNT + BLURRED_COUNT);

  return (
    <section id="data-teaser" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E66FF] mb-2">
            Live Leaderboard
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Real touring data, updated continuously
          </h2>
          <p className="text-sm text-[#94A3B8] mt-3 max-w-xl mx-auto">
            Top global tours ranked by verified gross and ticket volume — pulled directly from{' '}
            <code className="text-[#2E66FF] text-xs">GLOBAL_TOURING_RANKINGS</code>.
          </p>
        </div>

        <div className="bg-[#12151C] border border-[#242A35] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead>
                <tr className="bg-[#1C212B] border-b border-[#242A35] text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-3 px-4 text-center w-14">Rank</th>
                  <th className="py-3 px-4">Artist / Tour</th>
                  <th className="py-3 px-4 text-right">Est. Gross</th>
                  <th className="py-3 px-4 text-right">Tickets Sold</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <RankingRow key={item.rank} item={item} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Blur wall — extended intelligence columns */}
          <div className="relative border-t border-[#242A35]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[960px]">
                <thead>
                  <tr className="bg-[#1C212B]/80 border-b border-[#242A35] text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    <th className="py-3 px-4 text-center w-14">Rank</th>
                    <th className="py-3 px-4">Artist / Tour</th>
                    <th className="py-3 px-4 text-right">Est. Gross</th>
                    <th className="py-3 px-4 text-right">Tickets Sold</th>
                    <th className="py-3 px-4 text-center">Audience Demographics</th>
                    <th className="py-3 px-4 text-center">Social Reach</th>
                    <th className="py-3 px-4 text-right">Per-Show Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {blurred.map((item) => (
                    <RankingRow key={item.rank} item={item} showExtended blurred />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0C10]/70 backdrop-blur-[2px]">
              <div className="w-12 h-12 rounded-full bg-[#2E66FF]/20 border border-[#2E66FF]/40 flex items-center justify-center mb-3">
                <Lock size={20} className="text-[#2E66FF]" />
              </div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                Unlock full intelligence
              </p>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-xs text-center">
                Demographics, reach, and per-show revenue for every ranked tour.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
