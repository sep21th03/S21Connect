import CustomImage from "@/Common/CustomImage";
import React, { FC, useEffect, useState } from "react";
import { UserChatInterFace } from "../MessengerType";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Media } from "reactstrap";
import { ImagePath } from "../../../utils/constant";
import { Href } from "../../../utils/constant/index";
import ChatHistory from "./ChatHistory";
import Image from "next/image";
import { useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
const UserChat: FC<UserChatInterFace> = ({
  user,
  setUserList,
  setActiveTab,
  onlineUsers,
  initialConversationId,
}) => {
  const [lastActive, setLastActive] = useState<string>("");
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const {
    socket,
    incomingCall,
    answerCall,
    rejectCall,
    endCall,
    onCallRejected,
  } = useSocket((users) => console.log(users), (conversationId) => console.log(conversationId));
  useEffect(() => {
    if (user?.other_user.last_active) {
      const lastActiveDate = new Date(user.other_user.last_active);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 60) {
        setLastActive(`${diffInMinutes}m ago`);
      } else if (diffInMinutes < 1440) {
        setLastActive(`${Math.floor(diffInMinutes / 60)}h ago`);
      } else {
        setLastActive(`${Math.floor(diffInMinutes / 1440)}d ago`);
      }
    }
  }, [user?.other_user.last_active]);
  return (
    <div className="user-chat">
      <div className="user-title">
        <div
          className="back-btn d-block d-sm-none "
          onClick={() => setActiveTab && setActiveTab(null)}
        >
          <DynamicFeatherIcon iconName="ArrowLeft" />
        </div>
        <Media className="list-media">
          <div className="story-img">
            <div className="user-img bg-size blur-up lazyloaded">
              <Image
                src={
                  user
                    ? user.other_user?.avatar || `${ImagePath}/icon/user.png`
                    : ""
                }
                className="img-fluid lazyload bg-img rounded-circle"
                alt="user"
                width={120}
                height={120}
              />
            </div>
          </div>
          <Media body>
            <h5>{user?.other_user.name}</h5>
            <h6>
              {onlineUsers.includes(user?.other_user.id || "") ? (
                <span className="status online">
                  <span className="status-dot"></span> online
                </span>
              ) : (
                `Hoạt động lần cuối ${lastActive}`
              )}
            </h6>
          </Media>
        </Media>
        <div className="menu-option">
          <ul>
            <li>
              <a href={Href}>
                <DynamicFeatherIcon iconName="Phone" className="icon-dark" />
              </a>
            </li>
            <li>
              <a href={Href}>
                <DynamicFeatherIcon iconName="Video" className="icon-dark" />
              </a>
            </li>
            <li>
              <a href={Href}>
                <DynamicFeatherIcon iconName="Settings" className="icon-dark" />
              </a>
            </li>
            <li className="d-block d-lg-none info-user">
              <a href={Href}>
                <DynamicFeatherIcon iconName="Info" className="icon-dark" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <ChatHistory
        user={user}
        setUserList={setUserList}
        initialConversationId={initialConversationId}
      />
    </div>
  );
};

export default UserChat;
