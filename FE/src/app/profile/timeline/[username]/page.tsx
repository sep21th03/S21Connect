"use client";
import CreatePost from "@/Common/CreatePost";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import EventsCard from "@/components/NewsFeed/Style1/ContentRight/EventsCard";
import Gallery from "@/components/NewsFeed/Style1/ContentRight/Gallery";
import FriendSuggestion from "@/components/NewsFeed/Style1/LeftContent/FriendSuggestion";
import LikePage from "@/components/NewsFeed/Style1/LeftContent/LikePage";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import AboutUser from "@/components/profile/AboutUser";
import ActivityFeeds from "@/components/profile/ActivityFeeds";
import CollegeMeetCard from "@/components/profile/CollegeMeetCard";
import WorldWideTrend from "@/components/profile/WorldWideTrend";
import ProfileLayout from "@/layout/ProfileLayout";
import { Container } from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { FullUserProfile } from "@/utils/interfaces/user";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserNotFound from "@/app/404/user/page";
import LoadingLoader from "@/layout/LoadingLoader";
import { useSession } from "next-auth/react";

const ProfileTimeLine = () => {
  const { data: session } = useSession();
  const params = useParams();
  const username = params.username as string;
  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwnProfile = userProfile?.user.username === session?.user?.username;

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
  
  if (loading) {
    return  <LoadingLoader/>;
  }


  if (error || !userProfile) {
    return <UserNotFound />;
  }

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
            <CreatePost />
            <div className="overlay-bg" />
            <div className="post-panel infinite-loader-sec section-t-space">
              <SufiyaElizaFirstPost mainImage={11} userImage={15} />
              <SufiyaElizaMultiplePost
                moreImage
                diffrentImage
                userImage={14}
                main={40}
                second={41}
                third={42}
              />
              <SufiyaElizaSecondPost userImage={10} />
              <SufiyaElizaThirdPost
                userImage={1}
                iframeLink="https://giphy.com/embed/xl2zRzM8sVo3td58kS"
              />
              <SufiyaElizaSecondPost userImage={15} />
              <SufiyaElizaSecondPost userImage={15} />
              <SufiyaElizaSecondPost userImage={10} />
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
