"use client";
import { FC, useState } from "react";
import { ProfileLayoutInterFace } from "../LayoutTypes";
import CommonLayout from "@/layout/CommonLayout";
import UserProfile from "./UserProfile";
import UserProfileBox from "./UserProfileBox";
import ProfileMenu from "./ProfileMenu";
import EditCoverModal from "./EditCoverModal";
import { useParams } from "next/navigation";
import { ProfileContext } from "@/contexts/ProfileContext";
import { useGlobalProfile } from "@/contexts/GlobalProfileContext";

const ProfileLayout: FC<ProfileLayoutInterFace> = ({
  children,
  title,
  profileTab,
  loaderName,
}) => {
  const params = useParams();
  const username = params.username as string;
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const {
    userProfile,
    isOwnProfile,
    friendshipStatus,
    setFriendshipStatus,
    isLoading,
  } = useGlobalProfile();

  const shouldShowLoader = isLoading && !userProfile;

  return (
    <ProfileContext.Provider
      value={{
        userProfile,
        isOwnProfile,
        friendshipStatus,
        setFriendshipStatus,
      }}
    >
      <CommonLayout
        mainClass="custom-padding profile-page"
        loaderName={shouldShowLoader ? loaderName : undefined}
      >
        <div className="page-center">
          <UserProfile
            toggle={toggle}
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            setFriendshipStatus={setFriendshipStatus}
            friendshipStatus={friendshipStatus}
          />
          <UserProfileBox
            toggle={toggle}
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
          />
          {!profileTab && (
            <ProfileMenu title={title ? title : ""} username={username} />
          )}
          {children}
        </div>
        {isOwnProfile && userProfile && (
          <EditCoverModal
            isOpen={isOpen}
            toggle={toggle}
            userProfile={userProfile}
            onUpdateProfile={() => {}}
          />
        )}
      </CommonLayout>
    </ProfileContext.Provider>
  );
};

export default ProfileLayout;