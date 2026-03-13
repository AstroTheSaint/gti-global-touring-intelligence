import { useState, useEffect, useCallback } from 'react';
import { Show, TourSummary } from '../types';
import { useAppContext } from '../context/AppContext';

interface TourData {
  shows: Show[];
  summary: TourSummary | null;
  ledger: any[];
  snapshots: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTourData(tourId: string | null): TourData {
  const { startLoading, stopLoading } = useAppContext();
  const [shows, setShows] = useState<Show[]>([]);
  const [summary, setSummary] = useState<TourSummary | null>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tourId) return;
    
    setLoading(true);
    startLoading();
    setError(null);
    
    try {
      const [showsRes, summaryRes, ledgerRes, snapshotsRes] = await Promise.all([
        fetch(`/api/tour/${tourId}/shows`),
        fetch(`/api/tour/${tourId}/summary`),
        fetch(`/api/tour/${tourId}/ledger`),
        fetch(`/api/tour/${tourId}/snapshots`)
      ]);

      if (!showsRes.ok) throw new Error(`Failed to fetch shows: ${showsRes.status}`);
      if (!summaryRes.ok) throw new Error(`Failed to fetch summary: ${summaryRes.status}`);
      if (!ledgerRes.ok) throw new Error(`Failed to fetch ledger: ${ledgerRes.status}`);
      if (!snapshotsRes.ok) throw new Error(`Failed to fetch snapshots: ${snapshotsRes.status}`);

      const [showsData, summaryData, ledgerData, snapshotsData] = await Promise.all([
        showsRes.json(),
        summaryRes.json(),
        ledgerRes.json(),
        snapshotsRes.json()
      ]);

      setShows(showsData);
      setSummary(summaryData);
      setLedger(ledgerData);
      setSnapshots(snapshotsData);
    } catch (err: any) {
      console.error("useTourData error:", err);
      fetch('/api/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message, stack: err.stack, name: err.name }) }).catch(() => {});
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [tourId, startLoading, stopLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { shows, summary, ledger, snapshots, loading, error, refetch: fetchData };
}
