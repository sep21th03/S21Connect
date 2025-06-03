
import { Nav } from "reactstrap";
import UserHeader from "./UserHeader";
import { FC, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import ChatUserItem from "./ChatUserItem";
import { useMessengerContext } from "@/contexts/MessengerContext";
import { useSession } from "next-auth/react";
const ChatUsers: FC = React.memo(() => {
  const router = useRouter();
  const { 
    userList, 
    setUserList, 
    activeTab, 
    setActiveTab, 
    onlineUsers,
    showArchived,
  } = useMessengerContext();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSetActiveTab = useCallback((conversationId: string) => {
    if (activeTab === conversationId) return;

    router.push(`/messanger/${conversationId}`);

    setActiveTab(conversationId);

    setUserList((prevUsers) => {
      if (!prevUsers) return prevUsers;

      const updatedUsers = prevUsers.map((user) => {
        if (user.id === conversationId && user.unread_count !== 0) {
          return { ...user, unread_count: 0 };
        }
        return user;
      });

      return updatedUsers;
    });
  }, [activeTab, setActiveTab, setUserList]);

  const handleArchiveConversation = useCallback((conversationId: string) => {
    setUserList((prevUsers) => {
      if (!prevUsers) return prevUsers;

      return prevUsers.map((user) => {
        if (user.id === conversationId) {
          return { ...user, is_archived: !user.is_archived };
        }
        return user;
      });
    });
  }, [setUserList]);

  const filteredUsers = userList
    ?.filter((user) => {
      if (!showArchived && user.is_archived) return false; 
      
      return (
        user.other_user?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.members?.some((member) =>
          member.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });


  return (
    <div className="chat-users">
      <UserHeader onSearch={setSearchTerm} />
      <Nav tabs style={{ height: "auto" }}>
        {filteredUsers?.map((data) => (
          <ChatUserItem
            key={data.id} 
            data={data}
            active={activeTab === data.id}
            onClick={() => handleSetActiveTab(data.id)}
            online={onlineUsers.includes(data.other_user?.id || "")}
            sessionUserId={session?.user?.id}
            onArchiveConversation={handleArchiveConversation}
          />
        ))}
      </Nav>
    </div>
  );
});

ChatUsers.displayName = 'ChatUsers';

export default ChatUsers;