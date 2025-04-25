import { FC, useCallback, useEffect, useState } from "react";
import { Collapse, Media } from "reactstrap";
import { useSession } from "next-auth/react";
import CustomImage from "@/Common/CustomImage";
import HoverMessage from "@/Common/HoverMessage";
import ChatBoxCommon from "./common/ChatBoxCommon";
import CommonHeader from "./common/CommonHeader";
import useMobileSize from "@/utils/useMobileSize";
import axiosInstance from "@/utils/axiosInstance";
import { ImagePath } from "@/utils/constant";
import { OnlineUser, SingleData, commonInterFace } from "@/layout/LayoutTypes";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSocket } from "@/hooks/useSocket";

const MAX_DISPLAY_USERS = 20;

const CloseFriends: FC<commonInterFace> = ({
  closeFriendsData,
  recentChats,
}) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<SingleData | null>(null);
  const [chatBox, setChatBox] = useState(false);
  const [userName, setUserName] = useState(closeFriendsData);
  const mobileSize = useMobileSize();
  const [listFriends, setListFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [closeFriendsOnline, setCloseFriendsOnline] = useState<OnlineUser[]>([]);
  const [userOnline, setUserOnline] = useState<any[]>([]);

  const handleOnlineUsers = useCallback((users: any) => {
    setUserOnline(users);
  }, []);
  
  const socket = useSocket(handleOnlineUsers);
  
  const getListFriends = async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await axiosInstance.get<{ friends: OnlineUser[] }>(
        API_ENDPOINTS.USERS.BASE + API_ENDPOINTS.USERS.ONLINE_USERS(userId)
      );
      console.log(data.data);
      setListFriends(data.data);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      setListFriends([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Chỉ load danh sách bạn bè khi có session
  useEffect(() => {
    if (session?.user?.id) {
      getListFriends(session.user.id);
    }
  }, [session?.user?.id]);

  // Xử lý chỉ lấy bạn bè đang online và giới hạn 20 người
  useEffect(() => {
    if (!listFriends.length) {
      setCloseFriendsOnline([]);
      return;
    }
  
    // Tạo map để tra cứu nhanh hơn
    const onlineUsersMap = userOnline.length 
      ? Object.fromEntries(userOnline.map((user) => [user.id, user]))
      : {};
  
    // Chỉ lấy bạn bè đang online
    const online: OnlineUser[] = [];
    
    listFriends.forEach(friend => {
      const onlineData = onlineUsersMap[friend.id];
      
      if (onlineData) {
        // Bạn bè đang online
        online.push({
          ...friend,
          status: "online",
          avatar: onlineData.avatar || friend.avatar,
          lastActive: onlineData.lastActive || new Date()
        });
      }
    });
  
    // Sắp xếp bạn bè online theo thời gian hoạt động gần nhất
    online.sort((a, b) => {
      const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return dateB - dateA;
    });
    
    // Giới hạn chỉ hiển thị tối đa 20 người
    setCloseFriendsOnline(online.slice(0, MAX_DISPLAY_USERS));
  }, [listFriends, userOnline]);

  // Cập nhật thông tin người dùng đang được chọn nếu có thay đổi
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = closeFriendsOnline.find(
        (friend) => friend.id === selectedUser.id
      );
      if (updatedUser) {
        setSelectedUser({
          ...selectedUser,
          ...updatedUser,
          message: selectedUser.message // Giữ lại tin nhắn
        });
      }
    }
  }, [closeFriendsOnline, selectedUser]);

  const handleOpenChatBox = (user: OnlineUser) => {
    // Chuyển đổi từ OnlineUser sang SingleData để phù hợp với ChatBoxCommon
    const chatUser: SingleData = {
      ...user,
      image: user.avatar || 'default',
      message: [] // Khởi tạo mảng tin nhắn trống
    };
    
    setSelectedUser(chatUser);
    setChatBox(true);
  };

  const renderFriendItem = (friend: OnlineUser, index: number) => (
    <li
      key={friend.id || index}
      className={`friend-box user${index + 1}`}
    >
      <Media onClick={() => handleOpenChatBox(friend)}>
        <a
          className="popover-cls user-img bg-size blur-up lazyloaded"
          id={`friend-${friend.id || index}`}
        >
          <CustomImage
            src={
              friend.avatar
                ? `${ImagePath}/user-sm/${friend.avatar}.jpg`
                : `${ImagePath}/user-sm/default.jpg`
            }
            className="img-fluid blur-up lazyload bg-img"
            alt="user"
          />
          <span className="available-stats online" />
        </a>
        <Media body>
          <h5 className="user-name">
            {friend.name}
          </h5>
          <h6 className="mutual-count">
            {friend.mutual_friends_count} bạn chung
          </h6>
        </Media>
      </Media>
      <HoverMessage
        placement={mobileSize ? "right" : "top"}
        target={`friend-${friend.id || index}`}
        data={friend}
        imagePath={
          friend.avatar
            ? `user-sm/${friend.avatar}.jpg`
            : "user-sm/default.jpg"
        }
      />
    </li>
  );

  return (
    <div className="friend-section">
      <CommonHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        heading={`Online Friends (${closeFriendsOnline.length})`}
      />
     
      <Collapse isOpen={isOpen} className="friend-list">
        {isLoading ? (
          <div className="text-center py-3">Loading friends...</div>
        ) : closeFriendsOnline.length === 0 ? (
          <div className="text-center py-3">No friends online</div>
        ) : (
          <div className="online-friends">
            <ul>
              {closeFriendsOnline.map((friend, index) => renderFriendItem(friend, index))}
            </ul>
          </div>
        )}

        {chatBox && selectedUser && (
          <ChatBoxCommon
            setChatBox={setChatBox}
            data={selectedUser}
            setUserName={setUserName}
            userName={userName}
          />
        )}
      </Collapse>
    </div>
  );
};

export default CloseFriends;