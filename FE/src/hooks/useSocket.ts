import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/redux-toolkit/slice/authSlice";
import { SharePostMetadata } from "@/components/Messenger/MessengerType";

let socket: Socket | null = null;

export interface User {
  id: string;
  username: string;
  socketId?: string;
  lastActive?: Date;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  group_id: string | null;
  content: string;
  type: "text" | "image" | "video" | "sticker" | "file" | "share_post";
  file_paths: string[] | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    last_active: string;
  };
  client_temp_id?: string;
  metadata?: SharePostMetadata;
  offset?: number;
}

export interface SendMessagePayload {
  content: string;
  receiver_id: string;
  conversation_id: string;
  type?: "text" | "image" | "video" | "sticker" | "file";
  file_paths?: string[];
  file_name?: string;
  file_type?: string;
  client_temp_id?: string;
}

export interface RecentMessage {
  id: string;
  name: string | null;
  type: "private" | "group";
  url: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  member_count: number;
  avatar: string;
  other_user: {
    id: string;
    username: string;
    name: string;
    last_active?: string;
    avatar?: string;
    nickname?: string;
  };
  members: [
    {
      id: string;
      username: string;
      name: string;
      last_active?: string;
      avatar?: string;
      nickname?: string;
    }
  ];
  latest_message?: {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender_id: string;
    sender_name: string;
  };
}


export interface TypingUser {
  user_id: string;
  username: string;
  conversation_id: string;
  is_typing: boolean;
}

export interface IncomingCall {
  caller_id: string;
  caller_name: string;
  call_type: "audio" | "video";
}

export interface CallOfferDetails {
  offer: RTCSessionDescriptionInit;
  call_type: "audio" | "video";
}

export interface Notification {
  id: string;
  userId: string;
  type: "birthday" | "reaction" | "comment" | "share" | "friend_request";
  content: string;
  link: string | null;
  is_read: boolean;
  from_user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function useSocket(
  onOnlineList: (users: User[]) => void,
  onNotification: (data: Notification) => void,
  onUnreadMessageUpdate?: (data: RecentMessage) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const onOnlineListRef = useRef(onOnlineList);
  const onNotificationCallbackRef = useRef(onNotification);
  const onUnreadMessageUpdateRef = useRef(onUnreadMessageUpdate);
  useEffect(() => {
    onOnlineListRef.current = onOnlineList;
    onNotificationCallbackRef.current = onNotification;
    onUnreadMessageUpdateRef.current = onUnreadMessageUpdate;
  }, [onOnlineList, onNotification, onUnreadMessageUpdate]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    if (!socket) {
      socket = io("http://localhost:3001", {
        auth: { token },
        reconnection: true,
      });
    }
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket?.emit("join_all_conversations");
      socket?.emit("get_online_users");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.emit("get_online_users");

    const handleOnlineUsers = (users: any) => {
      onOnlineListRef.current(users);
    };

    socket.on("online_users_list", handleOnlineUsers);

    socket.on("incoming_call", (call: IncomingCall) => {
      setIncomingCall(call);
    });
    const heartbeatInterval = setInterval(() => {
      if (socket?.connected) {
        socket.emit("heartbeat");
      }
    }, 30000);

    const handleNotification = (data: Notification) => {
      // console.log(data);
      if (typeof onNotificationCallbackRef.current === "function") {
        onNotificationCallbackRef.current(data);
      } else {
        console.warn("onNotificationCallbackRef.current is not a function:", onNotificationCallbackRef.current);
      }
      
    };

    const handleUnreadMessageUpdate = (data: RecentMessage) => {
      if (onUnreadMessageUpdateRef.current) {
        onUnreadMessageUpdateRef.current(data);
      }
    };

    socket.on("notification", handleNotification);

    socket.on("unread_message_update", handleUnreadMessageUpdate);

    return () => {
      clearInterval(heartbeatInterval);
      socket?.off("online_users_list", handleOnlineUsers);
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("incoming_call");
      socket?.off("notification", handleNotification);
      socket?.off("unread_message_update", handleUnreadMessageUpdate);
    };
  }, []);

  const joinChat = (conversationId: string) => {
    if (!socket?.connected) return;
    socket.emit("join_chat", { conversation_id: conversationId });
  };

  const leaveChat = (conversationId: string) => {
    if (!socket?.connected) return;
    socket.emit("leave_chat", { conversation_id: conversationId });
  };

  const sendMessage = (message: SendMessagePayload) => {
    if (!socket?.connected) {
      return false;
    }

    socket.emit("send_message", message);
    return true;
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    if (!socket?.connected) return;

    const handleNewMessage = (message: Message) => {
      callback(message);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket?.off("new_message", handleNewMessage);
    };
  };

