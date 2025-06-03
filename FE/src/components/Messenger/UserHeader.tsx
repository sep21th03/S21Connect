import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Href } from "../../utils/constant";
import Link from "next/link";
import { DropdownToggle, DropdownItem, DropdownMenu, Dropdown, Input } from "reactstrap";
import { useMessengerContext } from "@/contexts/MessengerContext";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "@/redux-toolkit/slice/groupChatSlice";

const UserHeader = ({ onSearch }: { onSearch: (searchTerm: string) => void }) => {
  const { showArchived, setShowArchived } = useMessengerContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  const handleCreateGroup = () => {
    dispatch(openModal());
    setIsDropdownOpen(false);
  };

  return (
    <div className="user-header">
      {showArchived ? (
        <div className="archived-header d-flex align-items-center gap-2">
          <span
            onClick={() => setShowArchived(false)}
            style={{ cursor: "pointer" }}
            className="back-btn"
          >
            <DynamicFeatherIcon iconName="ArrowLeft" className="ih-18 iw-18" />
          </span>
          <h5 className="m-0">Đoạn chat đã lưu trữ</h5>
        </div>
      ) : (
        <>
          <Link href="/newsfeed/style1" className="back-btn d-block d-sm-none tesetese">
            <DynamicFeatherIcon iconName="ArrowLeft" className="ih-18 iw-18" />
          </Link>
          <div className="search-bar">
            <DynamicFeatherIcon iconName="Search" className="icon-theme icon iw-16" />
            <Input
              type="text"
              placeholder="Tìm cuộc trò chuyện..."
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </>
      )}
      <div className="new-chat">
        <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
          <DropdownToggle tag="span" style={{ cursor: "pointer" }}>
            <DynamicFeatherIcon iconName="Edit" className="icon-light iw-14 ih-14" />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem
              onClick={() => setShowArchived(true)}
              className="d-flex align-items-center gap-2"
            >
              <DynamicFeatherIcon iconName="Archive" className="iw-14" />
              Cuộc hội thoại đã lưu trữ
            </DropdownItem>
            <DropdownItem
               onClick={handleCreateGroup}
              className="d-flex align-items-center gap-2"
            >
              <DynamicFeatherIcon iconName="Users" className="iw-14" />
              Tạo nhóm
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default UserHeader;