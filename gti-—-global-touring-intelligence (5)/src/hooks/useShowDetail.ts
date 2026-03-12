import { useState, useEffect, useCallback } from 'react';
import { Show } from '../types';
import { useAppContext } from '../context/AppContext';

interface ShowDetail {
  show: Show | null;
  snapshots: { sold: number, available: number, gross: number, timestamp: string }[];
  ledger: any[];
  campaigns: any[];
  loading: boolean;
  error: string | null;
}

export function useShowDetail(showId: string | null): ShowDetail {
  const { startLoading, stopLoading } = useAppContext();
  const [show, setShow] = useState<Show | null>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!showId) return;
    
    setLoading(true);
    startLoading();
    setError(null);
    
    try {
      const response = await fetch(`/api/show/${showId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch show detail');
      }
      const data = await response.json();
      setShow(data.show);
      setSnapshots(data.snapshots || []);
      setLedger(data.ledger || []);
      setCampaigns(data.campaigns || []);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [showId, startLoading, stopLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { show, snapshots, ledger, campaigns, loading, error };
}
