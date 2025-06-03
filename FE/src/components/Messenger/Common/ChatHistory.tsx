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
  messagesOffset?: number;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  user,
  setUserList,
  initialConversationId,
  enableInfiniteScroll,
  messagesOffset,
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
      sender_name?: string;
    }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const {
    socket,
    joinChat,
    sendMessage,
    onNewMessage,
    leaveChat,
    markMessagesAsRead,
    onImageUploadStatus,
  } = useSocket(
    (users) => console.log(users),
    (message) => console.log(message)
  );
  const { data: session } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isScrollingToBottom = useRef<boolean>(false);
  const shouldScrollToBottom = useRef<boolean>(true);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollState = useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);
  const isLoadingOlderMessages = useRef<boolean>(false);
  const previousMessagesLength = useRef<number>(0);

  const perPage = 20;

  const scrollToBottom = useCallback(() => {
    if (
      messagesEndRef.current &&
      messagesContainerRef.current &&
      shouldScrollToBottom.current &&
      !isLoadingOlderMessages.current
    ) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        messagesContainerRef.current!.scrollTop =
          messagesContainerRef.current!.scrollHeight ?? 0;
        isScrollingToBottom.current = true;
        setTimeout(() => {
          isScrollingToBottom.current = false;
        }, 100);
      });
    }
  }, []);

  const scrollToMessageByOffset = useCallback(
    async (offset: number) => {
      if (!initialConversationId || !messagesContainerRef.current) return;

      const targetPage = Math.ceil((offset + 1) / perPage);

      if (targetPage > currentPage && hasMoreMessages && !isLoadingMore) {
        isLoadingOlderMessages.current = true;
        setIsLoadingMore(true);
        try {
          for (
            let page = currentPage + 1;
            page <= targetPage && hasMoreMessages;
            page++
          ) {
            await fetchMessages(
              initialConversationId,
              page,
              true,
              setIsLoading,
              setIsLoadingMore,
              setMessages,
              setCurrentPage,
              setHasMoreMessages,
              setTotalMessages,
              () => {}
            );
          }
        } finally {
          setIsLoadingMore(false);
          isLoadingOlderMessages.current = false;
        }
      }

      const allMessagesSorted = [
        ...messages.map((msg) => ({ ...msg, isPending: false })),
        ...pendingMessages.map((msg) => ({ ...msg, isPending: true })),
      ].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const targetIndex = allMessagesSorted.length - 1 - offset;

      const targetMessage = allMessagesSorted[targetIndex];
      if (targetMessage) {
        const messageId = targetMessage.isPending
          ? `pending-${targetMessage.id}`
          : targetMessage.id;

        setHighlightedMessageId((prev) => {
          return messageId;
        });
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);

        const messageElement = messageRefs.current[messageId];
        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else {
          const estimatedMessageHeight = 50;
          const scrollPosition = targetIndex * estimatedMessageHeight;
          messagesContainerRef.current.scrollTop = scrollPosition;
        }
      } else {
        console.error(
          "Không tìm thấy tin nhắn tại offset:",
          offset,
          "Target index:",
          targetIndex,
          "Length:",
          allMessagesSorted.length
        );
      }
    },
    [
      initialConversationId,
      currentPage,
      hasMoreMessages,
      isLoadingMore,
      messages,
      pendingMessages,
      totalMessages,
    ]
  );

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !enableInfiniteScroll) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isAtBottom) {
      shouldScrollToBottom.current = true;
    } else {
      shouldScrollToBottom.current = false;
    }

    const threshold = 50;
    const isNearTop = scrollTop <= threshold;
    const isScrollingUp =
      scrollTop <
      (container.dataset.lastScrollTop
        ? parseInt(container.dataset.lastScrollTop)
        : 0);

    container.dataset.lastScrollTop = scrollTop.toString();

    if (
      isNearTop &&
      isScrollingUp &&
      hasMoreMessages &&
      !isLoadingMore &&
      !isScrollingToBottom.current
    ) {
      // lưu trạng thái cuộn
      scrollState.current = { scrollTop, scrollHeight };
      isLoadingOlderMessages.current = true;
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, enableInfiniteScroll]);

  const loadMoreMessages = useCallback(async () => {
    if (
      !hasMoreMessages ||
      isLoadingMore ||
      !initialConversationId ||
      !enableInfiniteScroll
    )
      return;

    setIsLoadingMore(true);
    isLoadingOlderMessages.current = true;
    try {
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
        () => {}
      );

      // khôi phục vị trí cuộn
      if (messagesContainerRef.current && scrollState.current) {
        const { scrollTop: oldScrollTop, scrollHeight: oldScrollHeight } =
          scrollState.current;
        const newScrollHeight = messagesContainerRef.current.scrollHeight;
        const addedHeight = newScrollHeight - oldScrollHeight;
        messagesContainerRef.current.scrollTop = oldScrollTop + addedHeight;
      }
    } finally {
      scrollState.current = null;
      setIsLoadingMore(false);
      isLoadingOlderMessages.current = false;
    }
  }, [
    currentPage,
    hasMoreMessages,
    isLoadingMore,
    initialConversationId,
    enableInfiniteScroll,
  ]);

  useEffect(() => {
    if (messagesOffset !== undefined && !isLoading && !isLoadingMore) {
      shouldScrollToBottom.current = false;
      scrollToMessageByOffset(messagesOffset);
    }
  }, [messagesOffset, isLoading, isLoadingMore, scrollToMessageByOffset]);

  useEffect(() => {
    const currentMessagesLength = messages.length + pendingMessages.length;
    const isNewMessage = currentMessagesLength > previousMessagesLength.current;

    if (
      !isLoading &&
      currentMessagesLength > 0 &&
      shouldScrollToBottom.current &&
      !isLoadingOlderMessages.current &&
      (isNewMessage || previousMessagesLength.current === 0)
    ) {
      scrollToBottom();
    }

    previousMessagesLength.current = currentMessagesLength;
  }, [isLoading, messages.length, pendingMessages.length, scrollToBottom]);

  useEffect(() => {
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    setIsLoading(true);
    shouldScrollToBottom.current = true;
    previousMessagesLength.current = 0;

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
        if (user.type === "private" && user.other_user?.id) {
          markMessagesAsUnread(
            user.other_user.id,
            fetchedMessages,
            setUserList
          );
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
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages, pendingMessages]
  );
  const getSenderName = (senderId: string) => {
    if (user?.type === "group" && user.members) {
      const member = user.members.find((m) => m.id === senderId);
      return member ? member.name || member.username : "Người dùng";
    }
    return user?.other_user?.name || "Người dùng";
  };
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
                const previousMessage =
                  index > 0 ? allMessages[index - 1] : null;
                const showTimestamp = shouldShowTimestamp(
                  data,
                  previousMessage
                );
                const messageId = data.isPending
                  ? `pending-${data.id}`
                  : data.id;
                const isOwnMessage = data.sender_id === session?.user?.id;
                const senderName = isOwnMessage
                  ? "Bạn"
                  : getSenderName(data.sender_id);
                return (
                  <Fragment key={messageId}>
                    {data.sender_id === session?.user?.id ? (
                      <div
                      className={`message ${isOwnMessage ? "message-personal" : ""} new ${
                          highlightedMessageId === messageId
                            ? "highlighted"
                            : ""
                        }`}
                        ref={(el) => {
                          if (el) {
                            messageRefs.current[messageId] = el;
                          }
                        }}
                        data-message-id={messageId}
                      >
                        {user?.type === "group" && !isOwnMessage && (
                        <div className="sender-name" style={{ fontWeight: "bold", marginBottom: "4px" }}>
                          {senderName}
                        </div>
                      )}
                        {data.isPending
                          ? renderPendingMessage(data, isUploading)
                          : renderMessageContent(
                              data as Message,
                              scrollToBottom,
                              shouldScrollToBottom
                            )}
                        {showTimestamp && (
                          <div
                            className="timestamp"
                            style={{ bottom: "-20px", [isOwnMessage ? "right" : "left"]: "0px", }}
                          >
                            {data.isPending
                              ? "Đang gửi..."
                              : formatTime(data.created_at || "")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`message ${isOwnMessage ? "message-personal" : ""} new ${
                          highlightedMessageId === messageId
                            ? "highlighted"
                            : ""
                        }`}
                        ref={(el) => {
                          if (el) messageRefs.current[messageId] = el;
                        }}
                        data-message-id={messageId}
                      >
                        {user?.type === "group" && !isOwnMessage && (
                          <div className="sender-name" style={{ fontWeight: "bold", marginBottom: "4px" }}>
                            {senderName}
                          </div>
                        )}
                        {renderMessageContent(
                          data as Message,
                          scrollToBottom,
                          shouldScrollToBottom
                        )}
                        {showTimestamp && (
                          <div
                            className="timestamp"
                            style={{ bottom: "-20px", [isOwnMessage ? "right" : "left"]: "0px", }}
                          >
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
              <div
                className="image-preview-wrapper"
                style={{ position: "relative" }}
              >
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
      <style jsx>{`
        .highlighted {
          color: #ffeb3b !important;
          transition: background-color 0.3s ease !important;
          animation: highlightPulse 0.5s ease-in-out 2;
        }
        @keyframes highlightPulse {
          0% {
            background-color: #ffeb3b;
          }
          50% {
            background-color: #fff176;
          }
          100% {
            background-color: #ffeb3b;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatHistory;
