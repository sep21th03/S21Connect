import React, { FC, useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import CreatePagePost from "@/Common/CreatePost/CreatePagePost";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import { usePageInfo } from "@/contexts/PageInfoContext";
import { Page } from "@/service/fanpageService";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";
import { useInfiniteScrollForProfile } from "@/hooks/useInfiniteScrollForProfile";

interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

const ContentCenter: FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const pageInfo = usePageInfo() as unknown as Page;
  
  const [postsFetched, setPostsFetched] = useState(false);

  const isOwnPage = useMemo(() => {
    if (!pageInfo?.admins || !user?.id) return false;
    return pageInfo.admins.some(admin => admin.id === user.id);
  }, [pageInfo?.admins, user?.id]);

  const pageId = useMemo(
    () => pageInfo?.id || null,
    [pageInfo?.id]
  );

  const loadPosts = useMemo(() => {
    return async (page: number) => {
      if (!pageId) return { data: [], has_more: false };

      try {
        setPostsFetched(true);
        const endpoint = API_ENDPOINTS.POSTS.PAGES.GET_PAGE_POSTS(pageId);

        const res = await axiosInstance.get(endpoint, {
          params: {
            limit: 5,
            page,
            page_id: pageId,
          },
        });

        return {
          data: res.data.data || [],
          has_more: res.data.has_more !== undefined ? res.data.has_more : false,
        };
      } catch (error) {
        console.error("Error loading page posts:", error);
        return { data: [], has_more: false };
      }
    };
  }, [pageId]);

  const {
    items: posts,
    loading: postLoading,
    hasMore,
    error: postError,
    resetItems,
  } = useInfiniteScrollForProfile<Post>({
    limit: 5,
    onLoadMore: loadPosts,
    dependencyArray: [pageId],
  });

  const renderPost = (post: Post) => {
    const commonProps = {
      key: post.id,
      post,
      shouldOpenComments: false,
      highlightCommentId: null,
      highlightReplyId: null,
      isShared: false,
    };

    switch (post.type) {
      case "first":
        return <SufiyaElizaFirstPost {...commonProps} />;
      case "multiple":
        return <SufiyaElizaMultiplePost {...commonProps} />;
      case "third":
        return <SufiyaElizaThirdPost {...commonProps} />;
      case "second":
      default:
        return <SufiyaElizaSecondPost {...commonProps} />;
    }
  };

  return (
    <div className="content-center">
      {isOwnPage && pageId && (
        <CreatePagePost 
          pageId={pageId} 
          onPostCreated={resetItems} 
        />
      )}
      
      <div className="overlay-bg" />
      <div className="post-panel infinite-loader-sec section-t-space">
        {postLoading && !postsFetched ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : posts.length > 0 ? (
          posts.map(renderPost)
        ) : (
          <div className="no-posts-message text-center p-4">
            <h5>Không có bảng tin nào để hiển thị</h5>
            {isOwnPage && (
              <p>Tạo bảng tin đầu tiên cho trang của bạn!</p>
            )}
          </div>
        )}

        {postLoading && postsFetched && (
          <div className="text-center p-3">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Đang tải thêm...</span>
            </div>
          </div>
        )}

        {postError && (
          <div className="alert alert-danger text-center mt-3">
            Lỗi tải bảng tin. Vui lòng thử lại.
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center text-muted p-3">
            <small>Không có bảng tin nào để tải thêm</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCenter;