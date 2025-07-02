import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { UserChatInterFace } from "../MessengerType";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Media } from "reactstrap";
import { ImagePath } from "../../../utils/constant";
import { Href } from "../../../utils/constant/index";
import ChatHistory from "./ChatHistory";
import Image from "next/image";
import { useSocket } from "@/hooks/useSocket";
import { CallModal, IncomingCallModal } from "./CallModal";

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
  const [showCallModal, setShowCallModal] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<"audio" | "video">(
    "audio"
  );

  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const {
    socket,
    incomingCall,
    currentCall,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    sendIceCandidate,
    onCallAnswered,
    onIceCandidate,
    onCallEnded,
    onCallRejected,
    onCallError,
  } = useSocket(
    (users) => console.log(users),
    (notification) => console.log(notification),
    undefined,
    true
  );

  const rtcConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:your-turn-server.com",
        username: "username",
        credential: "password",
      },
    ],
  };

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(rtcConfiguration);

    pc.onicecandidate = (event) => {
      console.log("ICE candidate:", event.candidate);
      if (event.candidate && currentCall?.callId) {
        sendIceCandidate(currentCall.callId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote stream:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log("Remote track:", track.kind, track.id, track.enabled);
      });
      setRemoteStream(event.streams[0]);
      setIsCallConnected(true);
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC Connection state for user:", user?.other_user?.id || user?.id, pc.connectionState);
      if (pc.connectionState === "connected") {
        console.log("WebRTC connection established successfully!");
        setIsCallConnected(true);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        console.log("WebRTC connection failed or disconnected");
        handleCallEnd();
      }
    };

    return pc;
  }, [currentCall?.callId, sendIceCandidate]);

  const getUserMedia = async (video: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: 640, height: 480 } : false,
      });
      console.log("getUserMedia success:", stream);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access camera/microphone. Please check permissions.");
      return null;
    }
  };

  const startCall = async (callType: "audio" | "video") => {
    if (!user?.other_user?.id || user.type !== "private") return;

    try {
      const stream = await getUserMedia(callType === "video");
      if (!stream) return;

      const pc = createPeerConnection();
      setPeerConnection(pc);

      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track);
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const success = initiateCall(user.other_user.id, offer, callType);
      if (success) {
        setCurrentCallType(callType);
        setShowCallModal(true);
      }
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Failed to start call");
    }
  };

  // Handle incoming call
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await getUserMedia(incomingCall.call_type === "video");
      if (!stream) return;

      const pc = createPeerConnection();
      setPeerConnection(pc);

      // Add local stream
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track);
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(incomingCall.offer);

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      answerCall(incomingCall.call_id, answer);

      setCurrentCallType(incomingCall.call_type);
      setShowCallModal(true);
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Failed to accept call");
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      rejectCall(incomingCall.call_id);
    }
  };

  const handleCallEnd = () => {
    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    // End call through socket
    if (currentCall?.callId) {
      endCall(currentCall.callId);
    }

    // Reset UI state
    setShowCallModal(false);
    setIsCallConnected(false);
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const unsubscribeCallAnswered = onCallAnswered(async (data) => {
      console.log("Call answered:", data);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(data.answer);
      }
    });

    const unsubscribeIceCandidate = onIceCandidate(async (data) => {
      console.log("Received ICE candidate:", data);
      if (peerConnection && data.candidate) {
        try {
          await peerConnection.addIceCandidate(data.candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    const unsubscribeCallEnded = onCallEnded((data) => {
      console.log("Call ended:", data);
      handleCallEnd();
    });

    const unsubscribeCallRejected = onCallRejected((data) => {
      console.log("Call rejected:", data);
      handleCallEnd();
    });

    const unsubscribeCallError = onCallError((data) => {
      console.error("Call error:", data);
      alert(`Call error: ${data.message}`);
      handleCallEnd();
    });

    return () => {
      unsubscribeCallAnswered?.();
      unsubscribeIceCandidate?.();
      unsubscribeCallEnded?.();
      unsubscribeCallRejected?.();
      unsubscribeCallError?.();
    };
  }, [
    socket,
    peerConnection,
    onCallAnswered,
    onIceCandidate,
    onCallEnded,
    onCallRejected,
    onCallError,
  ]);

  // Handle click outside settings dropdown
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

  // Calculate last active time
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

  useEffect(() => {
    console.log("IncomingCall state changed:", incomingCall);
  }, [incomingCall]);

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
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      startCall("audio");
                    }}
                  >
                    <DynamicFeatherIcon
                      iconName="Phone"
                      className="icon-dark"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      startCall("video");
                    }}
                  >
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

      <IncomingCallModal
        isOpen={!!incomingCall}
        callerName={incomingCall?.caller_name || "Unknown"}
        callType={incomingCall?.call_type || "audio"}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <CallModal
        isOpen={showCallModal}
        onClose={handleCallEnd}
        isVideo={currentCallType === "video"}
        remoteStream={remoteStream}
        localStream={localStream}
        isConnected={isCallConnected}
        onEndCall={handleCallEnd}
        userName={chatName}
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
