import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Close, Href, Messages } from "../../../utils/constant";
import RightOption from "./RightOption";
import { Input } from "reactstrap";
import UserMessage from "./UserMessage";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import { FC, useEffect, useState } from "react";
import { RecentMessage } from "@/hooks/useSocket";
import ChatBoxCommon from "@/layout/CommonLayout/ConversationPanel/common/ChatBoxCommon";
import { Spinner } from "reactstrap";
import {
  getRecentConversations,
  fetchUnreadMessageCount,
} from "@/service/messageService";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";

const HeaderMessage: React.FC<{
  unreadMessageUpdate: RecentMessage | null;
  onlineUsers: string[];
}> = ({ unreadMessageUpdate, onlineUsers }) => {
  const { isComponentVisible, ref, setIsComponentVisible } =
    useOutsideDropdown(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [selectedChat, setSelectedChat] = useState<RecentMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showArchived, setShowArchived] = useState(false);

  const { user } = useSelector((state: RootState) => state.user);

  const {
    data: userList,
    isLoading: isUserListLoading,
    refetch: refetchUserList,
  } = useQuery({
    queryKey: ["recentConversations", showArchived],
    queryFn: () => getRecentConversations(showArchived),
    enabled: isComponentVisible,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: unreadMessageCountData = 0,
    isLoading: isUnreadCountLoading,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ["unreadMessageCount"],
    queryFn: fetchUnreadMessageCount,
  });

  useEffect(() => {
    setUnreadMessageCount(unreadMessageCountData);
  }, [unreadMessageCountData]);

  useEffect(() => {
    if (unreadMessageUpdate) {
      refetchUserList();
      refetchUnreadCount();
    }
  }, [unreadMessageUpdate, refetchUserList, refetchUnreadCount]);

  const handleUserClick = (chat: RecentMessage) => {
    setSelectedChat(chat);

    refetchUserList();

    setShowChatBox(true);
    setIsComponentVisible(false);
  };

  const handleMessagesRead = () => {
    refetchUserList();
    refetchUnreadCount();
  };

  const filteredUserList = userList?.filter((user: RecentMessage) => {
    if (user.type === "group") {
      const groupName = user.name?.toLowerCase() || "";
      return groupName.includes(searchTerm.toLowerCase());
    }
    const name = user.other_user?.name?.toLowerCase() || "";
    const username = user.other_user?.username?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || username.includes(term);
  });
  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
    if (!isComponentVisible) {
      refetchUserList();
      refetchUnreadCount();
    }
  };

  return (
    <>
      <li className="header-btn custom-dropdown dropdown-lg btn-group message-btn">
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
            <span className="count success">{unreadMessageCount}</span>
          )}
        </a>
        <div
          className={`dropdown-menu dropdown-menu-right ${
            isComponentVisible ? "show" : ""
          }`}
          ref={ref}
        >
          <div className="dropdown-header">
            {showArchived ? (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-link p-0 border-0 d-flex align-items-center"
                  onClick={() => setShowArchived(false)}
                >
                  <DynamicFeatherIcon
                    iconName="ArrowLeft"
                    className="iw-16 ih-16"
                  />
                </button>
                <h5 className="mb-0">Đoạn chat đã lưu trữ</h5>
              </div>
            ) : (
              <>
                <div className="left-title">
                  <span>{Messages}</span>
                </div>
                <RightOption
                  showArchived={showArchived}
                  setShowArchived={setShowArchived}
                />
              </>
            )}

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
            <Input
              type="text"
              placeholder="Tìm kiếm tin nhắn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isUserListLoading || isUnreadCountLoading ? (
            <div className="text-center">
              <Spinner />
            </div>
          ) : (
            <UserMessage
              userList={filteredUserList || []}
              onlineUsers={onlineUsers}
              onUserClick={handleUserClick}
              currentUserId={user?.id || ""}
            />
          )}
        </div>
      </li>
      {showChatBox && selectedChat && (
        <ChatBoxCommon
          setChatBox={setShowChatBox}
          data={selectedChat}
          handleMessagesRead={handleMessagesRead}
        />
      )}
    </>
  );
};

export default HeaderMessage;
