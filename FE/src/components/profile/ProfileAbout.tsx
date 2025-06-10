import { About, Href, IntroMySelf } from "../../utils/constant";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import SvgIconCommon from "@/Common/SvgIconCommon";
import { aboutContentData, socialMediaDetail } from "@/Data/profile";
import PersonalInformationModal from "@/layout/ProfileLayout/PersonalInformationModal";
import { useState } from "react";
import { FullUserProfile } from "@/utils/interfaces/user";
import dayjs from "dayjs";

interface ProfileAboutProps {
  userProfile: FullUserProfile;
  isOwnProfile: boolean;
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({
  userProfile,
  isOwnProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [userInfo, setUserInfo] = useState(userProfile);

  const handleProfileUpdate = (updatedUserProfile: FullUserProfile) => {
    setUserInfo(updatedUserProfile);
  };
  const convertGender = (gender: string | null): string => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  const aboutUser = [
    {
      icon: "User",
      heading: "About",
      details: userInfo?.user.bio,
    },
    {
      icon: "Mail",
      heading: "Email",
      details: userInfo?.user.email,
    },
    {
      iconName: "cake",
      heading: "Sinh nhật",
      details: userInfo?.user.birthday,
    },
    {
      icon: "Phone",
      heading: "Số điện thoại",
      details: userInfo?.profile.phone_number,
    },
    {
      icon: "User",
      heading: "Giới tính",
      details: userInfo?.user.gender
        ? convertGender(userInfo.user.gender)
        : null,
    },
    {
      icon: "Heart",
      heading: "Mối quan hệ",
      details: userInfo?.profile.relationship_status,
    },
    {
      icon: "MapPin",
      heading: "Đang sinh sống tại",
      details: userInfo?.profile.location,
    },
    {
      iconName: "blood-drop",
      heading: "Đang làm việc tại",
      details: userInfo?.profile.workplace,
    },
    {
      icon: "AtSign",
      heading: "Đã từng học tại",
      details: userInfo?.profile.past_school,
    },
    {
      icon: "Link",
      heading: "Đang học tại",
      details: userInfo?.profile.current_school,
    },
    {
      icon: "Link",
      heading: "Đã tham gia vào",
      details: userInfo?.user.created_at
        ? dayjs(userInfo.user.created_at).format("DD/MM/YYYY")
        : null,
    },
  ];

  return (
    <div className="profile-about sticky-top">
      <div className="card-title">
        <h3>{About}</h3>
        <h5>{IntroMySelf}</h5>
        <div className="settings">
          <div className="setting-btn">
            <a href={Href} onClick={toggle}>
              <DynamicFeatherIcon
                iconName="Edit2"
                className="icon icon-dark stroke-width-3 iw-11 ih-11"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="about-content">
        <ul>
          {aboutUser
            .filter((data) => data.details)
            .map((data, index) => (
              <li key={index}>
                <div className="icon">
                  {data.icon ? (
                    <DynamicFeatherIcon
                      iconName={data.icon as any}
                      className="iw-18 ih-18"
                    />
                  ) : (
                    <SvgIconCommon
                      iconName={data.iconName ? data.iconName : ""}
                      className="iw-18 ih-18"
                    />
                  )}
                </div>
                <div className="details">
                  <h5>{data.heading}</h5>
                  <h6>{data.details}</h6>
                </div>
              </li>
            ))}
        </ul>
      </div>
      <div className="about-footer">
        <ul>
          {socialMediaDetail.map((data, index) => (
            <li className={data.className} key={index}>
              <a href={Href}>
                <SvgIconCommon iconName={data.icon} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      {isOwnProfile && (
        <PersonalInformationModal
          isOpen={isOpen}
          toggle={toggle}
          userProfile={userProfile}
          onUpdateProfile={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfileAbout;
