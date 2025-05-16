import React, { FC } from "react";
import CustomImage from "@/Common/CustomImage";
import { EditProfile, ImagePath } from "../../utils/constant";
import Image from "next/image";
import UserData from "./UserData";
import { Href } from '../../utils/constant/index';
import { UserProfileInterFace } from "../LayoutTypes";

const UserProfileBox:FC<UserProfileInterFace> = ({toggle,isOwnProfile,userProfile}) => {
  return (
    <div className="d-lg-none d-block">   
      <div className="profile-box">
        <div className="profile-content">
          <div className="image-section">
            <div className="profile-img">
              <div className="bg-size blur-up lazyloaded">
                <CustomImage src={`${ImagePath}/user-sm/15.jpg`} className="img-fluid blur-up lazyload bg-img" alt="profile"/>
              </div>
              <span className="stats">
                <Image width={15} height={15} src={`${ImagePath}/icon/verified.png`} className="img-fluid blur-up lazyloaded" alt="verified"/>
              </span>
            </div>
          </div>
          <div className="profile-detail">
            <h2>{userProfile?.user.first_name} {userProfile?.user.last_name}</h2>
            <h5>{userProfile?.user.email}</h5>
            <UserData userData={userProfile?.user} />
            {isOwnProfile && (
              <a href={Href} className="btn btn-solid" onClick={toggle}>{EditProfile}</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileBox;