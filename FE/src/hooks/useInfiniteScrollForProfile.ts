import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions<T> {
  initialPage?: number;
  limit?: number;
  threshold?: number;
  onLoadMore: (page: number) => Promise<LoadMoreResponse<T>>;
  dependencyArray?: any[];
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

interface LoadMoreResponse<T> {
  data: T[];
  has_more: boolean;
}

export const useInfiniteScrollForProfile = <T>({
  initialPage = 1,
  limit = 10,
  threshold = 200,
  onLoadMore,
  dependencyArray = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoadRef = useRef(false);
  const dependencyRef = useRef(dependencyArray);

  const haveDependenciesChanged = () => {
    if (dependencyArray.length !== dependencyRef.current.length) return true;
    
    return dependencyArray.some((dep, index) => 
      dep !== dependencyRef.current[index]
    );
  };

  const loadItems = useCallback(
    async (pageNumber: number, append = true) => {
      if (pageNumber === initialPage && 
          dependencyArray.some(dep => dep === null || dep === undefined)) {
        return [];
      }
      
      try {
        setLoading(true);
        setError(null);

        const { data: newItems, has_more } = await onLoadMore(pageNumber);

        setItems((prevItems) =>
          append ? [...prevItems, ...newItems] : [...newItems]
        );
        setHasMore(has_more !== undefined ? has_more : newItems.length === limit);
        return newItems;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [onLoadMore, limit, initialPage]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, threshold]);

  // Load more when page changes
  useEffect(() => {
    // Only load more if not the initial page
    if (page > initialPage && initialLoadRef.current) {
      loadItems(page, true);
    }
  }, [page, initialPage, loadItems]);

  // Initial load or reload when dependencies change
  useEffect(() => {
    // Skip the initial load if dependencies are not ready
    if (dependencyArray.some(dep => dep === null || dep === undefined)) {
      return;
    }
    
    // Check if dependencies have changed
    const depsChanged = haveDependenciesChanged();
    
    if (!initialLoadRef.current || depsChanged) {
      // Reset state when dependencies change
      if (depsChanged && initialLoadRef.current) {
        setItems([]);
        setPage(initialPage);
        setHasMore(true);
      }
      
      loadItems(initialPage, false);
      initialLoadRef.current = true;
      dependencyRef.current = [...dependencyArray];
    }
  }, [initialPage, loadItems, ...dependencyArray]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(initialPage);
    setItems([]);
    setHasMore(true);

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
    resetItems,
  };
};