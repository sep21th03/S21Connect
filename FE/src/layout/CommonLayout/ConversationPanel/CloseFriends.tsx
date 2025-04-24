// CloseFriends.tsx
import { FC, useEffect, useState } from "react";
import { Collapse, Media } from "reactstrap";
import { useSession } from "next-auth/react";
import CustomImage from "@/Common/CustomImage";
import HoverMessage from "@/Common/HoverMessage";
import ChatBoxCommon from "./common/ChatBoxCommon";
import CommonHeader from "./common/CommonHeader";
import useMobileSize from "@/utils/useMobileSize";
import axiosInstance from "@/utils/axiosInstance";
import { ImagePath } from "@/utils/constant";
import { SingleData, commonInterFace } from "@/layout/LayoutTypes";
import { API_ENDPOINTS } from "@/utils/constant/api";


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

  const getListFriends = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        API_ENDPOINTS.USERS.BASE + API_ENDPOINTS.USERS.LIST_FRIENDS(userId)
      );
      setListFriends(response.data);
    } catch (error) {
      console.error("Failed to fetch friends list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userName !== null && selectedUser) {
      setSelectedUser(
        userName.find((x) => x.id === selectedUser.id) || selectedUser
      );
    }

    if (session?.user?.id) {
      getListFriends(session.user.id);
    }
  }, [userName, session?.user?.id]);

  const handleOpenChatBox = (user: SingleData) => {
    setSelectedUser(user);
    setChatBox(true);
  };

  return (
    <div className="friend-section">
      <CommonHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        heading="close friend"
      />
      <Collapse isOpen={isOpen} className="friend-list">
        {isLoading ? (
          <div className="text-center py-3">Loading friends...</div>
        ) : listFriends.length === 0 ? (
          <div className="text-center py-3">No friends found</div>
        ) : (
          <ul>
            {listFriends.map((friend, index) => (
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
                    <span
                      className={`available-stats ${
                        friend.status || "offline"
                      }`}
                    />
                  </a>
                  <Media body>
                    <h5 className="user-name">
                      {friend.first_name} {friend.last_name}
                    </h5>
                    <h6>{friend.email}</h6>
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
            ))}
          </ul>
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
