import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/redux-toolkit/slice/authSlice";

let socket: Socket | null = null;

export function useSocket(onOnlineList: (users: any[]) => void) {
    const socketRef = useRef<Socket | null>(null);
    const onOnlineListRef = useRef(onOnlineList);
    
    // Cập nhật ref khi callback thay đổi
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
    }, []); // Không phụ thuộc vào bất kỳ giá trị nào thay đổi thường xuyên
  
    return socketRef.current;
  }