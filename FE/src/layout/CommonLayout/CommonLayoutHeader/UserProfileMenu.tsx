"use client";

import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { userMenuData } from "@/Data/Layout";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import { Media } from "reactstrap";
import { LogOut } from "../../../utils/constant";
// import { useSession } from "next-auth/react";
import { logout } from "@/redux-toolkit/slice/authSlice";
import { useAppDispatch } from "@/redux-toolkit/hooks";

interface UserProfileMenuProps {
  username: string;
}

const UserProfileMenu: FC<UserProfileMenuProps> = ({username}) => {
  // const { data: session } = useSession();
  // const username = session?.user?.username || "User";
  const dispatch = useAppDispatch();
  const handleLogOut = () => {
    dispatch(logout());
    signOut();
  };

  return (
    <ul className='friend-list'>
      {userMenuData.map((data, index) => {
        const dynamicNavigate =
          data.navigate.includes("/profile/") ? `${data.navigate}/${username}` : data.navigate;

        return (
          <li key={index}>
            <Link href={dynamicNavigate}>
              <Media>
                <DynamicFeatherIcon iconName={data.icon} />
                <Media body>
                  <div>
                    <h5 className='mt-0'>{data.heading}</h5>
                    <h6>{data.headingDetail}</h6>
                  </div>
                </Media>
              </Media>
            </Link>
          </li>
        );
      })}
      <li onClick={handleLogOut}>
        <a>
          <Media>
            <DynamicFeatherIcon iconName='LogOut' />
            <Media body>
              <div>
                <h5 className='mt-0'>{LogOut}</h5>
              </div>
            </Media>
          </Media>
        </a>
      </li>
    </ul>
  );
};

export default UserProfileMenu;
