import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Close, Href,  Messages } from "../../../utils/constant";
import RightOption from "./RightOption";
import { Input } from "reactstrap";
import UserMessage from "./UserMessage";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import { FC, useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { SingleUser } from "@/components/Messenger/MessengerType";
import { useSocket } from "@/hooks/useSocket";
import ChatBoxCommon from "@/layout/CommonLayout/ConversationPanel/common/ChatBoxCommon";


const HeaderMessage: React.FC = () => {
  const { isComponentVisible, ref, setIsComponentVisible } =useOutsideDropdown(false);
  const [userList, setUserList] = useState<SingleUser[] | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showChatBox, setShowChatBox] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setShowChatBox(true);
    setIsComponentVisible(false);
  };
  return (
    <>
    <li className="header-btn custom-dropdown dropdown-lg btn-group message-btn">
      <a className={`main-link ${isComponentVisible ? "show" : ""}`} href={Href} onClick={() => setIsComponentVisible(!isComponentVisible)}>
        <DynamicFeatherIcon iconName="MessageCircle" className="icon-light stroke-width-3 iw-16 ih-16" />
        <span className="count success">2</span>
      </a>
      <div className={`dropdown-menu dropdown-menu-right ${isComponentVisible ? "show" : ""}`} ref={ref}>
        <div className="dropdown-header">
          <div className="left-title">
            <span>{Messages}</span>
          </div>
          <RightOption />
          <div className="mobile-close" onClick={() => setIsComponentVisible(!isComponentVisible)}>
            <h5>{Close}</h5>
          </div>
        </div>
        <div className="search-bar input-style icon-left">
          <DynamicFeatherIcon iconName="Search" className="icon iw-16 ih-16" onClick={() => setIsComponentVisible(!isComponentVisible)}/>
          <Input type="text" placeholder="search messages..." />
        </div>  
        <UserMessage userList={userList} onlineUsers={onlineUsers} onUserClick={handleUserClick}/>
      </div>
    </li>
     {showChatBox && selectedUser && (
      <ChatBoxCommon 
        setChatBox={setShowChatBox}
        data={selectedUser}
      />
    )}
    </>
  );
};

export default HeaderMessage;
