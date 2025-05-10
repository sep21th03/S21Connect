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

export interface RecentMessage {
  id: string;
  username: string;
  name?: string;
  count?: number;
  isOnline?: boolean;
  conversation_type: "private" | "group";
  latest_message?: {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
    sender: {
      id: string;
      first_name: string;
      last_name: string;
      username: string;
      last_active?: string;
    };
  };
  unread_count?: number;
  member_count?: number;
  last_active?: string;
}



export function useSocket(onOnlineList: (users: any[]) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onOnlineListRef = useRef(onOnlineList);

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

    socket.emit("get_online_users");

    const handleOnlineUsers = (users: any) => {
      onOnlineListRef.current(users);
    };

    socket.on("online_users_list", handleOnlineUsers);

    return () => {
      socket?.off("online_users_list", handleOnlineUsers);
    };
  }, []);

  const joinChat = (params: { user_id?: string; group_id?: string }) => {
    if (!socket?.connected) return;
    socket.emit("join_chat", params);
  };

  const leaveChat = (params: { user_id?: string; group_id?: string }) => {
    if (!socket?.connected) return;
    socket.emit("leave_chat", params);
  };

  const sendMessage = (message: {
    content: string;
    receiver_id?: string;
    conversation_id?: string;
    type?: "text" | "image" | "video" | "sticker" | "file";
    file_paths?: string[];
  }) => {
    if (!socket?.connected) return false;

    socket.emit("send_message", message);
    return true;
  };

  const onNewMessage = (callback: (message: RecentMessage) => void) => {
    if (!socket?.connected) return;

    const handleNewMessage = (message: RecentMessage) => {
      callback(message);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket?.off("new_message", handleNewMessage);
    };
  };

  return {
    socketRef: socketRef.current,
    joinChat,
    leaveChat,
    sendMessage,
    onNewMessage,
  };
}
