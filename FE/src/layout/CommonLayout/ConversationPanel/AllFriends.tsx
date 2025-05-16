import { FC, useEffect, useState } from "react";
import { Collapse, Media, Spinner } from "reactstrap";
import { useSession } from "next-auth/react";
import HoverMessage from "@/Common/HoverMessage";
import ChatBoxCommon from "./common/ChatBoxCommon";
import CommonHeader from "./common/CommonHeader";
import useMobileSize from "@/utils/useMobileSize";
import axiosInstance from "@/utils/axiosInstance";
import { ImagePath } from "@/utils/constant";
import { API_ENDPOINTS } from "@/utils/constant/api";
import Image from "next/image";
import { useSocket, User } from "@/hooks/useSocket";

interface FriendList {
  id: string;
  mutual_friends_count: number;
  other_user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
}

const AllFriends = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<FriendList | null>(null);
  const [chatBox, setChatBox] = useState(false);
  const mobileSize = useMobileSize();
  const [friends, setFriends] = useState<FriendList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useSocket((users: User[]) => {
    setOnlineUsers(users);
  });
  
  const getListFriends = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.USERS.BASE + API_ENDPOINTS.USERS.LIST_FRIENDS_LIMIT(userId)
      );
      
      const friendsList = Array.isArray(response.data) 
        ? response.data 
        : response.data.friends || [];
      setFriends(friendsList);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const friendsOnline = friends.filter((friend) => !onlineUsers.some((user) => user.id === friend.other_user.id));
  useEffect(() => {
    if (session?.user?.id) {
      getListFriends(session.user.id);
    }
  }, [session?.user?.id]);

  const handleOpenChatBox = (friend: FriendList) => {
    const chatUser: FriendList = {
      id: friend.id,
      mutual_friends_count: friend.mutual_friends_count,
      other_user: {
        id: friend.other_user.id,
        name: friend.other_user.name,
        avatar: friend.other_user.avatar || `${ImagePath}/user-sm/1.jpg`,
        username: friend.other_user.username,
      },
    };
    
    setSelectedUser(chatUser);
    setChatBox(true);
  };
  
  const renderFriendItem = (friend: FriendList, index: number) => {
    // Create a unique and safe ID for this friend item
    const friendElementId = `friend-${friend.id || index}`;
    
    return (
      <li
        key={friend.id || index}
        className={`friend-box user${index + 1}`}
      >
        <Media onClick={() => handleOpenChatBox(friend)}>
          <a
            className="popover-cls user-img bg-size blur-up lazyloaded"
            id={friendElementId}
          >
            <Image
              src={
                friend.other_user?.avatar
                  ? friend.other_user?.avatar
                  : `${ImagePath}/user-sm/1.jpg`
              }
              className="img-fluid lazyload bg-img rounded-circle"
              alt="user"
              height={50} width={50}
            />
          </a>
          <Media body>
            <h5 className="user-name">
              {friend.other_user?.name}
            </h5>
            <h6 className="mutual-count">
              {friend.mutual_friends_count} bạn chung
            </h6>
          </Media>
        </Media>
        {/* <HoverMessage
          placement={mobileSize ? "right" : "top"}
          target={friendElementId}
          data={friend}
          imagePath={
            friend.other_user?.avatar
              ? friend.other_user?.avatar
              : `${ImagePath}/user-sm/1.jpg`
          }
          onMessageClick={() => {handleOpenChatBox(friend)}}
          onFriendRequestClick={() => {}}
        /> */}
      </li>
    );
  };

  return (
    <div className="friend-section">
      <CommonHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        heading={`Friends (${friends.length})`}
      />
     
      <Collapse isOpen={isOpen} className="friend-list">
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center p-3">
            <Spinner />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-3">Không có bạn bè</div>
        ) : (
          <div className="online-friends">
            <ul>
              {friendsOnline.map((friend, index) => renderFriendItem(friend, index))}
            </ul>
          </div>
        )}

        {chatBox && selectedUser && (
          <ChatBoxCommon
            setChatBox={setChatBox}
            data={selectedUser}
            handleMessagesRead={() => {}}
          />
        )}
      </Collapse>
    </div>
  );
};

export default AllFriends;