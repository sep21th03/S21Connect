import { Media } from "reactstrap";
import { NavLink } from "reactstrap";
import { NavItem } from "reactstrap";;
import { ImagePath } from "../../utils/constant";
import { formatTime } from "@/utils/formatTime";
import React from "react";
import { RecentMessage } from "@/hooks/useSocket";
import Image from "next/image";

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
    const renderContentPreview = (
      content?: string,
      senderId?: string,
      sessionUserId?: string,
      senderName?: string,
      type?: string
    ) => {
      if (!content) return "";
    
      const imageRegex = /\.(jpeg|jpg|gif|png|webp)$/i;
      const isImageUrl = imageRegex.test(content) || (content.startsWith("http") && imageRegex.test(new URL(content).pathname));
    
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
    
    return (
      <NavItem>
        <NavLink className={active ? "active" : ""} onClick={onClick}>
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
                  ? `${renderContentPreview(data.latest_message?.content, data.latest_message?.sender_id, sessionUserId, data.other_user.name, data.latest_message?.type)}`
                  : renderContentPreview(data.latest_message?.content, data.latest_message?.sender_id, sessionUserId, data.other_user.name, data.latest_message?.type)}
              </h6>
              <span className="count">{data.unread_count}</span>
            </div>
          ) : (
            <h6>
              {data.latest_message?.sender_id === sessionUserId
                ? `${renderContentPreview(data.latest_message?.content, data.latest_message?.sender_id, sessionUserId, data.other_user.name, data.latest_message?.type)}`
                : renderContentPreview(data.latest_message?.content, data.latest_message?.sender_id, sessionUserId, data.other_user.name, data.latest_message?.type)}
            </h6>
          )}
        </NavLink>
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
