import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useApi } from './useApi';
import { Artist, Tour } from '../types';

export function useArtist() {
  const { selectedArtistId, setSelectedArtistId, selectedTourId, setSelectedTourId } = useAppContext();
  
  const { data: artists } = useApi<Artist[]>('/api/artists');
  const { data: artist } = useApi<Artist>(selectedArtistId ? `/api/artist/${selectedArtistId}` : null);
  const { data: tours } = useApi<Tour[]>(selectedArtistId ? `/api/artist/${selectedArtistId}/tours` : null);

  const currentTour = tours?.find(t => t.id === selectedTourId) || null;

  // Auto-select first artist and tour if none selected
  useEffect(() => {
    if (artists?.length && !selectedArtistId) {
      setSelectedArtistId(artists[0].id);
    }
  }, [artists, selectedArtistId, setSelectedArtistId]);

  useEffect(() => {
    if (tours?.length && !selectedTourId) {
      setSelectedTourId(tours[0].id);
    }
  }, [tours, selectedTourId, setSelectedTourId]);

  return {
    artists,
    artist,
    tours,
    currentTour,
    setArtistId: setSelectedArtistId,
    setTourId: setSelectedTourId
  };
}
