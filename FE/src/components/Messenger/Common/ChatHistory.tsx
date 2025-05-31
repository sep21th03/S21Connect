import { ChangeEvent, FC, Fragment, useEffect, useState, useRef } from "react";
import { ChatHistoryInterFace, SharePostMetadata  } from "../MessengerType";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import HideOption from "./HideOption";
import { Href } from "../../../utils/constant/index";
import Picker, { EmojiClickData } from "emoji-picker-react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import {
  Message,
  RecentMessage,
  SendMessagePayload,
  useSocket,
} from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import { formatTime } from "@/utils/index";
import Image from "next/image";
import { toast } from "react-toastify";

const ChatHistory: FC<ChatHistoryInterFace> = ({
  user,
  setUserList,
  initialConversationId,
}) => {
  const [showButton, setShowButton] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<
    { id: string; content: string; type: string; tempUrl?: string }[]
  >([]);

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const markMessagesAsUnread = async (
    userId: string,
    messagesData: Message[]
  ) => {
    try {
      const unreadMessages = messagesData.filter(
        (message) => !message.is_read && message.sender_id === userId
      );
      if (unreadMessages.length > 0) {
        await axiosInstance.post(
          `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}${API_ENDPOINTS.MESSAGES.MESSAGES.UNREAD_MESSAGES}`,
          {
            receiver_id: userId,
          }
        );

        setUserList(
          (prevUsers: RecentMessage[] | null) =>
            prevUsers?.map((u) => {
              if (u.id === userId) {
                return { ...u, unread_count: 0 };
              }
              return u;
            }) ?? null
        );
      }
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);

    if (user !== null && user !== undefined) {
      const userId = user.other_user.id;
      const conversationId = user.id;

      const fetchMessages = async (
        userId?: string,
        conversationId?: string
      ) => {
        try {
          let url = `${
            API_ENDPOINTS.MESSAGES.MESSAGES.BASE
          }${API_ENDPOINTS.MESSAGES.MESSAGES.GET_MESSAGES(
            initialConversationId ?? ""
          )}`;

          const response = await axiosInstance.get(url);
          const fetchedMessages = response.data.data.reverse();
          setMessages(fetchedMessages);

          if (userId) {
            await markMessagesAsUnread(userId, fetchedMessages);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setIsLoading(false);
        }
      };
      if (initialConversationId) {
        fetchMessages(userId);
      }

      if (conversationId) {
        joinChat(conversationId);

        if (socket) {
          markMessagesAsRead(conversationId);
        }
      }

      const cleanup = onNewMessage((message) => {
        if (
          (message.sender_id === userId ||
            message.sender_id === session?.user?.id) &&
          message.conversation_id === conversationId
        ) {
          setMessages((prevMessages) => {
            const alreadyExists = prevMessages.some(
              (msg) => msg.id === message.id
            );
            if (alreadyExists) return prevMessages;
            if (message.client_temp_id) {
              setPendingMessages((prev) =>
                prev.filter((msg) => msg.id !== message.client_temp_id)
              );
              setIsUploading(false);
            }
            return [...prevMessages, message];
          });

          if (message.sender_id !== session?.user?.id) {
            markMessagesAsRead(conversationId);
          }
        }
      });

      const uploadStatusCleanup = onImageUploadStatus(
        (status: { status: string; url?: string; message?: string }) => {
          if (status.status === "success") {
            setIsUploading(false);
            setPendingImage(null);
            setPendingMessages((prev) =>
              prev.map((msg) => {
                if (msg.type === "image" && msg.tempUrl) {
                  return { ...msg, content: status.url || "" };
                }
                return msg;
              })
            );
          } else if (status.status === "error") {
            console.error("Image upload failed:", status.message);
            setIsUploading(false);
            setPendingImage(null);
            setPendingMessages((prev) =>
              prev.filter((msg) => msg.type !== "image")
            );
            alert("Failed to upload image: " + status.message);
          }
        }
      );

      return () => {
        cleanup?.();
        uploadStatusCleanup?.();
        if (conversationId) {
          leaveChat(conversationId);
        }
      };
    } else {
      setIsLoading(false);
    }
  }, [user, session?.user?.id]);

  // useEffect(() => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

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

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !pendingImage) || !user) return;

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    if (pendingImage) {
      setIsUploading(true);
      const tempUrl = URL.createObjectURL(pendingImage);
      setPendingMessages((prev) => [
        ...prev,
        {
          id: tempId,
          content: tempUrl,
          type: "image",
          tempUrl: tempUrl,
        },
      ]);
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Data = reader.result?.toString().split(",")[1];
          if (!base64Data) {
            console.error("Chuyển ảnh thành base64 thất bại");
            setIsUploading(false);
            return;
          }
          const success = sendMessage({
            content: base64Data || "",
            receiver_id: user.other_user.id,
            conversation_id: user.id,
            type: "image",
            file_name: pendingImage.name,
            file_type: pendingImage.type,
            client_temp_id: tempId,
          });

          if (!success) {
            console.error("Gửi ảnh thất bại");
            setIsUploading(false);

            setPendingMessages((prev) =>
              prev.filter((msg) => msg.id !== tempId)
            );
            toast.error("Không thể gửi ảnh, vui lòng thử lại");
          }
        } catch (error) {
          console.error("Lỗi gửi ảnh:", error);
          setIsUploading(false);


          setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          toast.error("Đã xảy ra lỗi khi gửi ảnh");
        }
        setPendingImage(null);
      };
      reader.readAsDataURL(pendingImage);
      return;
    }

    const success = sendMessage({
      content: newMessage,
      receiver_id: user.other_user.id,
      conversation_id: user.id,
      type: "text",
    });

    if (success) {
      setNewMessage("");
    }
  };
  const renderMessageContent = (message: Message) => {
    if (message.type === "share_post") {
      return renderSharedPost(message);
    }
    if (message.type === "image" && message.content) {
      return (
        <div className="message-image-container">
          <img
            src={message.content}
            alt="Shared image"
            className="message-image"
            loading="lazy"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
            onLoad={() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
          />
        </div>
      );
    }
    return message.content;
  };
  const renderPendingMessage = (message: {
    id: string;
    content: string;
    type: string;
    tempUrl?: string;
  }) => {
    if (message.type === "image") {
      return (
        <div className="message-image-container">
          <div style={{ position: "relative" }}>
            <img
              src={message.content}
              alt="Đang tải ảnh..."
              className="message-image"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                opacity: "0.7",
              }}
            />
            {isUploading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="spinner"
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #ccc",
                    borderTopColor: "#333",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      );
    }
    return message.content;
  };

  const renderSharedPost = (message: Message) => {
    try {
      const rawMetadata : SharePostMetadata = message.metadata as SharePostMetadata;
      const metadata: SharePostMetadata =
      typeof rawMetadata === "string"
        ? JSON.parse(rawMetadata)
        : rawMetadata;
      return (
        <div className="shared-post-container" style={{
          border: "1px solid #e4e6ea",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          maxWidth: "350px",
          cursor: "pointer"
        }}>
          {message.content && (
            <div style={{
              padding: "12px",
              fontSize: "14px",
              lineHeight: "1.4"
            }}>
              {message.content}
            </div>
          )}
          
          <div 
            className="post-preview"
            onClick={() => {
              if (metadata.url) {
                window.open(metadata.url.startsWith('http') ? metadata.url : `/${metadata.url}`, '_blank');
              }
            }}
            style={{
              backgroundColor: "white",
              border: "1px solid #e4e6ea",
              borderRadius: "8px",
              margin: "0 12px 12px 12px",
              overflow: "hidden"
            }}
          >
            {metadata.image && (
              <div style={{ position: "relative", width: "100%", height: "200px" }}>
                <img
                  src={metadata.image}
                  alt="Post preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div style={{ padding: "12px" }}>
              <div style={{
                fontSize: "14px",
                lineHeight: "1.4",
                color: "#1c1e21",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {metadata.content || "Xem bài viết..."}
              </div>
              
              <div style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#65676b",
                textTransform: "uppercase"
              }}>
                Bài viết #{metadata.post_id}
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Lỗi phân tích metadata bài viết được chia sẻ:", error);
      return (
        <div style={{
          padding: "12px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          color: "#c62828",
          fontSize: "14px"
        }}>
          Không thể hiển thị bài viết được chia sẻ
        </div>
      );
    }
  };

  return (
    <div className="chat-history">
      <div className="avenue-messenger">
        <div className="chat">
          <div className="messages-content theme-scrollbar">
            {!isLoading &&
              messages?.map((data, index) => (
                <Fragment key={index}>
                  {data.sender_id === session?.user?.id ? (
                    <div className="message message-personal new">
                      {renderMessageContent(data)}
                      <div className="timestamp" style={{ bottom: "-20px" }}>
                        {formatTime(data.created_at || "")}
                      </div>
                      <div
                        className="checkmark-sent-delivered"
                        style={{ bottom: "-20px" }}
                      >
                        ✓
                      </div>
                      {data.is_read && (
                        <div
                          className="checkmark-read"
                          style={{ bottom: "-20px" }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="message new">
                      {renderMessageContent(data)}
                      <div className="timestamp" style={{ bottom: "-20px" }}>
                        {formatTime(data.created_at || "")}
                      </div>
                      <div
                        className="checkmark-sent-delivered"
                        style={{ bottom: "-20px" }}
                      >
                        ✓
                      </div>
                      {data.is_read && (
                        <div
                          className="checkmark-read"
                          style={{ bottom: "-20px" }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  )}
                </Fragment>
              ))}

            {pendingMessages.map((message, index) => (
              <div
                key={`pending-${message.id}`}
                className="message message-personal new"
              >
                <span>
                  {renderPendingMessage(message)}
                  <div
                    className="timestamp"
                    style={{
                      fontSize: "10px",
                      marginTop: "5px",
                      color: "#999",
                      fontStyle: "italic",
                    }}
                  >
                    Đang gửi...
                  </div>
                </span>
              </div>
            ))}
            {/* <div ref={messagesEndRef} /> */}
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
                  handleSendMessage();
                }
              }}
            />
            {pendingImage && (
              <div
                className="image-preview-wrapper"
                style={{ display: "relative" }}
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
              onClick={!isUploading ? handleSendMessage : undefined}
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
