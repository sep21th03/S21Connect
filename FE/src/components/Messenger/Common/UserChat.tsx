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
  messagesOffset,
  showUserInfo,
  setShowUserInfo,
  groupMembers,
}) => {
  const [lastActive, setLastActive] = useState<string>("");
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(true);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const {
    socket,
  } = useSocket(
    (users) => console.log(users),
    (conversationId) => console.log(conversationId)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user?.type === "private" && user?.other_user?.last_active) {
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
    } else {
      setLastActive("");
    }
  }, [user?.other_user?.last_active, user?.type]);

  const handleToggleInfiniteScroll = () => {
    setEnableInfiniteScroll(!enableInfiniteScroll);
    setShowSettingsDropdown(false);
  };
  const chatAvatar =
    user?.type === "group"
      ? user.avatar || `${ImagePath}/icon/group.png`
      : user?.other_user?.avatar || `${ImagePath}/icon/user.png`;

  const chatName =
    user?.type === "group"
      ? user.name || "Nhóm chat"
      : user?.other_user?.nickname || user?.other_user?.name || "Người dùng";
  return (
    <div className="user-chat" style={{ width: showUserInfo ? "" : "100%" }}>
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
              {user?.type === "group" ? (
                <div className="group-avatar-wrapper">
                  <div className="avatar avatar-1">
                    <Image
                      src={
                        groupMembers?.members?.[0]?.avatar ||
                        `${ImagePath}/icon/user.png`
                      }
                      alt="member1"
                      width={40}
                      height={40}
                      className="rounded-circle"
                    />
                  </div>
                  <div className="avatar avatar-2">
                    <Image
                      src={
                        groupMembers?.members?.[1]?.avatar ||
                        `${ImagePath}/icon/user.png`
                      }
                      alt="member2"
                      width={40}
                      height={40}
                      className="rounded-circle"
                    />
                  </div>
                </div>
              ) : (
                <Image
                  src={chatAvatar}
                  className="img-fluid lazyload bg-img rounded-circle"
                  alt="user"
                  width={120}
                  height={120}
                />
              )}
            </div>
          </div>
          <Media body>
            <h5>
              {user?.type === "group"
                ? groupMembers.conversation_name
                : chatName}
            </h5>
            <h6>
              {user?.type === "group" ? (
                <span>{`${groupMembers.member_count || 0} thành viên`}</span>
              ) : onlineUsers.includes(user?.other_user?.id || "") ? (
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
            {user?.type === "group" ? (
              <li>
                <a href={Href}>
                  <DynamicFeatherIcon iconName="Users" className="icon-dark" />
                </a>
              </li>
            ) : (
              <>
                <li>
                  <a href={Href}>
                    <DynamicFeatherIcon
                      iconName="Phone"
                      className="icon-dark"
                    />
                  </a>
                </li>
                <li>
                  <a href={Href}>
                    <DynamicFeatherIcon
                      iconName="Video"
                      className="icon-dark"
                    />
                  </a>
                </li>
              </>
            )}
            <li style={{ position: "relative" }}>
              <div
                ref={
                  settingsDropdownRef as unknown as React.RefObject<HTMLDivElement>
                }
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowSettingsDropdown(!showSettingsDropdown);
                  }}
                >
                  <DynamicFeatherIcon
                    iconName="Settings"
                    className="icon-dark"
                  />
                </a>

                {showSettingsDropdown && (
                  <div
                    className="settings-dropdown"
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      backgroundColor: "white",
                      border: "1px solid #e4e6ea",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      minWidth: "200px",
                      zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={handleToggleInfiniteScroll}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <DynamicFeatherIcon
                          iconName={
                            enableInfiniteScroll ? "RotateCcw" : "Square"
                          }
                        />
                        <span>Tự động tải tin nhắn</span>
                      </div>
                      <div
                        style={{
                          width: "40px",
                          height: "20px",
                          backgroundColor: enableInfiniteScroll
                            ? "#42b883"
                            : "#ccc",
                          borderRadius: "10px",
                          position: "relative",
                          transition: "background-color 0.3s",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            position: "absolute",
                            top: "2px",
                            left: enableInfiniteScroll ? "22px" : "2px",
                            transition: "left 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
            <li className="d-block info-user">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowUserInfo && setShowUserInfo?.((prev) => !prev);
                }}
              >
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
        enableInfiniteScroll={enableInfiniteScroll}
        messagesOffset={messagesOffset}
      />

      <style jsx>{`
        .group-avatar-wrapper {
          position: relative;
          width: 40px;
          height: 40px;

          .avatar {
            position: absolute;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            overflow: hidden;

            &.avatar-1 {
              top: 0;
              left: 0;
              z-index: 2;
            }

            &.avatar-2 {
              bottom: 0;
              right: 0;
              z-index: 1;
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default UserChat;
