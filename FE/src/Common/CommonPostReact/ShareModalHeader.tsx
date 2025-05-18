import { FC, useState } from "react";
import {Dropdown,DropdownMenu,DropdownToggle} from "reactstrap";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { Href, ShareAsPost } from "../../utils/constant";

interface ShareModalHeaderProps {
  shareOption: string;
  setShareOption: (option: string) => void;
}

const ShareModalHeader: FC<ShareModalHeaderProps> = ({ shareOption, setShareOption }) => {
  const [postDropDown, setPostDropDown] = useState(false);
  const dropDownList = ["public","friends","private"];

  return (
    <div className="setting-dropdown">
      <Dropdown isOpen={postDropDown} toggle={() => setPostDropDown(!postDropDown)} className="custom-dropdown arrow-none dropdown-sm btn-group">
        <DropdownToggle color="transparent">
          <h5>
            {shareOption}
            <DynamicFeatherIcon iconName="ChevronDown" className="iw-14" />
          </h5>
        </DropdownToggle>
        <DropdownMenu>
          <ul>
            {dropDownList.map((data, index) => (
              <li key={index}>
                <a href={Href} onClick={() => {setShareOption(data); setPostDropDown(false);}} className={shareOption === data ? "active" : ""}>
                  {data}
                </a>
              </li>
            ))}
          </ul>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default ShareModalHeader;
