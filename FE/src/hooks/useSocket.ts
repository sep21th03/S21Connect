import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/redux-toolkit/slice/authSlice";

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
  type: "text" | "image" | "video" | "sticker" | "file";
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
}

export interface SendMessagePayload {
  content: string; 
  receiver_id: string; 
  conversation_id: string; 
  type?: "text" | "image" | "video" | "sticker" | "file"; 
  file_paths?: string[];
  file_name?: string;
  file_type?: string;
}

export interface RecentMessage {
  id: string;
  name: string | null;
  type: "private" | "group";
  url: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    name: string;
    last_active?: string;
    avatar?: string;
  };
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

export function useSocket(onOnlineList: (users: User[]) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onOnlineListRef = useRef(onOnlineList);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    onOnlineListRef.current = onOnlineList;
  }, [onOnlineList]);

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
      console.log("Socket connected");
      setIsConnected(true);
      socket?.emit("join_all_conversations");
      socket?.emit("get_online_users");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socket.emit("get_online_users");

    const handleOnlineUsers = (users: any) => {
      onOnlineListRef.current(users);
    };

    socket.on("online_users_list", handleOnlineUsers);

    const heartbeatInterval = setInterval(() => {
      if (socket?.connected) {
        socket.emit("heartbeat");
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      socket?.off("online_users_list", handleOnlineUsers);
      socket?.off("connect");
      socket?.off("disconnect");
    };
  }, []);

  // Fix 1: Updated to accept string directly
  const joinChat = (conversationId: string) => {
    if (!socket?.connected) return;
    console.log("Joining chat:", conversationId);
    socket.emit("join_chat", { conversation_id: conversationId });
  };

  // Fix 2: Updated to accept string directly
  const leaveChat = (conversationId: string) => {
    if (!socket?.connected) return;
    console.log("Leaving chat:", conversationId);
    socket.emit("leave_chat", { conversation_id: conversationId });
  };

  const sendMessage = (message: SendMessagePayload) => {
    if (!socket?.connected) {
      console.error("Cannot send message: socket not connected");
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

  const setTypingStatus = (data: { conversation_id: string, is_typing: boolean }) => {
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
    console.log("Marking messages as read for conversation:", conversationId);
    socket.emit("mark_as_read", { conversation_id: conversationId });
  };

  const onMessagesRead = (callback: (data: { conversation_id: string, user_id: string }) => void) => {
    if (!socket?.connected) return;
    
    socket.on("messages_read", callback);
    
    return () => {
      socket?.off("messages_read", callback);
    };
  };
  
  const onUserStatusChanged = (callback: (data: { userId: string, username: string, status: 'online' | 'offline' }) => void) => {
    if (!socket?.connected) return;
    
    socket.on("user_status_changed", callback);
    
    return () => {
      socket?.off("user_status_changed", callback);
    };
  };

  const onImageUploadStatus = (callback: (data: { status: string; url?: string; message?: string }) => void) => {
    if (!socket?.connected) return;
    socket?.on("image-upload-status", callback);
  
    return () => {
      socket?.off("image_upload_status", callback);
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
    onImageUploadStatus
  };
}