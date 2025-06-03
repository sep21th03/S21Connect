import { Href, ImagePath } from "../../../utils/constant";
import Image from "next/image";
import { Media } from "reactstrap";
import { RecentMessage } from "@/hooks/useSocket";

const UserMessage = ({
  userList,
  onlineUsers,
  onUserClick,
  currentUserId,
}: {
  userList: RecentMessage[] | null;
  onlineUsers: string[];
  onUserClick: (user: RecentMessage) => void;
  currentUserId: string;
}) => {
  return (
    <div className="dropdown-content">
      <ul className="friend-list">
        {userList?.map((data, index) => {
          const isGroupChat = data.type === "group";
          const avatar = isGroupChat
            ? data.avatar || `${ImagePath}/icon/group.png`
            : data.other_user?.avatar || `${ImagePath}/icon/user.png`;
          const name = isGroupChat
            ? data.name || "Nhóm chat"
            : data.other_user?.nickname ||
              data.other_user?.name ||
              "Người dùng";
          return (
            <li key={index}>
              <a href={Href} onClick={() => onUserClick(data)}>
                <Media>
                  {isGroupChat ? (
                    <div className="group-avatar-wrapper">
                      <div className="avatar avatar-1">
                        <Image
                          src={
                            data.members?.[0]?.avatar ||
                            `${ImagePath}/icon/user.png`
                          }
                          alt="member1"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="avatar avatar-2">
                        <Image
                          src={
                            data.members?.[1]?.avatar ||
                            `${ImagePath}/icon/user.png`
                          }
                          alt="member2"
                          width={40}
                          height={40}
                        />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={avatar}
                      className="img-fluid blur-up bg-img lazyloaded rounded-circle"
                      alt="user"
                      width={45}
                      height={45}
                    />
                  )}

                  <Media body>
                    <h5 className="mt-0">{name}</h5>
                    <div>
                      {(() => {
                        const latestMessage = data.latest_message;
                        const isImage = latestMessage?.type === "image";
                        const isSharePost =
                          latestMessage?.type === "share_post";

                        const isSenderCurrentUser =
                          latestMessage?.sender_id === currentUserId;

                        const senderUser = isGroupChat
                          ? data.members?.find(
                              (member) => member.id === latestMessage?.sender_id
                            )
                          : data.other_user;
                        const senderName = isSenderCurrentUser
                          ? "Bạn"
                          : senderUser?.nickname ||
                            senderUser?.name ||
                            "Người dùng";

                        const groupName = isGroupChat
                          ? ` (trong ${data.name})`
                          : "";

                        if (isImage) {
                          return (
                            <h6
                              className={data.unread_count > 0 ? "fw-bold" : ""}
                            >
                              {isSenderCurrentUser
                                ? "Bạn đã gửi 1 ảnh"
                                : `${senderName} đã gửi 1 ảnh`}
                              {groupName}
                            </h6>
                          );
                        } else if (isSharePost) {
                          return (
                            <h6
                              className={data.unread_count > 0 ? "fw-bold" : ""}
                            >
                              {isSenderCurrentUser
                                ? "Bạn đã chia sẻ 1 bài viết"
                                : `${senderName} đã chia sẻ 1 bài viết`}
                              {groupName}
                            </h6>
                          );
                        } else {
                          return (
                            <div className="d-flex justify-content-between">
                              <h6
                                className={
                                  data.unread_count > 0 ? "fw-bold" : ""
                                }
                              >
                                {isSenderCurrentUser
                                  ? isGroupChat
                                    ? `Bạn: ${latestMessage?.content}`
                                    : latestMessage?.content
                                  : `${senderName}: ${latestMessage?.content}`}
                              </h6>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </Media>
                </Media>
                {!isGroupChat &&
                  onlineUsers.includes(data.other_user?.id || "") && (
                    <div className="active-status">
                      <span className="active" />
                    </div>
                  )}
              </a>
            </li>
          );
        })}
      </ul>
      <style jsx>{`
        .group-avatar-wrapper {
          position: relative;
          width: 45px;
          height: 45px;
        }

        .group-avatar-wrapper .avatar {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #fff;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
        }

        .group-avatar-wrapper .avatar-1 {
          bottom: 0;
          left: 0;
          z-index: 2;
        }

        .group-avatar-wrapper .avatar-2 {
          top: 0;
          right: 0;
          z-index: 1;
          transform: translate(-15%, 0%);
        }
      `}</style>
    </div>
  );
};

export default UserMessage;
