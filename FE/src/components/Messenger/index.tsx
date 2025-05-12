// components/Messenger/index.tsx
import { FC, useCallback, useEffect } from "react";
import ChatUsers from "./ChatUsers";
import ChatContent from "./ChatContent";
import { useMessengerContext } from "@/contexts/MessengerContext";
import { RecentMessage } from "@/hooks/useSocket";
import React from "react";

interface MessengerSectionProps {
  initialConversationId?: string;
}

const MessengerSection: FC<MessengerSectionProps> = ({
  initialConversationId,
}) => {
  const { userList, setUserList, activeTab, setActiveTab, onlineUsers } =
    useMessengerContext();
  useEffect(() => {
    if (initialConversationId && !activeTab) {
      setActiveTab(initialConversationId);
    }
  }, [initialConversationId, activeTab, setActiveTab]);

  const handleUpdateUserList = useCallback(
    (updatedList: RecentMessage[]) => {
      setUserList(updatedList);
    },
    [setUserList]
  );

  const selectedUser =
    activeTab && userList
      ? userList.find((u) => u.id === activeTab) || null
      : null;
  return (
    <section className="messenger-section">
      <ChatUsers />
      {activeTab !== null && selectedUser && (
        <ChatContent
          activeTab={activeTab ?? null}
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
