// src/components/Messenger/Common/ChatHistory.tsx
import {
  ChangeEvent,
  FC,
  Fragment,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChatHistoryInterFace } from "../MessengerType";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import HideOption from "./HideOption";
import { Href } from "../../../utils/constant/index";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { Message } from "@/hooks/useSocket";
import {
  fetchMessages,
  markMessagesAsUnread,
  handleSendMessage,
} from "@/service/messageService";
import { setupSocketListeners } from "@/service/socketService";
import {
  shouldShowTimestamp,
  renderMessageContent,
  renderPendingMessage,
} from "@/components/Messenger/Common/MessageUtils";
import { useSocket } from "@/hooks/useSocket";
import { formatTime } from "@/utils/index";

interface ChatHistoryProps extends ChatHistoryInterFace {
  enableInfiniteScroll: boolean;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  user,
  setUserList,
  initialConversationId,
  enableInfiniteScroll,
}) => {
  const [showButton, setShowButton] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<
    {
      id: string;
      content: string;
      type: string;
      tempUrl?: string;
      created_at: string;
      sender_id: string;
    }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  const { socket, joinChat, sendMessage, onNewMessage, leaveChat, markMessagesAsRead, onImageUploadStatus } =
    useSocket(
      (users) => console.log(users),
      (message) => console.log(message)
    );
  const { data: session } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isScrollingToBottom = useRef<boolean>(false);
  const shouldScrollToBottom = useRef<boolean>(true);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && messagesContainerRef.current && shouldScrollToBottom.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight ?? 0;
        isScrollingToBottom.current = true;
        setTimeout(() => {
          isScrollingToBottom.current = false;
        }, 100);
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !enableInfiniteScroll) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isAtBottom) {
      shouldScrollToBottom.current = true;
    }

    const threshold = 50;
    const isNearTop = scrollTop <= threshold;
    const isScrollingUp =
      scrollTop <
      (container.dataset.lastScrollTop ? parseInt(container.dataset.lastScrollTop) : 0);

    container.dataset.lastScrollTop = scrollTop.toString();

    if (
      isNearTop &&
      isScrollingUp &&
      hasMoreMessages &&
      !isLoadingMore &&
      !isScrollingToBottom.current
    ) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, enableInfiniteScroll]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore || !initialConversationId || !enableInfiniteScroll) return;

    await fetchMessages(
      initialConversationId,
      currentPage + 1,
      true,
      setIsLoading,
      setIsLoadingMore,
      setMessages,
      setCurrentPage,
      setHasMoreMessages,
      setTotalMessages,
      scrollToBottom
    );
  }, [
    currentPage,
    hasMoreMessages,
    isLoadingMore,
    initialConversationId,
    enableInfiniteScroll,
  ]);

  useEffect(() => {
    if (!isLoading && (messages.length > 0 || pendingMessages.length > 0)) {
      scrollToBottom();
    }
  }, [messages, pendingMessages, isLoading, scrollToBottom]);

  useEffect(() => {
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    setIsLoading(true);
    shouldScrollToBottom.current = true;

    if (user && initialConversationId) {
      fetchMessages(
        initialConversationId,
        1,
        false,
        setIsLoading,
        setIsLoadingMore,
        setMessages,
        setCurrentPage,
        setHasMoreMessages,
        setTotalMessages,
        scrollToBottom
      ).then((fetchedMessages) => {
        if (user.other_user.id) {
          markMessagesAsUnread(user.other_user.id, fetchedMessages, setUserList);
        }
      });

      const cleanup = setupSocketListeners(
        user,
        session,
        initialConversationId,
        setMessages,
        setPendingMessages,
        setIsUploading,
        setPendingImage,
        scrollToBottom,
        joinChat,
        leaveChat,
        markMessagesAsRead,
        onNewMessage,
        onImageUploadStatus
      );
  
      return cleanup;
    } else {
      setIsLoading(false);
    }
  }, [user?.id, session?.user?.id, initialConversationId]);

  const addEmoji = (emoji: EmojiClickData) => {
    setNewMessage(newMessage + emoji.emoji);
  };

  const handleUpdateButton = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh phải nhỏ hơn 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Chỉ chấp nhận file ảnh");
        return;
      }
      setPendingImage(file);
    }
  };

  const allMessages = useMemo(
    () =>
      [
        ...messages.map((msg) => ({ ...msg, isPending: false })),
        ...pendingMessages.map((msg) => ({ ...msg, isPending: true })),
      ].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages, pendingMessages]
  );

  return (
    <div className="chat-history">
      <div className="avenue-messenger">
        <div className="chat">
          <div
            className="messages-content theme-scrollbar"
            ref={messagesContainerRef}
            onScroll={handleScroll}
            style={{
              overflowY: "auto",
              scrollBehavior: "smooth",
            }}
          >
            {isLoadingMore && (
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                <div
                  className="spinner"
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #ccc",
                    borderTopColor: "#333",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 5px",
                  }}
                />
                Đang tải thêm tin nhắn...
              </div>
            )}

            {!isLoading &&
              allMessages.map((data, index) => {
                const previousMessage = index > 0 ? allMessages[index - 1] : null;
                const showTimestamp = shouldShowTimestamp(data, previousMessage);
                return (
                  <Fragment key={data.isPending ? `pending-${data.id}` : data.id}>
                    {data.sender_id === session?.user?.id ? (
                      <div className="message message-personal new">
                        {data.isPending
                          ? renderPendingMessage(data, isUploading)
                          : renderMessageContent(data as Message, scrollToBottom, shouldScrollToBottom)}
                        {showTimestamp && (
                          <div className="timestamp" style={{ bottom: "-20px", right: "0px" }}>
                            {data.isPending
                              ? "Đang gửi..."
                              : formatTime(data.created_at || "")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="message new">
                        {renderMessageContent(data as Message, scrollToBottom, shouldScrollToBottom)}
                        {showTimestamp && (
                          <div className="timestamp" style={{ bottom: "-20px", left: "0px" }}>
                            {formatTime(data.created_at || "")}
                          </div>
                        )}
                      </div>
                    )}
                  </Fragment>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
          <div className="message-box">
            <a href={Href}>
              <DynamicFeatherIcon
                iconName="Smile"
                className="icon icon-2 iw-14 ih-14"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
            </a>
            {showEmojiPicker ? <Picker onEmojiClick={addEmoji} /> : null}
            <textarea
              onChange={handleUpdateButton}
              className="message-input emojiPicker"
              placeholder="Type message..."
              value={newMessage}
              disabled={isUploading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(
                    newMessage,
                    pendingImage,
                    user,
                    session,
                    setIsUploading,
                    setPendingMessages,
                    setNewMessage,
                    setPendingImage,
                    sendMessage,
                    scrollToBottom
                  );
                }
              }}
            />
            {pendingImage && (
              <div className="image-preview-wrapper" style={{ display: "relative" }}>
                <img
                  src={URL.createObjectURL(pendingImage)}
                  alt="preview"
                  className="image-preview"
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    marginRight: "40px",
                  }}
                />
                <button
                  className="remove-image-btn"
                  onClick={() => setPendingImage(null)}
                  aria-label="Remove image"
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "75px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <DynamicFeatherIcon iconName="X" />
                </button>
              </div>
            )}
            <div className={`add-extent ${showButton ? "show" : ""}`}>
              <DynamicFeatherIcon
                className="animated-btn"
                iconName="Plus"
                onClick={() => setShowButton(!showButton)}
              />
              <HideOption onImageClick={handleImageClick} />
            </div>
            <a
              href="#"
              className={`message-submit ${isUploading ? "disabled" : ""}`}
              onClick={() =>
                !isUploading &&
                handleSendMessage(
                  newMessage,
                  pendingImage,
                  user,
                  session,
                  setIsUploading,
                  setPendingMessages,
                  setNewMessage,
                  setPendingImage,
                  sendMessage,
                  scrollToBottom
                )
              }
            >
              {isUploading ? (
                <div className="spinner"></div>
              ) : (
                <DynamicFeatherIcon iconName="Send" />
              )}
            </a>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ChatHistory;