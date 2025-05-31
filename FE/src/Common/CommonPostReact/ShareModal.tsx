import { FC, useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import UserDropDown from "./UserDropDown";
import MessageUserList from "@/components/Messenger/Common/MessageUserList";
import { ImagePath, sharePost } from "../../utils/constant";
import { ShareModalProps } from "../CommonInterFace";
import Image from "next/image";
import { toast } from "react-toastify";
import { RecentMessage } from "@/hooks/useSocket";
import { searchFriends } from "@/service/userSerivice";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import { sharePost as sharePostService } from "@/service/postService";
import { sendMessage } from "@/service/messageService";
interface ShareModalEnhancedProps extends ShareModalProps {
  onSendMessage?: (userId: string, message: string, postData: any) => void;
}
type SelectedUser = {
  user_id: string;
  conversation_id: string | null;
  username: string;
  avatar: string | null;
};
const ShareModal: FC<ShareModalEnhancedProps> = ({
  showModal,
  toggleModal,
  post,
}) => {
  const [showOption, setShowOption] = useState("public");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("post");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [friendList, setFriendList] = useState<any[]>([]);
  const [isFriendsLoaded, setIsFriendsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useSelector((state: RootState) => state.user);

  const rawImage = Array.isArray(post?.images) ? post?.images[0] : post?.images;
  const imageList = typeof rawImage === "string" ? rawImage.split("|") : [];

  const handleSharePost = async () => {
    try {
      const response = await sharePostService(post?.id, showOption, content);
      if (response.status === 200) {
        toast.success(response.data.message);
        toggleModal();
      }
    } catch (error) {
      toast.error("Không thể chia sẻ bài viết");
    }
  };

  const handleSendToMessage = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một người để gửi");
      return;
    }

    try {
      for (const user of selectedUsers) {
        let conversationId = user.conversation_id;

        const messagePayload = {
          type: "share_post",
          content: messageContent,
          metadata: {
            post_id: post?.id,
            image: imageList[0] || user.avatar,
            url: `${user.username}/posts/${post?.id}?modal=true`,
            content: post?.content?.substring(0, 100) + "...",
          },
          receiver_id: user.user_id,
          conversation_id: conversationId,
        };

        await sendMessage(messagePayload);
      }

      toast.success(`Đã gửi bài viết đến ${selectedUsers.length} người`);
      toggleModal();
      setSelectedUsers([]);
      setMessageContent("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn");
    }
  };

  useEffect(() => {
    if (activeTab !== "message") return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchFriends(searchTerm);
        setFriendList(res);
        setIsFriendsLoaded(true);
      } catch (error) {
        toast.error("Không thể tải danh sách bạn bè");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const toggleTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Modal
      isOpen={showModal}
      toggle={toggleModal}
      centered
      modalClassName="mobile-full-width"
      contentClassName="share-modal"
      size="lg"
    >
      <ModalHeader toggle={toggleModal}>
        <div className="w-100">
          <Nav tabs className="mb-3">
            <NavItem>
              <NavLink
                className={activeTab === "post" ? "active" : ""}
                onClick={() => toggleTab("post")}
                style={{ cursor: "pointer" }}
              >
                Chia sẻ bài viết
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "message" ? "active" : ""}
                onClick={() => toggleTab("message")}
                style={{ cursor: "pointer" }}
              >
                Gửi tin nhắn
              </NavLink>
            </NavItem>
          </Nav>
        </div>
      </ModalHeader>

      <ModalBody style={{ minHeight: "400px" }}>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="post">
            <UserDropDown
              setShowOption={setShowOption}
              showOption={showOption}
              user={user}
            />
            <div className="input-section mt-3">
              <Input
                type="textarea"
                className="emojiPicker"
                placeholder="Viết gì đó..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
          </TabPane>

          <TabPane tabId="message">
            <div className="message-share-content">
              <h6 className="mb-3">Gửi bài viết qua tin nhắn</h6>

              <div className="post-preview-card mb-3 p-3 border rounded">
                <div className="d-flex">
                  {imageList[0] && (
                    <div className="preview-image me-3">
                      <Image
                        src={imageList[0]}
                        alt="Post preview"
                        width={80}
                        height={80}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                    </div>
                  )}
                  <div className="preview-content">
                    <h6 className="mb-1">{"Bài viết"}</h6>
                    <p className="mb-1 text-muted small">
                      {post?.content?.substring(0, 100)}...
                    </p>
                    <small className="text-muted">
                      Bởi{" "}
                      {post?.user?.first_name + " " + post?.user?.last_name ||
                        "Unknown"}
                    </small>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <Input
                  type="textarea"
                  placeholder="Thêm tin nhắn (tùy chọn)..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={2}
                />
              </div>

              <MessageUserList
                userList={friendList}
                selectedUsers={selectedUsers.map((user) => ({
                  id: user.user_id,
                  conversation_id: user.conversation_id,
                  username: user.username,
                  avatar: user.avatar,
                }))}
                onUserSelect={(userIds) =>
                  setSelectedUsers(
                    userIds.map((user) => ({
                      user_id: user.id,
                      conversation_id: user.conversation_id,
                      username: user.username,
                      avatar: user.avatar,
                    }))
                  )
                }
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </TabPane>
        </TabContent>
      </ModalBody>

      <ModalFooter>
        {activeTab === "post" ? (
          <Button onClick={handleSharePost} color="primary">
            {sharePost}
          </Button>
        ) : (
          <Button
            onClick={handleSendToMessage}
            color="primary"
            disabled={selectedUsers.length === 0}
          >
            Gửi tin nhắn ({selectedUsers.length})
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ShareModal;
