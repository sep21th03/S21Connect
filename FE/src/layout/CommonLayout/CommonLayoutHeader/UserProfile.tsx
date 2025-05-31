import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { ActiveNow, Close, Href, ImagePath, Profile } from "../../../utils/constant";
import { FC, useEffect, useState } from "react";
import { Media } from "reactstrap";
import UserProfileMenu from "./UserProfileMenu";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { userProfile } from "@/service/userSerivice";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";

const UserProfile: FC = () => {
  const { isComponentVisible, ref, setIsComponentVisible } =useOutsideDropdown(false);
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const userRedux = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await userProfile();
        setUser(res); 
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    }

    fetchUser();
  }, []);

  return (
    <li className="header-btn custom-dropdown profile-btn btn-group">
      <a className={`main-link ${isComponentVisible ? "show" : ""}`} href={Href} onClick={() => setIsComponentVisible(!isComponentVisible)}>
        <DynamicFeatherIcon iconName="User" className="icon-light stroke-width-3 d-sm-none d-block iw-16 ih-16"/>
        <Media className="d-none d-sm-flex">
          <div className="user-img bg-size blur-up lazyloaded ">
            <Image src={userRedux?.avatar || `${ImagePath}/user-sm/1.jpg`} className="img-fluid lazyload bg-img rounded-circle" alt="user"  width={50} height={50}/>
            <span className="available-stats online" />
          </div>
          <Media body className="d-none d-md-block">
            <h4>{userRedux?.name}</h4>
            <span>{ActiveNow}</span>
          </Media>
        </Media>
      </a>
      <div ref={ref} className={`dropdown-menu dropdown-menu-right ${ isComponentVisible ? "show" : ""} `} style={{ position: "absolute", inset: "0px auto auto 0px", margin: "0px", transform: "translate(-101px, 54px)",}}>
        <div className="dropdown-header">
          <span>{Profile}</span>
          <div className="mobile-close" onClick={() => setIsComponentVisible(false)}>
            <h5>{Close}</h5>
          </div>
        </div>
        <div className="dropdown-content">
          <UserProfileMenu username={`${user?.username}`} isAdmin={userRedux?.is_admin} />
        </div>
      </div>
    </li>
  );
};

export default UserProfile;
