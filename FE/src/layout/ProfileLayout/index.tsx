"use client";
import { FC, useState, useEffect } from "react";
import { ProfileLayoutInterFace } from "../LayoutTypes";
import CommonLayout from "@/layout/CommonLayout";
import UserProfile from "./UserProfile";
import UserProfileBox from "./UserProfileBox";
import ProfileMenu from "./ProfileMenu";
import EditCoverModal from "./EditCoverModal";
import { useParams } from "next/navigation";
import { FullUserProfile } from "@/utils/interfaces/user";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSession } from "next-auth/react";

const ProfileLayout: FC<ProfileLayoutInterFace> = ({ children, title,profileTab,loaderName }) => {
  const [friendshipStatus, setFriendshipStatus] = useState("none"); 
  const { data: session } = useSession();
  const params = useParams();
  const username = params.username as string;
  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await axiosInstance.get<ApiResponse<FullUserProfile>>(API_ENDPOINTS.PROFILE.USER_PROFILE(username));
      setUserProfile(response.data.data);
    };
    fetchUserProfile();
  }, [username]);
  const isOwnProfile = userProfile?.user.username === session?.user?.username;
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <CommonLayout mainClass="custom-padding profile-page" loaderName={loaderName}>
      <div className="page-center">
        <UserProfile toggle={toggle} userProfile={userProfile} isOwnProfile={isOwnProfile}  setFriendshipStatus={setFriendshipStatus} friendshipStatus={friendshipStatus}/>
        <UserProfileBox toggle={toggle} userProfile={userProfile} isOwnProfile={isOwnProfile}/>
        {!profileTab && <ProfileMenu title={title?title:""} username={username}/>}
        {children}
      </div>
      {isOwnProfile && (
        <EditCoverModal isOpen={isOpen} toggle={toggle} userProfile={userProfile!} onUpdateProfile={() => {}}/>
      )}
    </CommonLayout>
  );
};

export default ProfileLayout;