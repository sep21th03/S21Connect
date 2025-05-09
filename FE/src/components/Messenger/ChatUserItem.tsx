import { Media } from "reactstrap";
import { NavLink } from "reactstrap";
import { NavItem } from "reactstrap";
import { SingleUser } from "./MessengerType";
import CustomImage from "@/Common/CustomImage";
import { ImagePath } from "../../utils/constant";
import { formatTime } from "@/utils/formatTime";
import React from "react";

const ChatUserItem = React.memo(
  ({
    data,
    active,
    onClick,
    online,
    sessionUserId,
  }: {
    data: SingleUser;
    active: boolean;
    onClick: () => void;
    online: boolean;
    sessionUserId?: string;
  }) => {
    return (
      <NavItem>
        <NavLink className={active ? "active" : ""} onClick={onClick}>
          <Media className="list-media">
            <div className="story-img">
              <div className="user-img bg-size blur-up lazyloaded">
                <CustomImage
                  src={`${ImagePath}/user/${data.id}.jpg`}
                  className="img-fluid blur-up bg-img lazyloaded"
                  alt="user"
                />
              </div>
            </div>
            <Media body>
              <h5>
                {data.name}
                <span>{formatTime(data.latest_message?.created_at || "")}</span>
              </h5>
              <h6>{online ? "online" : "offline"}</h6>
            </Media>
          </Media>
          {data.unread_count && data.unread_count > 0 ? (
            <div className="chat">
              <h6 style={{ color: "black", fontWeight: "bold" }}>
                {data.latest_message?.sender?.id === sessionUserId
                  ? `Bạn: ${data.latest_message?.content}`
                  : data.latest_message?.content}
              </h6>
              <span className="count">{data.unread_count}</span>
            </div>
          ) : (
            <h6>
              {data.latest_message?.sender?.id === sessionUserId
                ? `Bạn: ${data.latest_message?.content}`
                : data.latest_message?.content}
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
