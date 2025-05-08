import { FC, useEffect, useState } from "react";
import ChatUsers from "./ChatUsers";
import { SingleUser } from "@/components/Messenger/MessengerType";
import ChatContent from "./ChatContent";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSocket } from "@/hooks/useSocket";

const MessengerSection: FC = () => {
  const [userList, setUserList] = useState<SingleUser[] | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<SingleUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { socketRef } = useSocket((users) => {
    setOnlineUsers(users.map((user) => user.id));
  });

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.MESSAGES.MESSAGES.BASE +
            API_ENDPOINTS.MESSAGES.MESSAGES.RECENT_CONVERSATIONS
        );
        setUserList(response.data);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };
    fetchUserList();
  }, []);

  useEffect(() => {
    if (activeTab && userList) {
      const user = userList.find((u) => u.id === activeTab);
      setSelectedUser(user || null);
    }
  }, [activeTab, userList]);

  const handleChatBoxClose = () => {
    // Set activeTab to a value that corresponds to a tab you want to display as active after closing the chat box.
    // You can set it to 0 or any other appropriate value to ensure no tab is active.
    setActiveTab(null);
  };

  return (
    <section className="messenger-section">
      <ChatUsers
        userList={userList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onlineUsers={onlineUsers}
      />
      {activeTab !== null && (
        <ChatContent
          activeTab={activeTab}
          userList={selectedUser}
          setUserList={setUserList}
          setActiveTab={setActiveTab}
          onlineUsers={onlineUsers}
        />
      )}
    </section>
  );
};

export default MessengerSection;
