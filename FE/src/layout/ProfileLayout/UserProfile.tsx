"use client";
import CustomImage from "@/Common/CustomImage";
import {
  ChoosePhoto,
  EditProfile,
  ImagePath,
  RemovePhoto,
  SetPosition,
  UploadPhoto,
} from "../../utils/constant";
import Image from "next/image";
import UserData from "./UserData";
import { Href } from "../../utils/constant/index";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import { FC, useState, useEffect } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { UserProfileInterFace } from "../LayoutTypes";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import UserDropDown from "./UserDropDown";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";

const UserProfile: FC<UserProfileInterFace> = ({
  toggle,
  userProfile,
  isOwnProfile,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState("none"); // possible values: none, pending, accepted
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const toggleDropDown = () => setDropDownOpen(!dropDownOpen);

  const { imageLink, backgroundImage } = useSelector(
    (state: RootState) => state.LayoutSlice
  );

  useEffect(() => {
    if (!isOwnProfile && userProfile?.user.id) {
      checkFriendshipStatus();
    }
    getUserData();
  }, [isOwnProfile, userProfile?.user.id]);

  const getUserData = async () => {
    if (!userProfile?.user.id) return;
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.PROFILE.USER_DATA(userProfile?.user.id.toString() || "")
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.FRIENDS.BASE +
          API_ENDPOINTS.FRIENDS.CHECK_STATUS(userProfile?.user.id)
      );
      setFriendshipStatus(response.data.status || "none");
    } catch (error) {
      console.error("Error checking friendship status:", error);
      setFriendshipStatus("none");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    try {
      await axiosInstance.post(
        API_ENDPOINTS.FRIENDS.BASE +
          API_ENDPOINTS.FRIENDS.SEND(userProfile?.user.id)
      );
      setFriendshipStatus("pending_sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(
        API_ENDPOINTS.FRIENDS.BASE +
          API_ENDPOINTS.FRIENDS.REJECT(userProfile?.user.id)
      );
      setFriendshipStatus("none");
    } catch (error) {
      console.error("Error canceling friend request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    try {
      await axiosInstance.post(
        API_ENDPOINTS.FRIENDS.BASE +
          API_ENDPOINTS.FRIENDS.ACCEPT(userProfile?.user.id)
      );
      setFriendshipStatus("accepted");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(
        API_ENDPOINTS.FRIENDS.BASE +
          API_ENDPOINTS.FRIENDS.UNFRIEND(userProfile?.user.id)
      );
      setFriendshipStatus("none");
    } catch (error) {
      console.error("Error unfriending:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFriendshipButton = () => {
    if (isOwnProfile) {
      return (
        <a href={Href} onClick={toggle} className="btn btn-solid">
          {EditProfile}
        </a>
      );
    }

    switch (friendshipStatus) {
      case "none":
        return (
          <button
            onClick={handleAddFriend}
            className="btn btn-solid"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Thêm bạn bè"}
          </button>
        );
      case "pending_sent":
        return (
          <button
            onClick={handleCancelRequest}
            className="btn btn-outline"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Hủy lời mời"}
          </button>
        );
      case "pending_received":
        return (
          <div className="d-flex gap-2">
            <button
              onClick={handleAcceptRequest}
              className="btn btn-solid"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Chấp nhận"}
            </button>
            <button
              onClick={handleCancelRequest}
              className="btn btn-outline"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Từ chối"}
            </button>
          </div>
        );
      case "accepted":
        return (
          <button
            onClick={handleUnfriend}
            className="btn btn-outline"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Hủy kết bạn"}
          </button>
        );
      default:
        return (
          <button
            onClick={handleAddFriend}
            className="btn btn-solid"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Thêm bạn bè"}
          </button>
        );
    }
  };
  
  return (
    <div className="profile-cover bg-size blur-up lazyloaded">
      <CustomImage
        src={`${ImagePath}/${backgroundImage}`}
        className="img-fluid blur-up lazyload bg-img "
        alt="cover"
      />
      <div className="profile-box d-lg-block d-none">
        <div className="profile-content">
          <div className="image-section">
            <div className="profile-img">
              <div className="bg-size blur-up lazyloaded">
                <Image
                  src={userProfile?.user.avatar || "/default-avatar.jpg"}
                  className="img-fluid lazyload bg-img rounded-circle"
                  alt="profile"
                  width={120}
                  height={120}
                />
              </div>
              <span className="stats">
                <Image
                  width={15}
                  height={15}
                  src={`${ImagePath}/icon/verified.png`}
                  className="img-fluid blur-up lazyloaded"
                  alt="verified"
                />
              </span>
            </div>
          </div>
          <div className="profile-detail">
            <h2>
              {userProfile?.user.first_name} {userProfile?.user.last_name}
            </h2>
            <h5>{userProfile?.user.email}</h5>
            <UserData userData={userData} />
            {renderFriendshipButton()}
          </div>
        </div>
      </div>
      <UserDropDown
        dropDownOpen={dropDownOpen}
        toggleDropDown={toggleDropDown}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
};

export default UserProfile;
