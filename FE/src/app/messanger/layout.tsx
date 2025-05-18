"use client";
import { FC, ReactNode, useEffect, useState, useMemo } from "react";
import CommonLayoutHeader from "@/layout/CommonLayout/CommonLayoutHeader";
import ThemeCustomizer from "@/layout/CommonLayout/ThemeCustomizer";
import { SingleUser } from "@/components/Messenger/MessengerType";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { RecentMessage, useSocket } from "@/hooks/useSocket";
import { MessengerContextProvider } from "@/contexts/MessengerContext";

interface MessengerLayoutProps {
  children: ReactNode;
}

const MessengerLayout: FC<MessengerLayoutProps> = ({ children }) => {
  const [userList, setUserList] = useState<RecentMessage[] | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { socket, onNewMessage } = useSocket((users) => {
    setOnlineUsers(users.map((user) => user.id));
  });
  // Fetch user list once at layout level
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.MESSAGES.MESSAGES.RECENT_CONVERSATIONS
        );
        setUserList(response.data);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching user list:", error);
        setIsInitialLoad(false);
      }
    };
    fetchUserList();
  }, []);
  useEffect(() => {
    const handlePopState = () => {
      const pathSegments = window.location.pathname.split("/");
      const userId = pathSegments[pathSegments.length - 1];

      if (userId && userId !== activeTab) {
        setActiveTab(userId);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeTab]);

  useEffect(() => {
    const cleanup = onNewMessage((message) => {
      if (!userList) return;

      setUserList((prevUsers) => {
        if (!prevUsers) return prevUsers;

        return prevUsers.map((conversation) => {
          const isSender = message.sender?.id === conversation.other_user.id;

          if (isSender) {
            return {
              ...conversation,
              latest_message: {
                content: message.content || "",
                type: message.type || "",
                created_at: message.created_at || "",
                sender_id: message.sender?.id || "",
                sender_name: `${message.sender?.first_name || ""} ${
                  message.sender?.last_name || ""
                }`.trim(),
              },
              unread_count:
                conversation.id !== activeTab
                  ? (conversation.unread_count ?? 0) + 1
                  : conversation.unread_count,
            };
          }

          return conversation;
        });
      });
    });

    return () => {
      cleanup?.();
    };
  }, [userList, activeTab, onNewMessage]);

  const contextValue = useMemo(
    () => ({
      userList,
      setUserList,
      activeTab,
      setActiveTab,
      onlineUsers,
    }),
    [userList, activeTab, onlineUsers]
  );

  return (
    <MessengerContextProvider value={contextValue}>
      <CommonLayoutHeader headerClassName="d-none d-sm-block" />
      {children}
      <ThemeCustomizer />
    </MessengerContextProvider>
  );
};

export default MessengerLayout;
