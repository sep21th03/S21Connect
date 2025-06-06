import { FC } from "react";
import { ChatContentInterFace } from "./MessengerType";
import { TabContent, TabPane } from "reactstrap";
import CommonChatBox from "./Common/CommonChatBox";

const ChatContent: FC<ChatContentInterFace> = ({
  activeTab,
  userList,
  setUserList,
  setActiveTab,
  onlineUsers,
  initialConversationId,
}) => {
  return (
    <div className="chat-content">
      <TabContent activeTab={activeTab ?? undefined}>
        <TabPane tabId={activeTab ?? undefined}>
          <CommonChatBox
            userList={userList}
            setUserList={setUserList}
            setActiveTab={setActiveTab}
            onlineUsers={onlineUsers}
            initialConversationId={initialConversationId}
          />
        </TabPane>
      </TabContent>
    </div>
  );
};

export default ChatContent;
