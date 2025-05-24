import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Close, Href, Messages } from "../../../utils/constant";
import RightOption from "./RightOption";
import { Input } from "reactstrap";
import UserMessage from "./UserMessage";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import { FC, useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { RecentMessage } from "@/hooks/useSocket";
import ChatBoxCommon from "@/layout/CommonLayout/ConversationPanel/common/ChatBoxCommon";
import { Spinner } from "reactstrap";

const HeaderMessage: React.FC<{unreadMessageUpdate: RecentMessage | null, onlineUsers: string[]}> = ({unreadMessageUpdate, onlineUsers}) => {
  const { isComponentVisible, ref, setIsComponentVisible } =
    useOutsideDropdown(false);
  const [userList, setUserList] = useState<RecentMessage[] | null>(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const fetchUserList = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        API_ENDPOINTS.MESSAGES.MESSAGES.RECENT_CONVERSATIONS
      );
      setUserList(response.data);
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.MESSAGES.MESSAGES.GET_UNREAD_MESSAGES_COUNT
      );
      setUnreadMessageCount(response.data.unread_count);
    } catch (error) {
      console.error("Error fetching unread message count:", error);
    }
  };
  


  useEffect(() => {
    if (isComponentVisible) {
      fetchUserList();
    }
    fetchUnreadMessageCount();
  }, [isComponentVisible]);

  useEffect(() => {
    if (!unreadMessageUpdate || !userList) return;
    if (unreadMessageUpdate.unread_count === 0) {
      setUnreadMessageCount(prev => prev + 1);
    }
    setUserList((prev) => {
      if (!prev) return prev;
  
      const updatedList = prev.map((item) => {
        if (item.other_user.id === unreadMessageUpdate.other_user.id) {
          return {
            ...item,
            unread_count: unreadMessageUpdate.unread_count,
            latest_message: unreadMessageUpdate.latest_message, 
          };
        }
        return item;
      });
  
      return [...updatedList]; 
    });
  }, [unreadMessageUpdate]);
  
  
  
  const handleUserClick = (user: RecentMessage) => {
    setSelectedUser(user);
    setShowChatBox(true);
    setIsComponentVisible(false);
  };
  const handleMessagesRead = (userId: string) => {
    setUserList((prev) => {
      if (!prev) return prev;
      return prev.map((item) => {
        if (item.other_user.id === userId) {
          return { ...item, unread_count: 0 };
        }
        return item;
      });
    });
  };

  const toggleDropdown = () => {
    if (!isComponentVisible) {
      setIsComponentVisible(true);
    } else {
      setIsComponentVisible(false);
    }
  };

  const filteredUserList = userList?.filter((user) => {
    const name = `${user.other_user.name}`.toLowerCase();
    const username = user.other_user.username?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || username.includes(term);
  });  

  return (
    <>
      <li
        className="header-btn custom-dropdown dropdown-lg btn-group message-btn"
      >
        <a
          className={`main-link ${isComponentVisible ? "show" : ""}`}
          href={Href}
          onClick={toggleDropdown}
        >
          <DynamicFeatherIcon
            iconName="MessageCircle"
            className="icon-light stroke-width-3 iw-16 ih-16"
          />
          {unreadMessageCount > 0 && (
            <span className="count success">
              {unreadMessageCount}
            </span>
          )}
        </a>
        <div
          className={`dropdown-menu dropdown-menu-right ${
            isComponentVisible ? "show" : ""
          }`}
          ref={ref}
        >
          <div className="dropdown-header">
            <div className="left-title">
              <span>{Messages}</span>
            </div>
            <RightOption />
            <div
              className="mobile-close"
              onClick={() => setIsComponentVisible(!isComponentVisible)}
            >
              <h5>{Close}</h5>
            </div>
          </div>
          <div className="search-bar input-style icon-left">
            <DynamicFeatherIcon
              iconName="Search"
              className="icon iw-16 ih-16"
              onClick={() => setIsComponentVisible(!isComponentVisible)}
            />
            <Input type="text" placeholder="Tìm kiếm tin nhắn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {isLoading ? (
            <div className="text-center">
              <Spinner />
            </div>
          ) : (
            <UserMessage
              userList={filteredUserList || []}
              onlineUsers={onlineUsers}
              onUserClick={handleUserClick}
            />
          )}
        </div>
      </li>
      {showChatBox && selectedUser && (
        <ChatBoxCommon
          setChatBox={setShowChatBox}
          data={selectedUser}
          handleMessagesRead={handleMessagesRead}
        />
      )}
    </>
  );
};

export default HeaderMessage;