  const setTypingStatus = (data: {
    conversation_id: string;
    is_typing: boolean;
  }) => {
    if (!socket?.connected) return;
    socket.emit("typing", data);
  };

  const onUserTyping = (callback: (typingData: TypingUser) => void) => {
    if (!socket?.connected) return;

    socket.on("user_typing", callback);

    return () => {
      socket?.off("user_typing", callback);
    };
  };

  const markMessagesAsRead = (conversationId: string) => {
    if (!socket?.connected) return;
    socket.emit("mark_as_read", { conversation_id: conversationId });
  };

  const onMessagesRead = (
    callback: (data: { conversation_id: string; user_id: string }) => void
  ) => {
    if (!socket?.connected) return;

    socket.on("messages_read", callback);

    return () => {
      socket?.off("messages_read", callback);
    };
  };

  const onUserStatusChanged = (
    callback: (data: {
      userId: string;
      username: string;
      status: "online" | "offline";
    }) => void
  ) => {
    if (!socket?.connected) return;

    socket.on("user_status_changed", callback);

    return () => {
      socket?.off("user_status_changed", callback);
    };
  };

  const onImageUploadStatus = (
    callback: (data: { status: string; url?: string; message?: string }) => void
  ) => {
    if (!socket?.connected) return;
    socket?.on("image-upload-status", callback);

    return () => {
      socket?.off("image_upload_status", callback);
    };
  };

  const initiateCall = (
    receiverId: string,
    offer: RTCSessionDescriptionInit,
    callType: "audio" | "video"
  ) => {
    if (!socket?.connected) return false;
    socket.emit("call_offer", {
      receiver_id: receiverId,
      offer,
      call_type: callType,
    });
    return true;
  };

  const getCallOffer = (
    callerId: string,
    callback: (offerDetails: CallOfferDetails) => void
  ) => {
    if (!socket?.connected) return false;

    socket.emit("get_call_offer", { caller_id: callerId });

    const handleOfferDetails = (details: CallOfferDetails) => {
      callback(details);
      socket?.off("call_offer_details", handleOfferDetails);
    };

    socket.on("call_offer_details", handleOfferDetails);
    return true;
  };

  const answerCall = (callerId: string, answer: RTCSessionDescriptionInit) => {
    if (!socket?.connected) return false;
    socket.emit("call_answer", { caller_id: callerId, answer });
    setIncomingCall(null);
    return true;
  };

  const rejectCall = (callerId: string) => {
    if (!socket?.connected) return false;
    socket.emit("call_reject", { caller_id: callerId });
    setIncomingCall(null);
    return true;
  };

  const sendIceCandidate = (peerId: string, candidate: RTCIceCandidateInit) => {
    if (!socket?.connected) return false;
    socket.emit("call_ice_candidate", { peer_id: peerId, candidate });
    return true;
  };

  const onCallAnswer = (
    callback: (data: {
      answer: RTCSessionDescriptionInit;
      user_id: string;
    }) => void
  ) => {
    if (!socket) return;
    socket.on("call_answer", callback);
    return () => {
      socket?.off("call_answer", callback);
    };
  };

  const onIceCandidate = (
    callback: (data: {
      candidate: RTCIceCandidateInit;
      from_user_id: string;
    }) => void
  ) => {
    if (!socket) return;
    socket.on("call_ice_candidate", callback);
    return () => {
      socket?.off("call_ice_candidate", callback);
    };
  };

  const endCall = (peerId: string) => {
    if (!socket?.connected) return false;
    socket.emit("call_end", { peer_id: peerId });
    return true;
  };

  const onCallEnded = (callback: (data: { from_user_id: string }) => void) => {
    if (!socket) return;
    socket.on("call_end", callback);
    return () => {
      socket?.off("call_end", callback);
    };
  };

  const onCallRejected = (
    callback: (data: { reason: string; user_id: string }) => void
  ) => {
    if (!socket) return;
    socket.on("call_rejected", callback);
    return () => {
      socket?.off("call_rejected", callback);
    };
  };

  const onCallError = (callback: (data: { message: string }) => void) => {
    if (!socket) return;
    socket.on("call_error", callback);
    return () => {
      socket?.off("call_error", callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    onNewMessage,
    setTypingStatus,
    onUserTyping,
    markMessagesAsRead,
    onMessagesRead,
    onUserStatusChanged,
    onImageUploadStatus,
    initiateCall,
    getCallOffer,
    answerCall,
    rejectCall,
    endCall,
    onCallRejected,
    incomingCall,
  };
}
