"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "reactstrap";

import CreatePost from "@/Common/CreatePost";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import EventsCard from "@/components/NewsFeed/Style1/ContentRight/EventsCard";
import Gallery from "@/components/NewsFeed/Style1/ContentRight/Gallery";
import FriendSuggestion from "@/components/NewsFeed/Style1/LeftContent/FriendSuggestion";
import LikePage from "@/components/NewsFeed/Style1/LeftContent/LikePage";
import AboutUser from "@/components/profile/AboutUser";
import ActivityFeeds from "@/components/profile/ActivityFeeds";
import CollegeMeetCard from "@/components/profile/CollegeMeetCard";
import WorldWideTrend from "@/components/profile/WorldWideTrend";
import ProfileLayout from "@/layout/ProfileLayout";
import LoadingLoader from "@/layout/LoadingLoader";
import UserNotFound from "@/app/404/user/page";

import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { FullUserProfile } from "@/utils/interfaces/user";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";

// Define ApiResponse interface
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

const ProfileTimeLine = () => {
  const { data: session } = useSession();
  const params = useParams();
  const username = params.username as string;
  
  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  
  const isOwnProfile = userProfile?.user.username === session?.user?.username;

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
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
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  useEffect(() => {
    if (!userProfile?.user?.id) return;
  
    const checkFriendshipAndFetchPosts = async () => {
      try {
        const res = await axiosInstance.get(
          API_ENDPOINTS.FRIENDS.BASE + API_ENDPOINTS.FRIENDS.CHECK_STATUS(userProfile.user.id)
        );
        const status = res.data.status || "none";
        setFriendshipStatus(status);
  
        const canView = isOwnProfile || status === "accepted";
        if (canView) {
          const endpoint = isOwnProfile 
            ? API_ENDPOINTS.POSTS.GET_MY_POSTS
            : API_ENDPOINTS.POSTS.GET_FRIEND_POSTS(userProfile.user.id);
          const postRes = await axiosInstance.get(endpoint);
          setPosts(postRes.data);
        }
      } catch (error) {
        console.error("Error checking friendship status or fetching posts:", error);
      }
    };
  
    checkFriendshipAndFetchPosts();
  }, [userProfile, isOwnProfile]);
  

  if (loading) {
    return <LoadingLoader />;
  }

  if (error || !userProfile) {
    return <UserNotFound />;
  }

  const canViewPosts = isOwnProfile || friendshipStatus === "accepted" || friendshipStatus === "none";

  return (
    <ProfileLayout title="timeline" loaderName="profileTimeLine">
      <Container fluid className="section-t-space px-0 layout-default">
        <div className="page-content">
          <div className="content-left">
            <AboutUser userProfile={userProfile} isOwnProfile={isOwnProfile} />
            <FriendSuggestion mainClassName="d-xl-block d-none" />
            <div className="sticky-top d-xl-block d-none">
              <LikePage />
            </div>
          </div>
          <div className="content-center">
            {isOwnProfile && <CreatePost />}
            <div className="overlay-bg" />
            <div className="post-panel infinite-loader-sec section-t-space">
              {canViewPosts ? (
                posts.length > 0 ? (
                  posts.map((post) => {
                    switch (post.type) {
                      case "first":
                        return (
                          <SufiyaElizaFirstPost
                            key={post.id}
                            post={post}
                          />
                        );
                      case "multiple":
                        return (
                          <SufiyaElizaMultiplePost
                            key={post.id}
                            post={post}
                          />
                        );
                      case "third":
                        return (
                          <SufiyaElizaThirdPost
                            key={post.id}
                            post={post}
                          />
                        );
                      case "second":
                      default:
                        return (
                          <SufiyaElizaSecondPost
                            key={post.id}
                            post={post}
                          />
                        );
                    }
                  })
                ) : (
                  <div className="no-posts-message text-center p-4">
                    <h5>No posts to display</h5>
                    {isOwnProfile && <p>Create your first post to get started!</p>}
                  </div>
                )
              ) : (
                <div className="friend-request-message text-center p-4">
                  <h5>Content not available</h5>
                  {friendshipStatus === "pending_sent" && 
                    <p>Friend request sent. Content will be available once accepted.</p>
                  }
                  {friendshipStatus === "pending_received" && 
                    <p>You have a pending friend request from this user.</p>
                  }
                </div>
              )}
            </div>
          </div>
          <div className="content-right d-xl-block d-none">
            <CollegeMeetCard />
            <Gallery />
            <ActivityFeeds />
            <div className="sticky-top">
              <EventsCard eventImage={12} diffrentPath="post" />
              <WorldWideTrend />
            </div>
          </div>
        </div>
      </Container>
    </ProfileLayout>
  );
};

export default ProfileTimeLine;