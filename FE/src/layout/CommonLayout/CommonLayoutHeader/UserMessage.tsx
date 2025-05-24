import { userMessageData } from "@/Data/Layout";
import { Href, ImagePath } from "../../../utils/constant";
import Image from "next/image";
import { Media } from "reactstrap";
import { RecentMessage } from "@/hooks/useSocket";

const UserMessage = ({
  userList,
  onlineUsers,
  onUserClick,
}: {
  userList: RecentMessage[] | null;
  onlineUsers: string[];
  onUserClick: (user: RecentMessage) => void;
}) => {
  return (
    <div className="dropdown-content">
      <ul className="friend-list">
        {userList?.map((data, index) => (
          <li key={index}>
            <a href={Href} onClick={() => onUserClick(data)}>
              <Media>
                <Image
                  src={data.other_user.avatar || `${ImagePath}/icon/user.png`}
                  className="img-fluid blur-up bg-img lazyloaded rounded-circle"
                  alt="user"
                  width={100}
                  height={100}
                />
                <Media body>
                  <h5 className="mt-0">{data.other_user.name}</h5>
                  <div>
                    {(() => {
                      const isImage = data.latest_message?.type === "image";
                      const isSenderOther =
                        data.other_user.id === data.latest_message?.sender_id;
                      if (isImage) {
                        return (
                          <h6
                            className={data.unread_count > 0 ? "fw-bold" : ""}
                          >
                            {isSenderOther
                              ? `${
                                  data.other_user.name || "Người kia"
                                } đã gửi 1 ảnh`
                              : "Bạn đã gửi 1 ảnh"}
                          </h6>
                        );
                      } else {
                        return (
                          <div className="d-flex justify-content-between">
                          <h6
                            className={data.unread_count > 0 ? "fw-bold" : ""}
                          >
                            {isSenderOther
                              ? data.latest_message?.content
                              : `Bạn: ${data.latest_message?.content}`}
                            
                          </h6>
                          {/* {data.unread_count > 0 && (
                            <span className="badge bg-danger unread-dot">
                              {data.unread_count}+
                            </span>
                          )} */}
                        </div>
                        );
                      }
                    })()}
                  </div>
                </Media>
              </Media>
              {onlineUsers.includes(data.other_user.id) && (
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
