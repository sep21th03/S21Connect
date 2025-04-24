"use client";
import EducationProfile from "@/components/profile/EducationProfile";
import HobbiesProfile from "@/components/profile/HobbiesProfile";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileFriendList from "@/components/profile/ProfileFriendList";
import ProfileLayout from "@/layout/ProfileLayout";
import { Col, Container, Row } from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { FullUserProfile } from "@/utils/interfaces/user";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserNotFound from "@/app/404/user/page";
import LoadingLoader from "@/layout/LoadingLoader";
import { useSession } from "next-auth/react";

const AboutProfile = () => {
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
    <ProfileLayout title="about" loaderName="aboutProfileSkelton" >
      <Container fluid className="section-t-space px-0">
        <Row>
          <Col xs="4" className="content-left  res-full-width order-1">
            <ProfileAbout userProfile={userProfile} isOwnProfile={isOwnProfile}/>  
          </Col>
          <Col xs="8" className="content-center res-full-width">
            <HobbiesProfile />
            <EducationProfile />
            <ProfileFriendList />
          </Col>
        </Row>
      </Container>
    </ProfileLayout>
  );
};

export default AboutProfile;