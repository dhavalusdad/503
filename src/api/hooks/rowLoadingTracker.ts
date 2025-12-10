import { useState, useCallback } from 'react';

export function useRowLoadingTracker() {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingMap(prev => ({ ...prev, [key]: value }));
  }, []);

  return { loadingMap, setLoading };
}
