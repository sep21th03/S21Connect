"use client";
import ContentCenter from "@/components/NewsFeed/Style1/ContentCenter";
import EventsCard from "@/components/NewsFeed/Style1/ContentRight/EventsCard";
import Gallery from "@/components/NewsFeed/Style1/ContentRight/Gallery";
import YourGames from "@/components/NewsFeed/Style1/ContentRight/YourGames";
import ContentLeft from "@/components/NewsFeed/Style1/LeftContent";
import StorySection from "@/components/NewsFeed/Style1/StorySection";
import CollegeMeetCard from "@/components/profile/CollegeMeetCard";
import CommonLayout from "@/layout/CommonLayout";
import { Container } from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { UserAbout, UserInforBirthday } from "@/utils/interfaces/user";
import { useEffect, useState } from "react";

const newsFeedStyle2 = () => {
  const [userProfile, setUserProfile] = useState<UserAbout | null>(null);
  const [userInforBirthday, setUserInforBirthday] = useState<UserInforBirthday | null>(null);
  const [gallery, setGallery] = useState<Gallery[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await axiosInstance.get<ApiResponse<UserAbout>>(API_ENDPOINTS.PROFILE.USER_ABOUT);
      setUserProfile(response.data.data);
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchUserInforBirthday = async () => {
      const response = await axiosInstance.get<ApiResponse<UserInforBirthday>>(API_ENDPOINTS.FRIENDS.USER_INFOR_BIRTHDAY);
      setUserInforBirthday(response.data.data);
    };
    fetchUserInforBirthday();
  }, []);

  // useEffect(() => {
  //   const fetchGallery = async () => {
  //     const response = await axiosInstance.get<ApiResponse<Gallery[]>>(API_ENDPOINTS.MESSAGES.MESSAGES.GET_USER_GALLERY("112"));
  //     setGallery(response.data.data);
  //   };
  //   fetchGallery();
  // }, []);
  return (
    <CommonLayout mainClass="custom-padding" headerClassName="header-light" sideBarClassName="sidebar-white" loaderName="style1" differentLogo="logo-color.png">
      <div className="page-center">
        <StorySection />
        <Container fluid className="section-t-space px-0 layout-default">
          <div className="page-content">
            <ContentLeft userProfile={userProfile} />
            <ContentCenter />
            <div className="content-right">
              <CollegeMeetCard />
              <Gallery />
              <div className="sticky-top">
                <EventsCard eventImage={1} />
                <YourGames />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </CommonLayout>
  );
};

export default newsFeedStyle2;
