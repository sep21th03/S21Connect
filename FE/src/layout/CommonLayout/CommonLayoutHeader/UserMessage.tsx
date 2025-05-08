import { userMessageData } from "@/Data/Layout";
import { Href, ImagePath } from "../../../utils/constant";
import Image from "next/image";
import { Media } from "reactstrap";
import { SingleUser } from "@/components/Messenger/MessengerType";

const UserMessage = ({
  userList,
  onlineUsers,
  onUserClick,
}: {
  userList: SingleUser[] | null;
  onlineUsers: string[];
  onUserClick: (user: SingleUser) => void;
}) => {
  return (
    <div className="dropdown-content">
      <ul className="friend-list">
        {userList?.map((data, index) => (
          <li key={index}>
            <a href={Href} onClick={() => onUserClick(data)}>
              <Media>
                <Image
                  width={40}
                  height={40}
                  src={`${ImagePath}/user-sm/${index + 1}.jpg`}
                  alt="user"
                />
                <Media body>
                  <h5 className="mt-0">{data.name}</h5>
                  <div>
                    {data.id === data.latest_Messenger?.sender_id ? (
                      <h6>{data.latest_Messenger?.content}</h6>
                    ) : (
                      <h6>Bạn: {data.latest_Messenger?.content}</h6>
                    )}
                  </div>
                </Media>
              </Media>
              {onlineUsers.includes(data.id) && (
                <div className="active-status">
                  <span className="active" />
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMessage;
