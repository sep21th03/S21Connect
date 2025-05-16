"use client";
import { Container } from "reactstrap";
import LeftHeader from "./LeftHeader";
import RightHeader from "./RightHeader";
import { CommonLayoutHeaderInterFace } from "@/layout/LayoutTypes";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useState, useEffect } from "react";
import {  UserStats } from "@/utils/interfaces/user";


const CommonLayoutHeader: React.FC<CommonLayoutHeaderInterFace> = ({headerClassName,differentLogo}) => {
  const [userProfile, setUserProfile] = useState<UserStats | null>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await axiosInstance.get<ApiResponse<UserStats>>(API_ENDPOINTS.USERS.GET_STATS);
      setUserProfile(response.data.data);
    };
    fetchUserProfile();
  }, []); 
  return (
    <header className={headerClassName?headerClassName :""}>
      <div className="mobile-fix-menu" />
      <Container fluid={true} className="custom-padding">
        <div className="header-section">
          <LeftHeader differentLogo={differentLogo} />
          <RightHeader total_posts={userProfile?.total_posts || 0} total_friends={userProfile?.total_friends || 0} />
        </div>
      </Container>
    </header>
  );
};

export default CommonLayoutHeader;
