"use client";
import StorySection from "@/components/NewsFeed/Style1/StorySection";
import CommonLayout from "@/layout/CommonLayout";
import { FC, useEffect, useState } from "react";
import { Container } from "reactstrap";
import ContentLeft from "@/components/NewsFeed/Style1/LeftContent";
import ContentCenter from "@/components/NewsFeed/Style1/ContentCenter";
import ContentRight from "@/components/NewsFeed/Style1/ContentRight";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { UserAbout, UserInforBirthday } from "@/utils/interfaces/user";

const NewsFeedStyle1: FC = () => { 
  const [userProfile, setUserProfile] = useState<UserAbout | null>(null);
  const [userInforBirthday, setUserInforBirthday] = useState<UserInforBirthday | null>(null);
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
  return (
    <CommonLayout mainClass="custom-padding" loaderName="style1"> 
      <div className="page-center">
        <StorySection storyShow={8} />
        <Container fluid className="section-t-space px-0 layout-default">
          <div className="page-content">
            <ContentLeft userProfile={userProfile} />
            <ContentCenter />
            <ContentRight userInforBirthday={userInforBirthday}/>
          </div>
        </Container>
      </div>
    </CommonLayout>
  );
};

export default NewsFeedStyle1;
