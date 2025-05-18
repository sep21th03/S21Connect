import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (cursor?: string) => Promise<{
    data: T[];
    next_cursor?: string | null;
    has_more: boolean;
  }>;
  initialData?: T[];
  threshold?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  initialLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  refreshing: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialData = [],
  threshold = 200,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>(initialData);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadingRef = useRef(false);

  useEffect(() => {
    if (enabled) {
      loadInitialData();
    }
  }, [enabled]);

  const loadInitialData = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      setInitialLoading(true);
      loadingRef.current = true;
      setError(null);
      
      const response = await fetchFn();
      setItems(response.data);
      setNextCursor(response.next_cursor || null);
      setHasMore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      setItems([]);
    } finally {
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFn]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || loadingRef.current || !nextCursor) return;
    
    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      
      const response = await fetchFn(nextCursor);
      
      setItems(prev => [...prev, ...response.data]);
      setNextCursor(response.next_cursor || null);
      setHasMore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more data'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [loading, hasMore, nextCursor, fetchFn]);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      setRefreshing(true);
      loadingRef.current = true;
      setError(null);
      
      const response = await fetchFn();
      
      setItems(response.data);
      setNextCursor(response.next_cursor || null);
      setHasMore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, [fetchFn]);

  const reset = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    setError(null);
    loadInitialData();
  }, [loadInitialData]);

  // Scroll event handler
  useEffect(() => {
    if (!enabled || !hasMore) return;
    
    const handleScroll = () => {
      if (loading || loadingRef.current) return;
      
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      // Load more when scrolled to threshold
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadMore, threshold, enabled]);

  return {
    items,
    loading,
    initialLoading,
    error,
    hasMore,
    refreshing,
    loadMore,
    refresh,
    reset,
  };
}