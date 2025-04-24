import { About, IntroMySelf } from "../../utils/constant";
import EditCoverModal from "@/layout/ProfileLayout/EditCoverModal";
import React, { FC, useState } from "react";
import { Href } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { socialMediaDetail } from "@/Data/profile";
import SvgIconCommon from "@/Common/SvgIconCommon";
import { FullUserProfile } from "@/utils/interfaces/user";

interface AboutUserProps {
  userProfile: FullUserProfile;
  isOwnProfile: boolean;
}

const AboutUser: FC<AboutUserProps> = ({ userProfile, isOwnProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<FullUserProfile>(userProfile);

  const handleProfileUpdate = (updatedUserProfile: FullUserProfile) => {
    setUserInfo(updatedUserProfile); 
  };

  const toggle = () => setIsOpen(!isOpen);

  const getAboutUserItems = () => {
    const items = [];
    
    if ((userInfo?.profile.is_location_visible || isOwnProfile) && userInfo?.profile.location) {
      items.push({
        icon: "MapPin",
        description: userInfo.profile.location,
        time: "Sống tại",
      });
    }
    
    if ((userInfo?.profile.is_workplace_visible || isOwnProfile) && userInfo?.profile.workplace) {
      items.push({
        icon: "Briefcase",
        description: userInfo.profile.workplace,
        time: "Làm việc tại",
      });
    }
    
    if ((userInfo?.profile.is_school_visible || isOwnProfile) && userInfo?.profile.current_school) {
      items.push({
        icon: "Book",
        description: userInfo.profile.current_school,
        time: "Học tại",
      });
    }
    
    if ((userInfo?.profile.is_past_school_visible || isOwnProfile) && userInfo?.profile.past_school) {
      items.push({
        icon: "Book",
        description: userInfo.profile.past_school,
        time: "Từng học tại",
      });
    }
    
    if ((userInfo?.profile.is_relationship_status_visible || isOwnProfile) && userInfo?.profile.relationship_status) {
      items.push({
        icon: "Heart",
        description: userInfo.profile.relationship_status,
        time: "Mối quan hệ",
      });
    }

    if ((userInfo?.profile.is_phone_number_visible || isOwnProfile) && userInfo?.profile.phone_number) {
      items.push({
        icon: "Phone",
        description: userInfo.profile.phone_number,
        time: "Số điện thoại",
      });
    }
    
    return items;
  };

  const aboutUserItems = getAboutUserItems();

  // If no items to display and not own profile, show a message
  const noInfoToDisplay = aboutUserItems.length === 0 && !isOwnProfile;

  return (
    <div className="profile-about">
      <div className="card-title">
        <h3>{About}</h3>
        {isOwnProfile && <h5>{IntroMySelf}</h5>}
        {isOwnProfile && (
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
         )}
      </div>
      <div className="about-content">
        {noInfoToDisplay ? (
          <div className="no-info-message">
            <p>Không có thông tin để hiển thị</p>
          </div>
        ) : (
          <ul>
            {aboutUserItems.map((data, index) => (
              <li key={index}>
                <div className="icon">
                  {data.icon ? (
                    <DynamicFeatherIcon
                      iconName={data.icon as any}
                      className="iw-18 ih-18"
                    />
                  ) : (
                    <SvgIconCommon iconName={data.icon as any} />
                  )}
                </div>
                <div className="details">
                  <h6>{data.time}</h6>
                  <h5>{data.description}</h5>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="about-footer">
        <ul>
          {socialMediaDetail.map((data, index) => (
            <li className={data.className} key={index}>
              <a href={Href}>
                {" "}
                <SvgIconCommon iconName={data.icon} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      {isOwnProfile && ( 
        <EditCoverModal
          isOpen={isOpen}
          toggle={toggle}
          userProfile={userInfo}
          onUpdateProfile={handleProfileUpdate}
        />
      )} 
    </div>
  );
};

export default AboutUser;