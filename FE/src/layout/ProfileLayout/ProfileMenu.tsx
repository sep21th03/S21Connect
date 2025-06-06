import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { profileMenuData } from "@/Data/Layout";
import Link from "next/link";
import React, { FC } from "react";
import { Input } from "reactstrap";
import { ProfileMenuInterFaceCustom } from "../LayoutTypes";


const ProfileMenu: FC<ProfileMenuInterFaceCustom> = ({title, username}) => {
  return (
    <div className="profile-menu section-t-space">
      <ul>
        {profileMenuData.map((data, index) => (
          <li className={`${data.name === title  ? "active":""} ${data.name === "hoạt động" ?"d-xl-none d-inline-block":""}`} key={index}>
            <Link href={data.navigate + "/" + username}>
              <DynamicFeatherIcon iconName={data.icon} className="iw-14 ih-14"/>
              <h6>{data.name}</h6>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="right-menu d-xl-flex d-none">
        <li>
          <div className="search-bar input-style icon-left search-inmenu">
            <DynamicFeatherIcon iconName="Search" className="iw-16 ih-16 icon icon-theme"/>
            <Input type="text" placeholder="Tìm kiếm..." />
          </div>
        </li>
        <li className={`${title === "acitivity feed"?"active":""}`}>
          <Link href={`/profile/acitivityfeed/${username}`}>
            <DynamicFeatherIcon iconName="List" className="iw-14 ih-14 " />
            <h6>Hoạt động gần đây</h6>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ProfileMenu;
