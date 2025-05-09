// components/Messenger/index.tsx
import { FC, useCallback } from "react";
import ChatUsers from "./ChatUsers";
import ChatContent from "./ChatContent";
import { useMessengerContext } from "@/contexts/MessengerContext";
import { SingleUser } from "./MessengerType";
import React from "react";

interface MessengerSectionProps {
  initialConversationId?: string;
}

const MessengerSection: FC<MessengerSectionProps> = ({ initialConversationId }) => {
  const { 
    userList, 
    setUserList, 
    activeTab, 
    setActiveTab, 
    onlineUsers 
  } = useMessengerContext();
  // Use callback to avoid recreating this function on every render
  const handleUpdateUserList = useCallback((updatedList: SingleUser[]) => {
    setUserList(updatedList);
  }, [setUserList]);

  // Find the selected user from the userList
  const selectedUser = activeTab && userList 
    ? userList.find((u) => u.id === activeTab) || null 
    : null;

  return (
    <section className="messenger-section">
      <ChatUsers />
      {activeTab !== null && selectedUser && (
        <ChatContent
          activeTab={activeTab}
          userList={selectedUser}
          setUserList={handleUpdateUserList}
          setActiveTab={setActiveTab}
          onlineUsers={onlineUsers}
          initialConversationId={initialConversationId}
        />
      )}
    </section>
  );
};

export default React.memo(MessengerSection);