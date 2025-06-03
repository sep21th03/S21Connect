"use client";
import { FC, ReactNode, useEffect, useState, useMemo } from "react";
import CommonLayoutHeader from "@/layout/CommonLayout/CommonLayoutHeader";
import ThemeCustomizer from "@/layout/CommonLayout/ThemeCustomizer";
import { RecentMessage, useSocket } from "@/hooks/useSocket";
import { MessengerContextProvider } from "@/contexts/MessengerContext";
import { getRecentConversations  } from "@/service/messageService";
interface MessengerLayoutProps {
  children: ReactNode;
}

const MessengerLayout: FC<MessengerLayoutProps> = ({ children }) => {
  const [userList, setUserList] = useState<RecentMessage[] | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const { socket, onNewMessage } = useSocket((users: any) => {
    setOnlineUsers(users.map((user: any) => user.id));
  });
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await getRecentConversations (showArchived);
        setUserList(response);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching user list:", error);
        setIsInitialLoad(false);
      }
    };
    fetchUserList();
  }, [showArchived]);
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

      setUserList((prevUsers: any) => {
        if (!prevUsers) return prevUsers;

        const existing = prevUsers.find((conversation: any) => {
          if (conversation.id === message.conversation_id) return true;
          
          if (conversation.type === 'group') {
            if (message.conversation_id && conversation.id === message.conversation_id) return true; 
          }
          
          return false;
        });

        if (existing) {
          return prevUsers.map((conversation: any) => {
            const isTargetConversation = 
            conversation.id === message.conversation_id ||
            (conversation.type === 'group' && 
             (message.conversation_id === conversation.id));
            if (isTargetConversation) {
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
        }
        return prevUsers;
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
      showArchived,
      setShowArchived,
    }),
    [userList, activeTab, onlineUsers, showArchived, setShowArchived]
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
