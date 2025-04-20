import { About, IntroMySelf } from "../../utils/constant";
import EditCoverModal from "@/layout/ProfileLayout/EditCoverModal";
import React, { FC, useState } from "react";
import { Href } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { socialMediaDetail } from "@/Data/profile";
import SvgIconCommon from "@/Common/SvgIconCommon";
import { FullUserProfile } from "@/utils/interfaces/user";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface AboutUserProps {
  userProfile: FullUserProfile;
  isOwnProfile: boolean;
}

const AboutUser: FC<AboutUserProps> = ({ userProfile, isOwnProfile }) => {
  const [isOpen, setIsOpen] = useState(false);


  const toggle = () => setIsOpen(!isOpen);

  const aboutUser = [
    {
      icon: "MapPin",
      description: userProfile?.profile.location || "Chưa cập nhật",
      time: "Sống tại",
    },
    {
      icon: "Briefcase",
      description: userProfile?.profile.workplace || "Chưa cập nhật",
      time: "Làm việc tại",
    },
    {
      icon: "Book",
      description: userProfile?.profile.current_school || "Chưa cập nhật",
      time: "Học tại",
    },
    {
      icon: "Book",
      description: userProfile?.profile.past_school || "Chưa cập nhật",
      time: "Từng học tại",
    },
    {
      icon: "Heart",
      description: userProfile?.profile.relationship_status || "Chưa cập nhật",
      time: "Mối quan hệ",
    },
  ];

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
        <ul>
          {aboutUser.map((data, index) => (
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
          userProfile={userProfile}
        />
      )} 
    </div>
  );
};

export default AboutUser;