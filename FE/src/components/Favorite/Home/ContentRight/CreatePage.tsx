import CustomImage from "@/Common/CustomImage";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Domain, ImagePath } from "../../../../utils/constant";
import React, { FC, useState } from "react";
import { Href } from "../../../../utils/constant/index";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import Image from "next/image";

const CreatePage: FC = () => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  return (
    <div className="birthday-section create-page bg-size blur-up lazyloaded">
      <CustomImage src={`${ImagePath}/create_page.jpg`} className="img-fluid blur-up lazyload bg-img" alt="birthday"/>
      <div className="birthday-top">
        <div className="setting">
          <div className="setting-btn light-btn">
            <a href={Href} className="d-flex">
              <DynamicFeatherIcon iconName="RotateCw" className="icon icon-light stroke-width-3 iw-11 ih-11"/>
            </a>
          </div>
          <div className="setting-btn light-btn setting-dropdown">
            <Dropdown className="btn-group custom-dropdown arrow-none dropdown-sm" isOpen={dropDownOpen} toggle={() => setDropDownOpen(!dropDownOpen)}>
              <DropdownToggle color="transparent">
                <a className="d-flex" href={Href}>
                  <DynamicFeatherIcon iconName="Sun" className="icon-light stroke-width-3 iw-12 ih-12"/>
                </a>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu dropdown-menu-right custom-dropdown">
                <ul>
                  <li>
                    <a href={Href}>
                      <DynamicFeatherIcon iconName="Edit" className="icon-font-light iw-16 ih-16"/>edit profile
                    </a>
                  </li>
                  <li>
                    <a href={Href}>
                      <DynamicFeatherIcon iconName="User" className="icon-font-light iw-16 ih-16"/>view profile
                    </a>
                  </li>
                </ul>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="birthday-content">
        <div className="image-section">
          <div className="event-group">
            <div className="center-profile">
              <img src={`${ImagePath}/icon/electricity.png`} className="img-fluid blur-up m-auto lazyloaded" alt="user"/>
            </div>
          </div>
        </div>
        <div className="details">
          <h3>tạo trang của bạn</h3>
          <h6>tạo trang dành riêng cho bạn ngay</h6>
          <p></p>
          <div className="create-btn">
            <a href={`${Domain}/favourite/pages`} className="btn" target="_blank">tạo trang</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
