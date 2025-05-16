import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/utils/axiosInstance';
import { API_ENDPOINTS } from '@/utils/constant/api';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Post } from '@/components/NewsFeed/Style1/Style1Types';
import SufiyaElizaFirstPost from './SufiyaElizaFirstPost';
import SufiyaElizaSecondPost from './SufiyaElizaSecondPost';
import SufiyaElizaThirdPost from './SufiyaElizaThirdPost';
import SufiyaElizaMultiplePost from '@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost';
import FriendSuggestion from './FriendSuggestion';
import { PulseLoader } from 'react-spinners';

const PostPanel: React.FC = () => {
  const { data: session } = useSession();
  const refreshRef = useRef<HTMLDivElement>(null);
  const [refreshStartY, setRefreshStartY] = useState<number | null>(null);
  const [refreshDist, setRefreshDist] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFriendSuggestion, setShowFriendSuggestion] = useState(true);

  const fetchPosts = useCallback(async (page: number) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.POSTS.GET_NEWSFEED}?page=${page}&limit=5`
    );
    return response.data || [];
  }, []);
  

  const {
    items: posts,
    loading,
    error,
    hasMore,
    refreshing,
    handleRefresh,
  } = useInfiniteScroll<Post>({
    initialPage: 1,
    limit: 5,
    onLoadMore: fetchPosts,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop === 0) {
      setRefreshStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshStartY !== null) {
      const y = e.touches[0].clientY;
      const dist = Math.max(0, y - refreshStartY);
      
      const resistance = 0.4;
      const pullDistance = Math.min(100, dist * resistance);
      
      setRefreshDist(pullDistance);
      
      if (pullDistance > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (refreshDist > 50) {
      setIsRefreshing(true);
      
      handleRefresh().then(() => {
        setIsRefreshing(false);
      });
    }
    
    setRefreshStartY(null);
    setRefreshDist(0);
  };

  const pullToRefreshStyle = {
    height: `${refreshDist}px`,
    transition: isRefreshing ? 'none' : 'height 0.2s ease-out',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  const renderPost = (post: Post) => {
    switch (post.type) {
      case 'first':
        return <SufiyaElizaFirstPost key={post.id} post={post} />;
      case 'multiple':
        return <SufiyaElizaMultiplePost key={post.id} post={post} />;
      case 'third':
        return <SufiyaElizaThirdPost key={post.id} post={post} />;
      case 'second':
      default:
        return <SufiyaElizaSecondPost key={post.id} post={post} />;
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div ref={refreshRef} style={pullToRefreshStyle}>
        {(refreshDist > 0 || isRefreshing) && (
          <div className="refresh-indicator">
            {isRefreshing ? (
              <PulseLoader size={10} color="#1877F2" />
            ) : (
              <div className="pull-text">
                {refreshDist > 50 ? 'Release to refresh' : 'Pull to refresh'}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-panel infinite-loader-sec section-t-space">
        {posts.map((post, index) => {
          // Insert friend suggestion after second post
          if (index === 1 && showFriendSuggestion) {
            return (
              <React.Fragment key={`fragment-${post.id}`}>
                {renderPost(post)}
                <FriendSuggestion />
              </React.Fragment>
            );
          }
          return renderPost(post);
        })}
        
        {/* Loading indicator */}
        {loading && (
          <div className="loading-indicator text-center my-4">
            <PulseLoader size={10} color="#1877F2" />
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="error-message text-center my-4 text-danger">
            <p>{error}</p>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={() => handleRefresh()}
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* End of feed message */}
        {!loading && !hasMore && posts.length > 0 && (
          <div className="end-of-feed text-center my-4 text-muted">
            <p>You've reached the end of your feed</p>
          </div>
        )}
        
        {/* Empty feed message */}
        {!loading && posts.length === 0 && (
          <div className="empty-feed text-center my-4">
            <h5>No posts to display</h5>
            <p>Follow more friends to see their updates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPanel;