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
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import UserDropDown from "./UserDropDown";
import FriendService from "@/service/friendService";
import UserProfileService from "@/service/userProfileService";
import { setImageLink } from "@/redux-toolkit/reducers/LayoutSlice";

const UserProfile: FC<UserProfileInterFace> = ({
  toggle,
  userProfile,
  isOwnProfile,
  setFriendshipStatus,
  friendshipStatus,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
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
      const data = await UserProfileService.getUserData(userProfile.user.id);
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    try {
      const status = await FriendService.checkFriendshipStatus(
        userProfile.user.id
      );
      setFriendshipStatus(status);
    } catch (error) {
      console.error("Error checking friendship status:", error);
      setFriendshipStatus("none");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFriendAction = async (
    action: "add" | "cancel" | "accept" | "unfriend"
  ) => {
    if (isLoading || !userProfile?.user?.id) return;

    setIsLoading(true);
    const userId = userProfile.user.id;

    try {
      let success = false;

      switch (action) {
        case "add":
          success = await FriendService.sendFriendRequest(userId);
          if (success) setFriendshipStatus("pending_sent");
          break;
        case "cancel":
          success = await FriendService.cancelFriendRequest(userId);
          if (success) setFriendshipStatus("none");
          break;
        case "accept":
          success = await FriendService.acceptFriendRequest(userId);
          if (success) setFriendshipStatus("accepted");
          break;
        case "unfriend":
          success = await FriendService.unfriend(userId);
          if (success) setFriendshipStatus("none");
          break;
      }
    } catch (error) {
      console.error(`Error handling friend action: ${action}`, error);
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
            onClick={() => handleFriendAction("add")}
            className="btn btn-solid"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Thêm bạn bè"}
          </button>
        );
      case "pending_sent":
        return (
          <button
            onClick={() => handleFriendAction("cancel")}
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
              onClick={() => handleFriendAction("accept")}
              className="btn btn-solid"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Chấp nhận"}
            </button>
            <button
              onClick={() => handleFriendAction("cancel")}
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
            onClick={() => handleFriendAction("unfriend")}
            className="btn btn-outline"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Hủy kết bạn"}
          </button>
        );
      default:
        return null;
    }
  };

  const currentUser = isOwnProfile;

  const avatarSrc = currentUser ? imageLink ?? userProfile?.user.avatar ?? "/images/default-avatar.jpg" : userProfile?.user.avatar;
  const backgroundSrc = currentUser ? backgroundImage ?? userProfile?.user.cover_photo ?? "/images/default-cover.jpg" : userProfile?.user.cover_photo;

  return (
    <div className="profile-cover bg-size blur-up lazyloaded">
      <CustomImage
        src={backgroundSrc || ""}
        className="img-fluid blur-up lazyload bg-img "
        alt="cover"
      />
      <div className="profile-box d-lg-block d-none">
        <div className="profile-content">
          <div className="image-section">
            <div className="profile-img">
              <div className="bg-size blur-up lazyloaded">
                  <Image
                    src={avatarSrc || ""}
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
