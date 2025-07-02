import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/redux-toolkit/slice/authSlice";
import { SharePostMetadata } from "@/components/Messenger/MessengerType";
import { SoundNotification, useSoundNotification } from "@/utils/soundEffect";

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
  receiver_id?: string;
  conversation_id?: string;
  type?: "text" | "image" | "video" | "sticker" | "file";
  file_paths?: string[];
  file_name?: string;
  file_type?: string;
  client_temp_id?: string;
  user_ids?: string[];
  group_name?: string;
  group_avatar?: string;
  metadata?: SharePostMetadata;
}

export interface UserData {
  id: string;
  username: string;
  name: string;
  last_active?: string;
  avatar?: string;
  nickname?: string;
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
  other_user: UserData;
  members: {
    id: string;
    username: string;
    name: string;
    last_active?: string;
    avatar?: string;
    nickname?: string;
  }[];
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
  call_id: string;
  caller_id: string;
  caller_name: string;
  call_type: "audio" | "video";
  offer: RTCSessionDescriptionInit;
}

export interface CallOfferDetails {
  call_id: string;
  offer: RTCSessionDescriptionInit;
  call_type: "audio" | "video";
  caller_id: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "birthday" | "reaction" | "comment" | "share" | "friend_request";
  content: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  from_user: {
    id: string;
    name: string;
    avatar: string;
  };
  post_id: string;
}

export interface CallSession {
  callId: string;
  isActive: boolean;
  callType: "audio" | "video";
  peerId: string;
  status: "ringing" | "connected" | "ended";
}

