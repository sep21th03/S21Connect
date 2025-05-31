import { Href, ImagePath } from "../../utils/constant";
import { FC, useState } from "react";
import { Dropdown, DropdownMenu, DropdownToggle, Media } from "reactstrap";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { createPostDropDown } from "@/Data/common";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";
import Image from "next/image";

interface UserDropDownProps {
  setShowOption: (showOption: string) => void;
  showOption: string;
  user: any;
}

const UserDropDown: FC<UserDropDownProps> = ({setShowOption, showOption, user }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const selectedOption = createPostDropDown.find((opt) => opt.slug === showOption);
  const name = user?.first_name && user?.last_name ? user?.first_name + " " + user?.last_name : user?.name;
  return (
    <div className="user-info">
      <Media>
        <a href={Href} className="user-img bg-size blur-up lazyloaded">
          <Image
            src={`${user?.avatar}`}
            className="img-fluid lazyload bg-img rounded-circle"
            alt="user"
            width={50}
            height={50}
          />
        </a>
        <Media body>
          <a href={Href}>
            <h5>
              {name} 
            </h5>
          </a>
          <div className="setting-dropdown">
            <Dropdown
              isOpen={showDropDown}
              toggle={() => setShowDropDown(!showDropDown)}
              className="custom-dropdown arrow-none dropdown-sm btn-group"
            >
              <DropdownToggle color="transparent">
                <h6 onClick={() => setShowDropDown(!showDropDown)}>
                  <DynamicFeatherIcon
                    iconName={selectedOption?.icon}
                    className="icon-font-light left-icon iw-12 ih-12"
                  />
                  {selectedOption?.name}
                  <DynamicFeatherIcon
                    iconName="ChevronDown"
                    className=" iw-14"
                  />
                </h6>
              </DropdownToggle>
              <DropdownMenu>
                <ul>
                  {createPostDropDown.map((option) => (
                    <li key={option.slug}>
                      <a
                        href={Href}
                        className={
                          option.slug === showOption ? "active" : ""
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setShowOption(option.slug);
                          setShowDropDown(false);
                        }}
                      >
                        <DynamicFeatherIcon iconName={option.icon} />
                          {option.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </DropdownMenu>
            </Dropdown>
          </div>
        </Media>
      </Media>
    </div>
  );
};

export default UserDropDown;
