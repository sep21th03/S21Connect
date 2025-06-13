import { FC } from "react";
import { Href } from "../../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";

const Headers: FC = () => {
  return (
    <div className="profile-menu section-b-space ms-0 me-0 mt-3">
      <ul>
        <li className="active">
          <a href={Href}>
            <DynamicFeatherIcon iconName="Clock" className="iw-14 ih-14" />
            <h6>hữu ích nhất</h6>
          </a>
        </li>
        <li>
          <a href={Href}>
            <DynamicFeatherIcon iconName="Info" className="iw-14 ih-14" />
            <h6>mới nhất</h6>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Headers;
