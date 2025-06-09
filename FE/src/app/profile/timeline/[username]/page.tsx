"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "reactstrap";

import CreatePost from "@/Common/CreatePost";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
// import FriendSuggestion from "@/components/NewsFeed/Style1/LeftContent/FriendSuggestion";
import LikePage from "@/components/NewsFeed/Style1/LeftContent/LikePage";
import EventsCard from "@/components/NewsFeed/Style1/ContentRight/EventsCard";
import Gallery from "@/components/NewsFeed/Style1/ContentRight/Gallery";
import AboutUser from "@/components/profile/AboutUser";
// import ActivityFeeds from "@/components/profile/ActivityFeeds";
import CollegeMeetCard from "@/components/profile/CollegeMeetCard";
import WorldWideTrend from "@/components/profile/WorldWideTrend";
import ProfileLayout from "@/layout/ProfileLayout";
import LoadingLoader from "@/layout/LoadingLoader";
import UserNotFound from "@/app/404/user/page";

import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { FullUserProfile } from "@/utils/interfaces/user";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";
import { useInfiniteScrollForProfile } from "@/hooks/useInfiniteScrollForProfile";

import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}


const FriendSuggestion = dynamic(
  () => import("@/components/NewsFeed/Style1/LeftContent/FriendSuggestion"),
  { ssr: false }
);

const ActivityFeeds = dynamic(
  () => import("@/components/profile/ActivityFeeds"),
  { ssr: false }
);



const ProfileTimeLine = () => {
  const { data: session } = useSession();
  const params = useParams();
  const username = params.username as string;

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,    
  });
  

  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  const [postsFetched, setPostsFetched] = useState(false);
  const [isFriendSection, setIsFriendSection] = useState(false);

  const isOwnProfile = useMemo(
    () => userProfile?.user.username === session?.user?.username,
    [userProfile?.user.username, session?.user?.username]
  );

  const userId = useMemo(
    () => userProfile?.user.id || null,
    [userProfile?.user.id]
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse<FullUserProfile>>(
          API_ENDPOINTS.PROFILE.USER_PROFILE(username)
        );
        setUserProfile(response.data.data);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
        console.timeEnd("fetchProfile");
      }
    };
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (!userId || isOwnProfile) return;

    const checkFriendshipStatus = async () => {
      try {
        const res = await axiosInstance.get(
          API_ENDPOINTS.FRIENDS.BASE +
            API_ENDPOINTS.FRIENDS.CHECK_STATUS(userId)
        );
        const status = res.data.status || "none";
        setFriendshipStatus(status);
      } catch (error) {
        console.error("Error checking friendship status:", error);
        setFriendshipStatus("none");
      }
    };

    checkFriendshipStatus();
  }, [userId, isOwnProfile]);

  const loadPosts = useMemo(() => {
    return async (page: number) => {
      if (!userId) return { data: [], has_more: false };

      try {
        setPostsFetched(true);
        const endpoint = isOwnProfile
          ? API_ENDPOINTS.POSTS.GET_MY_POSTS
          : API_ENDPOINTS.POSTS.GET_FRIEND_POSTS;

        const res = await axiosInstance.get(endpoint, {
          params: {
            limit: 5,
            page,
            user_id: isOwnProfile ? undefined : userId,
          },
        });

        return {
          data: res.data.data || [],
          has_more: res.data.has_more !== undefined ? res.data.has_more : false,
        };
      } catch (error) {
        console.error("Error loading posts:", error);
        return { data: [], has_more: false };
      }
    };
  }, [userId, isOwnProfile]);

  const {
    items: posts,
    loading: postLoading,
    hasMore,
    error: postError,
    resetItems,
  } = useInfiniteScrollForProfile<Post>({
    limit: 5,
    onLoadMore: loadPosts,
    dependencyArray: [userId, isOwnProfile],
  });

  if (loading) {
    return <LoadingLoader />;
  }

  if (error || !userProfile) {
    return <UserNotFound />;
  }

  const canViewPosts =
    isOwnProfile ||
    friendshipStatus === "accepted" ||
    friendshipStatus === "none";



  return (
    <ProfileLayout title="bảng tin" loaderName="profileTimeLine">
      <Container fluid className="section-t-space px-0 layout-default">
        <div className="page-content">
          <div className="content-left">
            <AboutUser userProfile={userProfile} isOwnProfile={isOwnProfile} />
            {isFriendSection && (
              <div ref={ref} className="d-xl-block d-none">
                {inView && <FriendSuggestion setIsFriendSection={setIsFriendSection} mainClassName="d-xl-block d-none" />}
              </div>
            )}

            <div className="sticky-top d-xl-block d-none">
              <LikePage />
            </div>
          </div>

          <div className="content-center">
            {isOwnProfile && <CreatePost onPostCreated={resetItems} />}
            <div className="overlay-bg" />
            <div className="post-panel infinite-loader-sec section-t-space">
              {postLoading && !postsFetched ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : canViewPosts ? (
                posts.length > 0 ? (
                  posts.map((post) => {
                    switch (post.type) {
                      case "first":
                        return (
                          <SufiyaElizaFirstPost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
                        );
                      case "multiple":
                        return (
                          <SufiyaElizaMultiplePost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
                        );
                      case "third":
                        return (
                          <SufiyaElizaThirdPost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
                        );
                      case "second":
                      default:
                        return (
                          <SufiyaElizaSecondPost key={post.id} post={post} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
                        );
                    }
                  })
                ) : (
                  <div className="no-posts-message text-center p-4">
                    <h5>Không có bảng tin nào để hiển thị</h5>
                    {isOwnProfile && (
                      <p>Tạo bảng tin đầu tiên để bắt đầu!</p>
                    )}
                  </div>
                )
              ) : (
                <div className="privacy-message text-center p-4">
                  <h5>Nội dung không khả dụng</h5>
                  {friendshipStatus === "pending_sent" && (
                    <p>
                      Lời mời kết bạn đã được gửi. Nội dung sẽ khả dụng khi
                      được chấp nhận.
                    </p>
                  )}
                  {friendshipStatus === "pending_received" && (
                    <p>Bạn có một yêu cầu kết bạn đang chờ xác nhận từ người dùng này.</p>
                  )}
                  {friendshipStatus === "none" && (
                    <p>Nội dung này chỉ được hiển thị cho bạn bè.</p>
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

          <div className="content-right d-xl-block d-none">
            {/* <CollegeMeetCard /> */}
            <Gallery />
            <div ref={ref} className="d-xl-block d-none">
              {inView && <ActivityFeeds username={username} />}
            </div>
            <div className="sticky-top">
              <EventsCard eventImage={12} diffrentPath="post" />
              {/* <WorldWideTrend /> */}
            </div>
          </div>
        </div>
      </Container>
    </ProfileLayout>
  );
};

export default ProfileTimeLine;
