import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { userMenuData } from "@/Data/Layout";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import { Media } from "reactstrap";
import { LogOut } from "../../../utils/constant";
const UserProfileMenu: FC = () => {

  const handleLogOut = () => {
    signOut();
  };
  return (
    <ul className='friend-list'>
      {userMenuData.map((data, index) => (
        <li key={index}>
          <Link href={data.navigate}>
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
      ))}
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
