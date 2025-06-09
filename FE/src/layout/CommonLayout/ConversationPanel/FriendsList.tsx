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
import { useSocket, User, RecentMessage, UserData } from "@/hooks/useSocket";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "@/redux-toolkit/slice/friendSlice";
import { RootState } from "@/redux-toolkit/rootReducer";
import { Notification } from "@/hooks/useSocket";

interface FriendData extends RecentMessage {
  id: string;
  mutual_friends_count: number;
  type: "private" | "group";
  other_user: UserData;
}

interface FriendsListProps {
  searchTerm?: string;
}

const FriendsList: FC<FriendsListProps> = ({ searchTerm = "" }) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<FriendData | null>(null);
  const [chatBox, setChatBox] = useState(false);
  const mobileSize = useMobileSize();
  // const [friends, setFriends] = useState<FriendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  const dispatch = useDispatch();
  const { friends, lastFetched } = useSelector((state: RootState) => state.FriendSlice);

  useSocket((users: User[]) => {
    setOnlineUsers(users);
  }, (data: Notification) => {
    console.log(data);
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
      dispatch(setFriends(friendsList));
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      dispatch(setFriends([]));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = friends.filter((friend) => 
    friend.other_user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!session?.user?.id) return;
  
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;
    const shouldFetch =
      friends.length === 0 || !lastFetched || now - lastFetched > TEN_MINUTES;
  
    if (shouldFetch) {
      getListFriends(session.user.id);
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);  

  const handleOpenChatBox = (friend: FriendData) => {
    const chatData: FriendData = {
      id: friend.id,
      mutual_friends_count: friend.mutual_friends_count,
      type: friend.type,
      other_user: {
        id: friend.other_user.id,
        name: friend.other_user.name,
        avatar: friend.other_user.avatar || `${ImagePath}/user-sm/1.jpg`,
        username: friend.other_user.username,
      },
      name: friend.name,
      url: friend.url,
      avatar: friend.avatar,
      unread_count: friend.unread_count,
      created_at: friend.created_at,
      updated_at: friend.updated_at,
      is_archived: friend.is_archived,
      member_count: friend.member_count,
      members: friend.members,
      latest_message: friend.latest_message,
    };
    
    setSelectedUser(chatData);
    setChatBox(true);
  };
  
  const isUserOnline = (userId: string) => {
    return onlineUsers.some(user => user.id === userId);
  };
  
  const renderFriendItem = (friend: FriendData, index: number) => {
    const friendElementId = `friend-${friend.id || index}`;
    const isOnline = isUserOnline(friend.other_user.id);
    
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
            {isOnline && <span className="available-stats online" />}
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
        <HoverMessage
          placement={mobileSize ? "right" : "top"}
          target={friendElementId}
          data={{
            id: friend.id,
            name: friend.other_user?.name,
            mutual_friends_count: friend.mutual_friends_count,
            status: isOnline ? "online" : "offline"
          }}
          imagePath={
            friend.other_user?.avatar
              ? friend.other_user?.avatar
              : `${ImagePath}/user-sm/1.jpg`
          }
          onMessageClick={() => handleOpenChatBox(friend)}
          onFriendRequestClick={() => {}}
        />
      </li>
    );
  };

  return (
    <div className="friend-section">
      <CommonHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        heading={`Bạn bè (${filteredFriends.length})`}
      />
     
      <Collapse isOpen={isOpen} className="friend-list">
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center p-3">
            <Spinner />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-3">
            {searchTerm 
              ? "Không có kết quả" 
              : "Không có bạn bè"}
          </div>
        ) : (
          <div className="online-friends">
            <ul>
              {filteredFriends.map((friend, index) => renderFriendItem(friend as FriendData, index))}
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

export default FriendsList;