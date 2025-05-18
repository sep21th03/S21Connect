import { Dashboard } from "@/utils/constant";
import { SvgPath } from "@/utils/constant";
import SideBarMenus from "./SideBarMenus";
import Image from "next/image";

const AdminSidebar = () => {
  return (
    <div className="sidebar-panel panel-lg">
      <div className="main-icon">
        <a href={"/admin"}>
          <Image
            width={22}
            height={22}
            src={`${SvgPath}/sidebar-vector/menu.svg`}
            className="bar-icon-img"
            alt="menu"
          />
          <h4>{Dashboard}</h4>
        </a>
      </div>
      <SideBarMenus />
    </div>
  );
};

export default AdminSidebar;
