"use client";
import { FC, ReactNode, useEffect, useState, useMemo } from "react";
import CommonLayoutHeader from "@/layout/CommonLayout/CommonLayoutHeader";
import ThemeCustomizer from "@/layout/CommonLayout/ThemeCustomizer";
import { SingleUser } from "@/components/Messenger/MessengerType";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSocket } from "@/hooks/useSocket";
import { MessengerContextProvider } from "@/contexts/MessengerContext";

interface MessengerLayoutProps {
  children: ReactNode;
  initialConversationId?: string;
}

const MessengerLayout: FC<MessengerLayoutProps> = ({ 
  children, 
  initialConversationId = null
}) => {
  const [userList, setUserList] = useState<SingleUser[] | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(initialConversationId);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { socketRef, onNewMessage } = useSocket((users) => {
    setOnlineUsers(users.map((user) => user.id));
  });

  // Fetch user list once at layout level
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.MESSAGES.MESSAGES.BASE +
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

  // Update activeTab when initialConversationId changes
  // Only on initial page load, not during user navigation
  useEffect(() => {
    if (initialConversationId && isInitialLoad) {
      setActiveTab(initialConversationId);
    }
  }, [initialConversationId, isInitialLoad]);

  // Handle URL changes from browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const pathSegments = window.location.pathname.split('/');
      const userId = pathSegments[pathSegments.length - 1];
      
      if (userId && userId !== activeTab) {
        setActiveTab(userId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab]);

  // Handle new messages at the layout level
  useEffect(() => {
    const cleanup = onNewMessage((message) => {
      if (!userList) return;
      
      setUserList(prevUsers => {
        if (!prevUsers) return prevUsers;
        
        return prevUsers.map((user) => {
          const isSender = message.latest_message?.sender.id === user.id;

          if (isSender) {
            return {
              ...user,
              latest_message: {
                id: message.id,
                content: message.latest_message?.content || "",
                type: message.latest_message?.type || "",
                created_at: message.latest_message?.created_at || "",
                sender_id: message.latest_message?.sender.id || "",
                sender: {
                  id: message.latest_message?.sender.id || "",
                  first_name: message.latest_message?.sender.first_name || "",
                  last_name: message.latest_message?.sender.last_name || "",
                  username: message.latest_message?.sender.username || "",
                  last_active: message.latest_message?.sender.last_active,
                },
              },
              unread_count:
                user.id !== activeTab
                  ? user.unread_count
                    ? user.unread_count + 1
                    : 1
                  : user.unread_count,
            };
          }
          return user;
        });
      });
    });

    return () => {
      cleanup?.();
    };
  }, [userList, activeTab, onNewMessage]);

  const contextValue = useMemo(() => ({
    userList,
    setUserList,
    activeTab,
    setActiveTab,
    onlineUsers,
  }), [userList, activeTab, onlineUsers]);

  return (
    <MessengerContextProvider value={contextValue}>
      <CommonLayoutHeader headerClassName="d-none d-sm-block" />
      {children}
      <ThemeCustomizer />
    </MessengerContextProvider>
  );
};

export default MessengerLayout;