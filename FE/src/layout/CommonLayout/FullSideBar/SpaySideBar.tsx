import Image from "next/image";
import { FC } from "react";
import { Href, SvgPath, SpayApps } from "../../../utils/constant/index";
import SideBarMenus from "./SideBarMenus";

const SpaySideBar: FC = () => {
  return (
    <div className="sidebar-panel panel-lg">
      <div className="main-icon">
        <a href={Href}>
          <Image
            width={22}
            height={22}
            src={`${SvgPath}/sidebar-vector/menu.svg`}
            className="bar-icon-img"
            alt="menu"
          />
          <h4>{SpayApps}</h4>
        </a>
      </div>
      <SideBarMenus />
    </div>
  );
};

export default SpaySideBar;
