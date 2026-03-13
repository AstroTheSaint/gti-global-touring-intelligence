import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Artist {
  id: string;
  name: string;
  team: string;
  currency: string;
}

export interface Tour {
  id: string;
  artist_id: string;
  name: string;
  status: string;
}

export interface Show {
  id: string;
  tour_id: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  capacity: number;
  ticket_link: string;
  status: string;
  lat: number;
  lng: number;
  sold: number;
  available: number;
  gross: number;
  total_revenue: number;
  total_expense: number;
  completeness_score: number;
  campaign_count?: number;
  total_conversions?: number;
}

export interface Campaign {
  id: number;
  show_id: string;
  name: string;
  status: string;
  budget: number;
  spend: number;
  clicks: number;
  conversions: number;
}

export interface LedgerItem {
  id: number;
  show_id: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  status: 'estimated' | 'reported' | 'verified' | 'settled';
}

export interface TourSummary {
  total_shows: number;
  total_sold: number;
  total_capacity: number;
  total_gross: number;
  upcoming_shows: number;
  total_revenue: number;
  total_expense: number;
}
