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

const ProfileAbout: React.FC<ProfileAboutProps> = ({ userProfile, isOwnProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [userInfo, setUserInfo] = useState(userProfile);

  const handleProfileUpdate = (updatedUserProfile: FullUserProfile) => {
    setUserInfo(updatedUserProfile); 
  };

  const aboutUser = [
    {
      icon: "User",
      heading: "About",
      details: userInfo?.user.bio || "Chưa cập nhật",
    },
    { icon: "Mail", heading: "Email", details: userInfo?.user.email || "Chưa cập nhật" },
    { iconName: "cake", heading: "Sinh nhật", details: userInfo?.user.birthday || "Chưa cập nhật" },
    { icon: "Phone", heading: "Số điện thoại", details: userInfo?.profile.phone_number || "Chưa cập nhật" },
    { icon: "User", heading: "Giới tính", details: userInfo?.user.gender || "Chưa cập nhật" },
    { icon: "Heart", heading: "Mối quan hệ", details: userInfo?.profile.relationship_status || "Chưa cập nhật" },
    { icon: "MapPin", heading: "Đang sinh sống tại", details: userInfo?.profile.location || "Chưa cập nhật" },
    { iconName: "blood-drop", heading: "Đang làm việc tại", details: userInfo?.profile.workplace || "Chưa cập nhật" },
    { icon: "AtSign", heading: "Đã từng học tại", details: userInfo?.profile.past_school || "Chưa cập nhật" },
    { icon: "Link", heading: "Đang học tại", details: userInfo?.profile.current_school || "Chưa cập nhật" },
    { icon: "Link", heading: "Đã tham gia vào", details: dayjs(userInfo?.user.created_at).format("DD/MM/YYYY") || "Chưa cập nhật" },
  ];

  return (
    <div className="profile-about sticky-top">
      <div className="card-title">
        <h3>{About}</h3>
        <h5>{IntroMySelf}</h5>
        <div className="settings">
          <div className="setting-btn">
            <a href={Href} onClick={toggle}>
              <DynamicFeatherIcon iconName="Edit2" className="icon icon-dark stroke-width-3 iw-11 ih-11"/>
            </a>
          </div>
        </div>
      </div>
      <div className="about-content">
        <ul>
          {aboutUser.map((data, index) => (
            <li key={index}>
              <div className="icon">
                {data.icon ? (
                  <DynamicFeatherIcon iconName={data.icon as any} className="iw-18 ih-18"/>
                ) : (
                  <SvgIconCommon iconName={data.iconName ? data.iconName : ""} className="iw-18 ih-18"/>
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
        <PersonalInformationModal isOpen={isOpen} toggle={toggle} userProfile={userProfile} onUpdateProfile={handleProfileUpdate}/>
      )}
    </div>
  );
};

export default ProfileAbout;
