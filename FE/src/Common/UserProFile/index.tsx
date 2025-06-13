import { Domain, Href, ImagePath, ViewProfile } from "../../utils/constant/index";
import Link from "next/link";
import ProfileSetting from "./ProfileSetting";
import CounterStats from "./CounterStats";
import Image from "next/image";
import CustomImage from "../CustomImage";
import { UserAbout } from "@/utils/interfaces/user";
import { FC } from "react";

const UserProFile: FC<{ userProfile: UserAbout | null }> = ({ userProfile }) => {
  return (
    <div className="profile-box">
      <ProfileSetting userProfile={userProfile}/>
      <div className="profile-content">
        <Link href={`/profile/timeline/${userProfile?.username}`} className="image-section">
          <div className="profile-img">
            <div className="bg-size blur-up lazyloaded">
              <img width={125} height={125} src={userProfile?.avatar} className="img-fluid bg-img lazyloaded rounded-circle" alt="profile"/>
            </div>
            <span className="stats">
              <Image width={15} height={15} src={`${ImagePath}/icon/verified.png`} className="img-fluid blur-up lazyloaded" alt="verified"/>
            </span>
          </div>
        </Link>
        <div className="profile-detail">
          <Link href="/profile">
            <h2>{userProfile?.first_name} {userProfile?.last_name} <span>❤</span></h2>
          </Link>
          <h5>@{userProfile?.username}</h5>
          <div className="description">
            <p>{userProfile?.bio}</p>
          </div>
          <CounterStats userData={userProfile?.user_data ?? null} />
          <a href={`${Domain}/profile/timeline/${userProfile?.username}`} className="btn btn-solid">{ViewProfile}</a>
        </div>
      </div>
    </div>
  );
};

export default UserProFile;
