import { Media, Nav, NavItem, NavLink } from "reactstrap";
import UserHeader from "./UserHeader";
import CustomImage from "@/Common/CustomImage";
import { ImagePath } from "../../utils/constant";
import { FC, useEffect, useState } from "react";
import { ChatUsersInterFace, SingleUser } from "./MessengerType";
import { formatTime } from "@/utils/formatTime";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";

const ChatUsers: FC<ChatUsersInterFace> = ({
  userList,
  activeTab,
  setActiveTab,
  onlineUsers,
}) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<SingleUser[] | null>(userList);
  const { onNewMessage } = useSocket((users) => console.log(users));
  useEffect(() => {
    setUsers(userList);
  }, [userList]);
  useEffect(() => {
    const cleanup = onNewMessage((message) => {
      if (users) {
        setUsers((prevUsers) => {
          if (!prevUsers) return prevUsers;
          console.log("prevUsers", prevUsers);
          return prevUsers.map((user) => {
            const isSender = message.sender_id === user.id;
            const isReceiver = message.receiver_id === user.id;

            if (isSender || isReceiver) {
              return {
                ...user,
                latest_Messenger: {
                  id: message.id,
                  content: message.content,
                  type: message.type,
                  created_at: message.created_at,
                  sender_id: message.sender_id,
                },
                unread_count:
                  user.id !== activeTab
                    ? user.unread_count
                      ? user.unread_count + 1
                      : 1
                    : user.unread_count,
              };
            }
            return user;
          });
        });
      }
    });

    return () => {
      cleanup?.();
    };
  }, [users, activeTab]);

  const handleSetActiveTab = (userId: string) => {
    setActiveTab(userId);
    setUsers((prevUsers) =>
      prevUsers
        ? prevUsers.map((user) =>
            user.id === userId ? { ...user, unread_count: 0 } : user
          )
        : null
    );
  };

  return (
    <div className="chat-users">
      <UserHeader />
      <Nav tabs style={{ height: "auto" }}>
        {users?.map((data, index) => (
          <NavItem key={index}>
            <NavLink
              className={activeTab === data.id ? "active" : ""}
              onClick={() => handleSetActiveTab(data.id)}
            >
              <Media className="list-media">
                <div className="story-img">
                  <div className="user-img bg-size blur-up lazyloaded">
                    <CustomImage
                      src={`${ImagePath}/user/${index + 1}.jpg`}
                      className="img-fluid blur-up bg-img lazyloaded"
                      alt="user"
                    />
                  </div>
                </div>
                <Media body>
                  <h5>
                    {data.name}{" "}
                    <span>
                      {formatTime(data.latest_Messenger?.created_at || "")}
                    </span>
                  </h5>
                  <h6>
                    {onlineUsers.includes(data.id) ? "online" : "offline"}
                  </h6>
                </Media>
              </Media>
              {data.unread_count && data.unread_count > 0 ? (
                <div className="chat">
                  <h6 style={{ color: "black", fontWeight: "bold" }}>
                    {data.latest_Messenger?.sender_id === session?.user?.id
                      ? `Bạn: ${data.latest_Messenger?.content}`
                      : data.latest_Messenger?.content}
                  </h6>
                  <span className="count">{data.unread_count}</span>
                </div>
              ) : (
                <h6>
                  {data.latest_Messenger?.sender_id === session?.user?.id
                    ? `Bạn: ${data.latest_Messenger?.content}`
                    : data.latest_Messenger?.content}
                </h6>
              )}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    </div>
  );
};

export default ChatUsers;
