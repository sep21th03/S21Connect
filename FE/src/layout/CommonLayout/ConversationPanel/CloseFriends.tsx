import { useEffect, useState } from "react";
import { Collapse, Media, Spinner } from "reactstrap";
import { useSession } from "next-auth/react";
import ChatBoxCommon from "./common/ChatBoxCommon";
import CommonHeader from "./common/CommonHeader";
import useMobileSize from "@/utils/useMobileSize";
import axiosInstance from "@/utils/axiosInstance";
import { ImagePath } from "@/utils/constant";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { User, useSocket, UserData, RecentMessage } from "@/hooks/useSocket";
import Image from "next/image";
import { Notification } from "@/hooks/useSocket";

const MAX_DISPLAY_USERS = 20;

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  mutual_friends_count: number;
  username: string;
  other_user: {
    id: string;
    avatar: string;
  };
}

const CloseFriends = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<RecentMessage | null>(null);
  const [chatBox, setChatBox] = useState(false);
  const mobileSize = useMobileSize();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useSocket((users: User[]) => {
    setOnlineUsers(users);
  }, (data: Notification) => {
    console.log(data);
  });

  const getListFriends = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.USERS.BASE +
          API_ENDPOINTS.USERS.LIST_FRIENDS_LIMIT(userId)
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

  const friendsOnline = friends.filter((friend) =>
    onlineUsers.some((user) => user.id === friend.other_user.id)
  );
  useEffect(() => {
    if (session?.user?.id) {
      getListFriends(session.user.id);
    }
  }, [session?.user?.id]);

  const handleOpenChatBox = (friend: Friend) => {
    const chatData: RecentMessage = {
      id: friend.id,
      name: friend.name,
      type: "private",
      url: "",
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_archived: false,
      member_count: 2,
      avatar: friend.avatar || `${ImagePath}/user-sm/1.jpg`,
      other_user: {
        id: friend.id,
        username: friend.username,
        name: friend.name,
        avatar: friend.avatar,
      },
      members: []
    };
  

    setSelectedUser(chatData);
    setChatBox(true);
  };
  const renderFriendItem = (friend: Friend, index: number) => (
    <li key={friend.id || index} className={`friend-box user${index + 1}`}>
      <Media onClick={() => handleOpenChatBox(friend)}>
        <a
          className="popover-cls user-img bg-size blur-up lazyloaded"
          id={`friend-${friend.id || index}`}
        >
          <Image
            src={
              friend.other_user.avatar
                ? friend.other_user.avatar
                : `${ImagePath}/user-sm/1.jpg`
            }
            className="img-fluid lazyload bg-img rounded-circle"
            alt="user"
            height={50}
            width={50}
            style={{
              color: "transparent",
              width: "50px",
              height: "50px",
              objectFit: "cover",
            }}
          />
          <span className="available-stats online" />
        </a>
        <Media body>
          <h5 className="user-name">{friend.name}</h5>
          <h6 className="mutual-count">
            {friend.mutual_friends_count} bạn chung
          </h6>
        </Media>
      </Media>
      {/* <HoverMessage
        placement={mobileSize ? "right" : "top"}
        target={`friend-${friend.id || index}`}
        data={friend}
        imagePath={
          friend.avatar
            ? friend.avatar
            : `${ImagePath}/user-sm/1.jpg`
        }
        onMessageClick={() => {handleOpenChatBox(friend)}}
        onFriendRequestClick={() => {}}
      /> */}
    </li>
  );

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
        ) : friendsOnline.length === 0 ? (
          <div className="text-center py-3">Không có bạn bè đang online</div>
        ) : (
          <div className="online-friends">
            <ul>
              {friendsOnline.map((friend, index) =>
                renderFriendItem(friend, index)
              )}
            </ul>
          </div>
        )}

        {chatBox && selectedUser && (
          <ChatBoxCommon setChatBox={setChatBox} data={selectedUser} handleMessagesRead={() => {}} />
        )}
      </Collapse>
    </div>
  );
};

export default CloseFriends;
