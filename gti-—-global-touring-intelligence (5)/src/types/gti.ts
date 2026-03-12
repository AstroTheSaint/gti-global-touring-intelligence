export interface Show {
  id: string;
  tour_id: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  capacity: number;
  sold: number;
  available: number;
  gross: number;
  total_revenue: number;
  total_expense: number;
  completeness_score: number;
  lat: number;
  lng: number;
  status: 'announced' | 'on_sale' | 'sold_out' | 'past' | 'cancelled';
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

export interface TicketingSnapshot {
  id: number;
  show_id: string;
  timestamp: string;
  sold: number;
  available: number;
  gross: number;
}

export interface LedgerEntry {
  id: number;
  show_id: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  status: 'confirmed' | 'estimated';
  confidence: number;
}
