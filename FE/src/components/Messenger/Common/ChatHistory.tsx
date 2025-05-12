import { ChangeEvent, FC, Fragment, useEffect, useState, useRef } from "react";
import { ChatHistoryInterFace, SingleUser } from "../MessengerType";
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

  const {
    socket,
    joinChat,
    sendMessage,
    onNewMessage,
    leaveChat,
    markMessagesAsRead,
    onImageUploadStatus,
  } = useSocket((users) => console.log(users));
  const { data: session } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fix 1: This function isn't using updated messages state
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
            console.log("Image uploaded successfully:", status.url);
            setIsUploading(false);
          } else if (status.status === "error") {
            console.error("Image upload failed:", status.message);
            setIsUploading(false);
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
        alert("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }

      setPendingImage(file);
    }
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !pendingImage) || !user) return;
    if (pendingImage) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Data = reader.result?.toString().split(",")[1];
          if (!base64Data) {
            console.error("Failed to convert image to base64");
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
          });

          if (success) {
            console.log("Image sent to server for processing");
            setPendingImage(null); 
            setIsUploading(false);
          } else {
            setIsUploading(false);
            console.error("Failed to send image message");
          }
        } catch (error) {
          console.error("Error sending image:", error);
          setIsUploading(false);
        } setPendingImage(null); 
        setIsUploading(false);
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
