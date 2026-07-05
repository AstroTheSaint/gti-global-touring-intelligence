import { COMPACT_CSV_SHOWS } from '../data/csvToursData';
import { BOX_OFFICE_DATA } from '../data/industryData';

/** Hero stat bar — sourced only from csvToursData row tuples. */
export function getCsvTourStats() {
  const totalShows = COMPACT_CSV_SHOWS.length;
  const totalGross = COMPACT_CSV_SHOWS.reduce((sum, row) => sum + row[3], 0);
  const uniqueArtists = new Set(COMPACT_CSV_SHOWS.map((row) => row[2])).size;

  return { totalShows, totalGross, uniqueArtists };
}

/** Supplemental box-office aggregate (used for footnotes / secondary display if needed). */
export function getBoxOfficeStats() {
  const totalShows = BOX_OFFICE_DATA.length;
  const totalGross = BOX_OFFICE_DATA.reduce((sum, row) => sum + row.revenue, 0);
  const uniqueArtists = new Set(BOX_OFFICE_DATA.map((row) => row.artist)).size;

  return { totalShows, totalGross, uniqueArtists };
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
