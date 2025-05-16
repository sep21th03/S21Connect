import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  initialPage?: number;
  limit?: number;
  threshold?: number;
  onLoadMore: (page: number) => Promise<any[]>;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
  resetItems: () => void;
}

export const useInfiniteScroll = <T>({
  initialPage = 1,
  limit = 10,
  threshold = 200,
  onLoadMore,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial load and load more functionality
  const loadItems = useCallback(async (pageNumber: number, append = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const newItems = await onLoadMore(pageNumber);
      
      setItems(prevItems => append ? [...prevItems, ...newItems] : [...newItems]);
      setHasMore(newItems.length === limit);
      return newItems;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
      return [];
    } finally {
      setLoading(false);
    }
  }, [limit, onLoadMore]);

  // Handle scroll event to load more
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      if (!loading && hasMore && scrollTop + clientHeight >= scrollHeight - threshold) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, threshold]);

  // Load more when page changes
  useEffect(() => {
    if (page > initialPage) {
      loadItems(page);
    }
  }, [page, initialPage, loadItems]);

  // Initial load
  useEffect(() => {
    loadItems(initialPage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull to refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(initialPage);
    
    try {
      await loadItems(initialPage, false);
    } finally {
      setRefreshing(false);
    }
  };

  // Reset items
  const resetItems = () => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    loadItems(initialPage, false);
  };

  return {
    items,
    loading,
    error,
    hasMore,
    refreshing,
    handleRefresh,
    resetItems
  };
};