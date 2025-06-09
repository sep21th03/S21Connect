import {
  Followers,
  Following,
  Filter,
  Href,
  AllFriends,
  CloseFriends,
} from "../../utils/constant";
import React, { FC, useState } from "react";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";

const FriendSDropDown: FC<{
  filteredFriends: string;
  setFilteredFriends: (value: string) => void;
  isOwnProfile: boolean;
}> = ({ filteredFriends, setFilteredFriends, isOwnProfile }) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const toggleDropDown = () => setDropDownOpen(!dropDownOpen);

  return (
    <div className="mx-2 setting-dropdown">
      <Dropdown
        isOpen={dropDownOpen}
        toggle={toggleDropDown}
        className="btn-group custom-dropdown arrow-none dropdown-sm"
      >
        <DropdownToggle color="transparent">
          <a href={Href}>{Filter}</a>
        </DropdownToggle>
        <DropdownMenu>
          <ul>
            <li className={filteredFriends === `${isOwnProfile ? "all" : "mutual"}` ? "active" : ""}>
              <a href={Href} onClick={() => setFilteredFriends(`${isOwnProfile ? "all" : "mutual"}`)}>
                {isOwnProfile ? AllFriends : CloseFriends}
              </a>
            </li>
            <li className={filteredFriends === "followers" ? "active" : ""}>
              <a href={Href} onClick={() => setFilteredFriends("followers")}>
                {" "}
                {Followers}
              </a>
            </li>
            <li className={filteredFriends === "following" ? "active" : ""}>
              <a href={Href} onClick={() => setFilteredFriends("following")}>
                {Following}
              </a>
            </li>
          </ul>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default FriendSDropDown;
