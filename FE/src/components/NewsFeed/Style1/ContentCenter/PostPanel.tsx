import React, { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/utils/axiosInstance';
import { API_ENDPOINTS } from '@/utils/constant/api';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Post } from '@/components/NewsFeed/Style1/Style1Types';
import SufiyaElizaFirstPost from './SufiyaElizaFirstPost';
import SufiyaElizaSecondPost from './SufiyaElizaSecondPost';
import SufiyaElizaThirdPost from './SufiyaElizaThirdPost';
import SufiyaElizaMultiplePost from '@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost';
// import FriendSuggestion from './FriendSuggestion';
import { PulseLoader } from 'react-spinners';
import dynamic from 'next/dynamic';
import { useInView } from "react-intersection-observer";
const FriendSuggestion = dynamic(
  () => import("./FriendSuggestion"),
  { ssr: false }
);

const PostPanel: React.FC = () => {
  const [showFriendSuggestion, setShowFriendSuggestion] = useState(true);

  const refreshRef = useRef<HTMLDivElement>(null);
  const [refreshStartY, setRefreshStartY] = useState<number | null>(null);
  const [refreshDist, setRefreshDist] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,    
  });
  const fetchPosts = useCallback(async (cursor?: string) => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.POSTS.GET_NEWSFEED}?limit=5${cursor ? `&after=${cursor}` : ''}`
      );
      
      return {
        data: response.data?.data || response.data || [],
        next_cursor: response.data?.next_cursor || 
                     (response.data?.[response.data.length - 1]?.created_at) || null,
        has_more: response.data?.has_more !== undefined 
                  ? response.data.has_more 
                  : response.data?.length >= 5
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, []);

  const {
    items: posts,
    loading,
    initialLoading,
    error,
    hasMore,
    refreshing,
    refresh,
    loadMore,
  } = useInfiniteScroll<Post>({
    fetchFn: fetchPosts,
    threshold: 300,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 5) {
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
    if (refreshDist > 50 && !refreshing && !isManualRefreshing) {
      setIsManualRefreshing(true);
      
      refresh().finally(() => {
        setIsManualRefreshing(false);
      });
    }
    
    setRefreshStartY(null);
    setRefreshDist(0);
  };

  const pullToRefreshStyle = {
    height: `${refreshDist}px`,
    transition: isManualRefreshing ? 'none' : 'height 0.2s ease-out',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const renderPost = (post: Post) => {
    switch (post.type) {
      case 'first':
        return <SufiyaElizaFirstPost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} />;
      case 'multiple':
        return <SufiyaElizaMultiplePost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} />;
      case 'third':
        return <SufiyaElizaThirdPost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} />;
      case 'second':
      default:
        return <SufiyaElizaSecondPost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} />;
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={refreshRef} style={pullToRefreshStyle}>
        {(refreshDist > 0 || isManualRefreshing) && (
          <div className="refresh-indicator">
            {isManualRefreshing || refreshing ? (
              <PulseLoader size={10} color="#1877F2" />
            ) : (
              <div className="pull-text">
                {refreshDist > 50 ? 'Thả để tải lại' : 'Kéo xuống để tải lại'}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-panel infinite-loader-sec section-t-space">
        {initialLoading && (
          <div className="initial-loading text-center my-4 py-4">
            <PulseLoader size={12} color="#1877F2" />
            <p className="mt-2">Đang tải bảng tin...</p>
          </div>
        )}
        
        {!initialLoading && posts.map((post, index) => {
          if (index === 1 && showFriendSuggestion) {
            return (
              <React.Fragment key={`fragment-${post.id}`}>
                {renderPost(post)}
                <div ref={ref} className="d-xl-block d-none">
                  {inView && <FriendSuggestion />}
                </div>
              </React.Fragment>
            );
          }
          return renderPost(post);
        })}
        
        {loading && !initialLoading && (
          <div className="loading-indicator text-center my-3 py-2">
            <PulseLoader size={8} color="#1877F2" />
          </div>
        )}
        
        {error && (
          <div className="error-message text-center my-4 text-danger">
            <p>{error.message || 'An error occurred while loading posts'}</p>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={() => refresh()}
            >
              Thử lại
            </button>
          </div>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
          <div className="end-of-feed text-center my-4 text-muted py-3">
            <p>Bảng tin đã hết</p>
          </div>
        )}
        
        {!initialLoading && !loading && posts.length === 0 && (
          <div className="empty-feed text-center my-4 py-4">
            <h5>Không có bảng tin nào để hiển thị</h5>
            <p>Theo dõi thêm bạn bè để xem cập nhật của họ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPanel;