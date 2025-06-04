"use client";
import StorySection from "@/components/NewsFeed/Style1/StorySection";
import CommonLayout from "@/layout/CommonLayout";
import { FC, useEffect, useState } from "react";
import { Container } from "reactstrap";
import ContentLeft from "@/components/NewsFeed/Style1/LeftContent";
import ContentCenter from "@/components/NewsFeed/Style1/ContentCenter";
import ContentRight from "@/components/NewsFeed/Style1/ContentRight";
import { UserAbout } from "@/utils/interfaces/user";
import { UserInforBirthday } from "@/components/NewsFeed/Style1/Style1Types";
import { getUserInforBirthday } from "@/service/newsfeedService";
import { getUserAbout } from "@/service/newsfeedService";

const NewsFeedStyle1: FC = () => {
  const [userProfile, setUserProfile] = useState<UserAbout | null>(null);
  const [userInforBirthday, setUserInforBirthday] =
    useState<UserInforBirthday[] | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserAbout();
      setUserProfile(data);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchBirthdayInfo = async () => {
      const data = await getUserInforBirthday();
      setUserInforBirthday([data] as unknown as UserInforBirthday[]);
    };
    fetchBirthdayInfo();
  }, []);

  return (
    <CommonLayout mainClass="custom-padding" loaderName="style1">
      <div className="page-center">
        <StorySection storyShow={8} />
        <Container fluid className="section-t-space px-0 layout-default">
          <div className="page-content">
            <ContentLeft userProfile={userProfile} />
            <ContentCenter />
            <ContentRight userInforBirthday={userInforBirthday} />
          </div>
        </Container>
      </div>
    </CommonLayout>
  );
};

export default NewsFeedStyle1;
