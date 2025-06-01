import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Media,
} from "reactstrap";
import { NavLink } from "reactstrap";
import { NavItem } from "reactstrap";
import { ImagePath } from "../../utils/constant";
import { formatTime } from "@/utils/formatTime";
import React, { useState } from "react";
import { RecentMessage } from "@/hooks/useSocket";
import Image from "next/image";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { useRouter } from "next/navigation";
import { archiveConversation } from "@/service/messageService";

const ChatUserItem = React.memo(
  ({
    data,
    active,
    onClick,
    online,
    sessionUserId,
  }: {
    data: RecentMessage;
    active: boolean;
    onClick: () => void;
    online: boolean;
    sessionUserId?: string;
  }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isIconVisible, setIsIconVisible] = useState(false);

    const renderContentPreview = (
      content?: string,
      senderId?: string,
      sessionUserId?: string,
      senderName?: string,
      type?: string
    ) => {
      if (!content) return "";

      const imageRegex = /\.(jpeg|jpg|gif|png|webp)$/i;
      const isImageUrl =
        imageRegex.test(content) ||
        (content.startsWith("http") &&
          imageRegex.test(new URL(content).pathname));

      if (isImageUrl) {
        return senderId === sessionUserId
          ? "Bạn đã gửi 1 ảnh"
          : `${senderName || "Người dùng"} đã gửi 1 ảnh`;
      }
      if (type === "share_post") {
        return senderId === sessionUserId
          ? "Bạn đã chia sẻ 1 bài viết"
          : `${senderName || "Người dùng"} đã chia sẻ 1 bài viết`;
      }

      return senderId === sessionUserId ? `Bạn: ${content}` : content;
    };

    const router = useRouter();

    const chatDropdownOptions = [
      {
        iconName: "User",
        label: "Xem hồ sơ",
        onClick: () =>
          router.push(`/profile/timeline/${data.other_user.username}`),
      },
      {
        iconName: "Trash2",
        label: "Xóa hội thoại",
        onClick: () => console.log("Xóa hội thoại"),
      },
      {
        iconName: "Slash",
        label: "Chặn người dùng",
        onClick: () => console.log("Chặn người dùng"),
      },
      {
        iconName: "Archive",
        label: "Lưu hội thoại",
        onClick: () => archiveConversation(data.id, !data.is_archived),
      },
    ];

    return (
      <NavItem
        className="d-flex justify-content-between align-items-center px-2"
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setIsIconVisible(true)}
        onMouseLeave={() => {
          setIsIconVisible(false);
          setIsDropdownOpen(false);
        }}
      >
        <NavLink
          className={active ? "active" : ""}
          onClick={onClick}
          style={{ cursor: "pointer", width: "100%", zIndex: 1 }}
        >
          <Media className="list-media">
            <div className="story-img">
              <div className="user-img bg-size blur-up lazyloaded">
                <Image
                  src={data.other_user.avatar || `${ImagePath}/icon/user.png`}
                  className="img-fluid blur-up bg-img lazyloaded rounded-circle"
                  alt="user"
                  width={120}
                  height={120}
                />
              </div>
            </div>
            <Media body>
              <h5>
                {data.other_user.name}
                <span>{formatTime(data.latest_message?.created_at || "")}</span>
              </h5>
              <h6>{online ? "online" : "offline"}</h6>
            </Media>
          </Media>
          {data.unread_count && data.unread_count > 0 ? (
            <div className="chat">
              <h6 style={{ color: "black", fontWeight: "bold" }}>
                {data.latest_message?.sender_id === sessionUserId
                  ? `${renderContentPreview(
                      data.latest_message?.content,
                      data.latest_message?.sender_id,
                      sessionUserId,
                      data.other_user.name,
                      data.latest_message?.type
                    )}`
                  : renderContentPreview(
                      data.latest_message?.content,
                      data.latest_message?.sender_id,
                      sessionUserId,
                      data.other_user.name,
                      data.latest_message?.type
                    )}
              </h6>
              <span className="count">{data.unread_count}</span>
            </div>
          ) : (
            <h6>
              {data.latest_message?.sender_id === sessionUserId
                ? `${renderContentPreview(
                    data.latest_message?.content,
                    data.latest_message?.sender_id,
                    sessionUserId,
                    data.other_user.name,
                    data.latest_message?.type
                  )}`
                : renderContentPreview(
                    data.latest_message?.content,
                    data.latest_message?.sender_id,
                    sessionUserId,
                    data.other_user.name,
                    data.latest_message?.type
                  )}
            </h6>
          )}
        </NavLink>
        {isIconVisible && (
          <div className="dropdown-wrapper">
            <Dropdown
              isOpen={isDropdownOpen}
              toggle={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <DropdownToggle
                tag="span"
                data-toggle="dropdown"
                aria-expanded={isDropdownOpen}
                style={{ cursor: "pointer" }}
              >
                <DynamicFeatherIcon
                  iconName="MoreHorizontal"
                  className="icon icon-font-color iw-14"
                />
              </DropdownToggle>
              <DropdownMenu end>
                {chatDropdownOptions.map((item, index) => (
                  <DropdownItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                    }}
                    className="d-flex align-items-center gap-2"
                  >
                    <DynamicFeatherIcon
                      iconName={item.iconName as any}
                      className="iw-14"
                    />
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </NavItem>
    );
  }
);

export default React.memo(ChatUserItem, (prevProps, nextProps) => {
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.unread_count === nextProps.data.unread_count &&
    prevProps.active === nextProps.active &&
    prevProps.online === nextProps.online &&
    prevProps.data.latest_message?.id === nextProps.data.latest_message?.id
  );
});
