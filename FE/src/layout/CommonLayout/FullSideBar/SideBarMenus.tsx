import { spaySideBarData } from "@/Data/common";
import React, { FC } from "react";
import { SvgPath } from "../../../utils/constant/index";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SideBarMenus: FC = () => {
  const pathname = usePathname();
  return (
    <ul className="sidebar-icon">
      {spaySideBarData.map((data, index) => (
        <li className={pathname === data.link ? "active" : ""} key={index}>
          <a href={data.link}>
            <Image
              width={22}
              height={22}
              src={`${SvgPath}/sidebar-vector/${data.iconName}.svg`}
              className="bar-icon-img"
              alt="news"
            />
            <h4>{data.title}</h4>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SideBarMenus;