export function useSocket(
  onOnlineList: (users: User[]) => void,
  onNotification: (data: Notification) => void,
  onUnreadMessageUpdate?: (data: RecentMessage) => void,
  soundEnabled?: boolean
) {
  const socketRef = useRef<Socket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const onOnlineListRef = useRef(onOnlineList);
  const onNotificationCallbackRef = useRef(onNotification);
  const onUnreadMessageUpdateRef = useRef(onUnreadMessageUpdate);

  const { playNotificationSound } = useSoundNotification();

  useEffect(() => {
    onOnlineListRef.current = onOnlineList;
    onNotificationCallbackRef.current = onNotification;
    onUnreadMessageUpdateRef.current = onUnreadMessageUpdate;
  }, [onOnlineList, onNotification, onUnreadMessageUpdate]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    //http://localhost:3001
  // https://node-s21.codetifytech.io.vn/
    const initializeSocket = () => {
      if (!socket || socket.disconnected) {
        socket = io("https://node-s21.codetifytech.io.vn/", {
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
        });
      }
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        setReconnectAttempts(0);
        socket?.emit("join_all_conversations");
        socket?.emit("get_online_users");
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setReconnectAttempts(prev => prev + 1);
      });

      const handleOnlineUsers = (users: User[]) => {
        onOnlineListRef.current(users);
      };
      socket.on("online_users_list", handleOnlineUsers);

      socket.on("incoming_call", (call: IncomingCall) => {
        console.log("Incoming call:", call);
        setIncomingCall(call);
        playNotificationSound();
      });

      socket.on("call_answered", (data: { call_id: string; answer: RTCSessionDescriptionInit; receiver_id: string }) => {
        console.log("Call answered:", data);
        setCurrentCall(prev => prev ? { ...prev, status: "connected" } : null);
      });

      socket.on("call_rejected", (data: { call_id: string; reason: string; receiver_id: string }) => {
        console.log("Call rejected:", data);
        setCurrentCall(null);
        setIncomingCall(null);
      });

      socket.on("call_ended", (data: { call_id: string; ended_by: string; reason?: string }) => {
        console.log("Call ended:", data);
        setCurrentCall(null);
        setIncomingCall(null);
      });

      socket.on("call_error", (data: { message: string; code?: string }) => {
        console.error("Call error:", data);
        setCurrentCall(null);
        setIncomingCall(null);
      });

      // Heartbeat
      const heartbeatInterval = setInterval(() => {
        if (socket?.connected) {
          socket.emit("heartbeat");
        }
      }, 30000);

      // Notifications
      const handleNotification = (data: Notification) => {
        if (soundEnabled !== false) {
          playNotificationSound();
        }
        if (typeof onNotificationCallbackRef.current === "function") {
          onNotificationCallbackRef.current(data);
        } else {
          console.warn("onNotificationCallbackRef.current is not a function");
        }
      };

      const handleUnreadMessageUpdate = (data: RecentMessage) => {
        if (soundEnabled !== false) {
          playNotificationSound();
        }
        if (onUnreadMessageUpdateRef.current) {
          onUnreadMessageUpdateRef.current(data);
        }
      };

      socket.on("notification", handleNotification);
      socket.on("unread_message_update", handleUnreadMessageUpdate);

      // Cleanup function
      return () => {
        clearInterval(heartbeatInterval);
        socket?.off("online_users_list", handleOnlineUsers);
        socket?.off("connect");
        socket?.off("disconnect");
        socket?.off("connect_error");
        socket?.off("incoming_call");
        socket?.off("call_answered");
        socket?.off("call_rejected");
        socket?.off("call_ended");
        socket?.off("call_error");
        socket?.off("notification", handleNotification);
        socket?.off("unread_message_update", handleUnreadMessageUpdate);
      };
    };

    const cleanup = initializeSocket();
    return cleanup;
  }, [soundEnabled, playNotificationSound]);

  // Chat functions
  const joinChat = useCallback((conversationId: string) => {
    if (!socket?.connected) {
      console.warn("Socket not connected, cannot join chat");
      return false;
    }
    socket.emit("join_chat", { conversation_id: conversationId });
    return true;
  }, []);

  const leaveChat = useCallback((conversationId: string) => {
    if (!socket?.connected) return false;
    socket.emit("leave_chat", { conversation_id: conversationId });
    return true;
  }, []);

  const sendMessage = useCallback((message: SendMessagePayload) => {
    if (!socket?.connected) {
      console.warn("Socket not connected, cannot send message");
      return false;
    }
    socket.emit("send_message", message);
    return true;
  }, []);

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (!socket?.connected) return;

    const handleNewMessage = (message: Message) => {
      if (soundEnabled !== false) {
        playNotificationSound();
      }

      // Desktop notification
      if (Notification.permission === "granted") {
        const senderName =
          message.sender?.first_name && message.sender?.last_name
            ? `${message.sender.first_name} ${message.sender.last_name}`
            : message.sender?.username || "Someone";

        const notificationContent =
          message.type === "text"
            ? message.content
            : `Sent ${message.type === "image" ? "an image" : "a file"}`;

        SoundNotification.showDesktopNotification(
          `New message from ${senderName}`,
          {
            body: notificationContent,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `message-${message.conversation_id}`,
          }
        );
      }

      callback(message);
    };

    socket.on("new_message", handleNewMessage);
    return () => socket?.off("new_message", handleNewMessage);
  }, [soundEnabled, playNotificationSound]);

  const markMessagesAsRead = useCallback((conversationId: string) => {
    if (!socket?.connected) return false;
    socket.emit("mark_as_read", { conversation_id: conversationId });
    return true;
  }, []);

  const onMessagesRead = useCallback((
    callback: (data: { conversation_id: string; user_id: string }) => void
  ) => {
    if (!socket?.connected) return;
    socket.on("messages_read", callback);
    return () => socket?.off("messages_read", callback);
  }, []);

  const onUserStatusChanged = useCallback((
    callback: (data: { userId: string; username: string; status: "online" | "offline" }) => void
  ) => {
    if (!socket?.connected) return;
    socket.on("user_status_changed", callback);
    return () => socket?.off("user_status_changed", callback);
  }, []);

  // Call functions
  const initiateCall = useCallback((
    receiverId: string,
    offer: RTCSessionDescriptionInit,
    callType: "audio" | "video"
  ) => {
    if (!socket?.connected) {
      console.warn("Socket not connected, cannot initiate call");
      return false;
    }
    console.log("Incoming call:", incomingCall);
    const tempCallId = `temp_${Date.now()}`;
    setCurrentCall({
      callId: tempCallId,
      isActive: true,
      callType,
      peerId: receiverId,
      status: "ringing"
    });

    socket.emit("call_offer", {
      receiver_id: receiverId,
      offer,
      call_type: callType,
    });
    return true;
  }, []);

  const getCallOffer = useCallback((
    callId: string,
    callback: (offerDetails: CallOfferDetails) => void
  ) => {
    if (!socket?.connected) return false;

    socket.emit("get_call_offer", { call_id: callId });

    const handleOfferDetails = (details: CallOfferDetails) => {
      callback(details);
      socket?.off("call_offer_details", handleOfferDetails);
    };

    socket.on("call_offer_details", handleOfferDetails);
    return true;
  }, []);

  const answerCall = useCallback((callId: string, answer: RTCSessionDescriptionInit) => {
    if (!socket?.connected) return false;
    
    const call = incomingCall;
    if (call) {
      setCurrentCall({
        callId,
        isActive: true,
        callType: call.call_type,
        peerId: call.caller_id,
        status: "connected"
      });
    }

    socket.emit("call_answer", { call_id: callId, answer });
    setIncomingCall(null);
    return true;
  }, [incomingCall]);

  const rejectCall = useCallback((callId: string, reason?: string) => {
    if (!socket?.connected) return false;
    socket.emit("call_reject", { call_id: callId, reason: reason || "Call rejected" });
    setIncomingCall(null);
    return true;
  }, []);

  const sendIceCandidate = useCallback((callId: string, candidate: RTCIceCandidateInit) => {
    if (!socket?.connected) return false;
    socket.emit("call_ice_candidate", { call_id: callId, candidate });
    return true;
  }, []);

  const endCall = useCallback((callId: string) => {
    if (!socket?.connected) return false;
    socket.emit("call_end", { call_id: callId });
    setCurrentCall(null);
    setIncomingCall(null);
    return true;
  }, []);

  // Call event handlers
  const onCallAnswered = useCallback((
    callback: (data: { call_id: string; answer: RTCSessionDescriptionInit; receiver_id: string }) => void
  ) => {
    if (!socket) return;
    socket.on("call_answered", callback);
    return () => socket?.off("call_answered", callback);
  }, []);

  const onIceCandidate = useCallback((
    callback: (data: { call_id: string; candidate: RTCIceCandidateInit; from_user_id: string }) => void
  ) => {
    if (!socket) return;
    socket.on("call_ice_candidate", callback);
    return () => socket?.off("call_ice_candidate", callback);
  }, []);

  const onCallEnded = useCallback((
    callback: (data: { call_id: string; ended_by: string; reason?: string }) => void
  ) => {
    if (!socket) return;
    socket.on("call_ended", callback);
    return () => socket?.off("call_ended", callback);
  }, []);

  const onCallRejected = useCallback((
    callback: (data: { call_id: string; reason: string; receiver_id: string }) => void
  ) => {
    if (!socket) return;
    socket.on("call_rejected", callback);
    return () => socket?.off("call_rejected", callback);
  }, []);

  const onCallError = useCallback((
    callback: (data: { message: string; code?: string }) => void
  ) => {
    if (!socket) return;
    socket.on("call_error", callback);
    return () => socket?.off("call_error", callback);
  }, []);

  // Typing functions
  const setTypingStatus = useCallback((data: {
    conversation_id: string;
    is_typing: boolean;
  }) => {
    if (!socket?.connected) return false;
    socket.emit("typing", data);
    return true;
  }, []);

  const onUserTyping = useCallback((callback: (typingData: TypingUser) => void) => {
    if (!socket?.connected) return;
    socket.on("user_typing", callback);
    return () => socket?.off("user_typing", callback);
  }, []);

  // Image upload
  const onImageUploadStatus = useCallback((
    callback: (data: { status: string; url?: string; message?: string }) => void
  ) => {
    if (!socket?.connected) return;
    socket.on("image_upload_status", callback);
    return () => socket?.off("image_upload_status", callback);
  }, []);

  // Message sent confirmation
  const onMessageSent = useCallback((
    callback: (data: { success: boolean; message: Message; client_temp_id?: string }) => void
  ) => {
    if (!socket?.connected) return;
    socket.on("message_sent", callback);
    return () => socket?.off("message_sent", callback);
  }, []);

  const onMessageError = useCallback((
    callback: (data: { error: string }) => void
  ) => {
    if (!socket?.connected) return;
    socket.on("message_error", callback);
    return () => socket?.off("message_error", callback);
  }, []);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    if (!socket?.connected) return false;
    socket.emit("get_online_users");
    return true;
  }, []);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
      socketRef.current = null;
      setIsConnected(false);
      setCurrentCall(null);
      setIncomingCall(null);
    }
  }, []);

  return {
    // Socket instance and status
    socket: socketRef.current,
    isConnected,
    reconnectAttempts,
    
    // Call state
    incomingCall,
    currentCall,
    
    // Chat functions
    joinChat,
    leaveChat,
    sendMessage,
    onNewMessage,
    markMessagesAsRead,
    onMessagesRead,
    onMessageSent,
    onMessageError,
    
    // User functions
    onUserStatusChanged,
    getOnlineUsers,
    
    // Typing functions
    setTypingStatus,
    onUserTyping,
    
    // Call functions
    initiateCall,
    getCallOffer,
    answerCall,
    rejectCall,
    endCall,
    sendIceCandidate,
    
    // Call event handlers
    onCallAnswered,
    onIceCandidate,
    onCallEnded,
    onCallRejected,
    onCallError,
    
    // Upload functions
    onImageUploadStatus,
    
    // Utility functions
    disconnectSocket,
  };
}