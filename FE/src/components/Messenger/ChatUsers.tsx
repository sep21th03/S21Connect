// components/Messenger/ChatUsers.tsx
import { Nav } from "reactstrap";
import UserHeader from "./UserHeader";
import { FC, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import ChatUserItem from "./ChatUserItem";
import { useMessengerContext } from "@/contexts/MessengerContext";

const ChatUsers: FC = React.memo(() => {
  const router = useRouter();
  const { data: session } = useSession();
  const { 
    userList, 
    setUserList, 
    activeTab, 
    setActiveTab, 
    onlineUsers,
  } = useMessengerContext();

  const handleSetActiveTab = useCallback((userId: string) => {
    if (activeTab === userId) return;

    // Update URL without triggering a full navigation
    window.history.pushState({}, '', `/messanger/${userId}`);
    
    // Set the active tab in context
    setActiveTab(userId);

    // Mark conversation as read
    setUserList((prevUsers) => {
      if (!prevUsers) return prevUsers;

      const updatedUsers = prevUsers.map((user) => {
        if (user.id === userId && user.unread_count !== 0) {
          return { ...user, unread_count: 0 };
        }
        return user;
      });

      return updatedUsers;
    });
  }, [activeTab, setActiveTab, setUserList]);

  return (
    <div className="chat-users">
      <UserHeader />
      <Nav tabs style={{ height: "auto" }}>
        {userList?.map((data) => (
          <ChatUserItem
            key={data.id} 
            data={data}
            active={activeTab === data.id}
            onClick={() => handleSetActiveTab(data.id)}
            online={onlineUsers.includes(data.id)}
          />
        ))}
      </Nav>
    </div>
  );
});

ChatUsers.displayName = 'ChatUsers';

export default ChatUsers;