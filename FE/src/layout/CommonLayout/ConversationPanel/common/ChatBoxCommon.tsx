import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Href, ImagePath } from "../../../../utils/constant/index";
import { FC } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Input } from "reactstrap";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";
import { Message, RecentMessage, useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { formatTime } from "@/utils/index";
import { toast } from "react-toastify";

interface ChatBoxCommonInterFace {
  setChatBox: (value: boolean) => void;
  data: RecentMessage;
  handleMessagesRead: (userId: string) => void;
}

const ChatBoxCommon: FC<ChatBoxCommonInterFace> = ({ setChatBox, data, handleMessagesRead }) => {
  const [showOption, setShowOption] = useState(false);
  const [smallChat, setSmallChat] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    socket,
    sendMessage,
    onNewMessage,
    joinChat,
    leaveChat,
    markMessagesAsRead,
    onImageUploadStatus
  } = useSocket((users) => console.log(users), (conversationId) => console.log(conversationId));
  
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!data) return;
  
    const userId = data.other_user.id ;
    const conversationId = data.id;
  
    const fetchMessages = async () => {
      try {
        let url = `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}${API_ENDPOINTS.MESSAGES.MESSAGES.GET_MESSAGES(data.id ?? "")}`;
  
        const response = await axiosInstance.get(url);
        const fetchedMessages = response.data.data.reverse();
        setMessages(fetchedMessages);
        
        await markMessagesAsUnread(data.other_user.id, fetchedMessages, data.id);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
  
    fetchMessages();
    
    if (conversationId) {
      joinChat(conversationId);
      
      if (socket) {
        markMessagesAsRead(conversationId);
        handleMessagesRead(userId);
      }
    }
  
    const cleanup = onNewMessage((message) => {
      if (
        (message.sender_id === userId || message.sender_id === session?.user?.id) &&
        message.conversation_id === data.id
      ) {
        setMessages((prevMessages) => {
          const alreadyExists = prevMessages.some((msg) => msg.id === message.id);
          if (alreadyExists) return prevMessages;
          return [...prevMessages, message];
        });
        
        if (message.sender_id !== session?.user?.id) {
          markMessagesAsRead(data.id);
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
  }, [data?.id, session?.user?.id]);

  const markMessagesAsUnread = async (userId: string, messagesData: Message[], conversationId: string) => {
    try {
      const unreadMessages = messagesData.filter(
        (message) => !message.is_read && message.sender_id === userId
      );
      if (unreadMessages.length > 0) {
        await axiosInstance.post(
          `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}${API_ENDPOINTS.MESSAGES.MESSAGES.UNREAD_MESSAGES}`,
          {
            conversation_id: conversationId,
          }
        );
      }
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  const addEmoji = (emoji: EmojiClickData) => {
    setNewMessage(prevMessage => prevMessage + emoji.emoji);
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
    if ((!newMessage.trim() && !pendingImage) || !data) return;
    
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
            receiver_id: data.other_user.id,
            conversation_id: data.id,
            type: "image",
            file_name: pendingImage.name,
            file_type: pendingImage.type,
          });

          if (success) {
            console.log("Image sent to server for processing");
            setPendingImage(null);
          } else {
            console.error("Failed to send image message");
          }
        } catch (error) {
          console.error("Error sending image:", error);
        }
        setIsUploading(false);
        setPendingImage(null);
      };
      reader.readAsDataURL(pendingImage);
      return;
    }
    
    if (newMessage.trim() !== "") {
      const success = sendMessage({
        content: newMessage.trim(),
        receiver_id: data.other_user.id,
        type: "text" as const,
        conversation_id: data.id,
      });

      if (success) {
        setNewMessage("");
      }
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
            onLoad={scrollToBottom}
          />
        </div>
      );
    }
    return message.content;
  };
  return (
    <div className="chat-box" style={{ right: 370 }}>
      <a href={Href} className="chat-header">
        <div className="name">
          <div
            className="user-img"
            style={{
              // backgroundImage: `url(${data.other_user.avatar ? data.other_user.avatar : `${ImagePath}/user-sm/1.jpg`})`,
            }}
          >
            <span
              className={`available-stats ${
                messages.length > 0 ? "online" : ""
              }`}
            />
          </div>
          <a href={`/profile/timeline/${data.other_user?.username}`} style={{textDecoration: "none", color: "black"}}>{data.other_user?.name}</a>
        </div>
        <div className="menu-option">
          <ul>
            <li onClick={() => setSmallChat(!smallChat)}>
              <img src="../../assets/svg/video.svg" alt="video" />
            </li>
            <li onClick={() => setSmallChat(!smallChat)}>
              <img src="../../assets/svg/phone.svg" alt="phone" />
            </li>
            <li onClick={() => setSmallChat(!smallChat)}>
              <img src="../../assets/svg/settings.svg" alt="settings" />
            </li>
            <li className="close-chat" onClick={() => setChatBox(false)}>
              <img src="../../assets/svg/x.svg" alt="close" />
            </li>
          </ul>
        </div>
      </a>
      <div className={`chat-wrap ${smallChat ? "d-none" : ""}`}>
        <div className="chat-body">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`msg-${message.sender_id === data.other_user.id ? "left" : "right"}`}
            >
              <span>
                {renderMessageContent(message)}
                <div className="timestamp" style={{ fontSize: "10px", marginTop: "5px", color: "#999" }}>
                  {formatTime(message.created_at || "")}
                  {/* {message.sender_id === session?.user?.id && (
                    <>
                      <span className="checkmark-sent-delivered" style={{ marginLeft: "5px", paddingLeft: "5px" }}>✓</span>
                      {message.is_read && <span className="checkmark-read" style={{ marginLeft: "1px", paddingLeft: "5px" }}>✓</span>}
                    </>
                  )} */}
                </div>
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
          <div className="msg_push" />
        </div>
        <div className="chat-footer">
          <div className="emoji-picker-container" style={{ position: "relative" }}>
            <DynamicFeatherIcon
              iconName="Smile"
              className="emoji-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ cursor: "pointer", marginRight: "8px" }}
            />
            {showEmojiPicker && (
              <div style={{ position: "absolute", bottom: "40px", left: "0", zIndex: 999 }}>
                <Picker onEmojiClick={addEmoji} />
              </div>
            )}
          </div>
          
          {pendingImage && (
            <div className="image-preview-wrapper" style={{ position: "relative", marginRight: "10px" }}>
              <img
                src={URL.createObjectURL(pendingImage)}
                alt="preview"
                className="image-preview"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "4px"
                }}
              />
              <button
                className="remove-image-btn"
                onClick={() => setPendingImage(null)}
                aria-label="Remove image"
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "#ff5252",
                  border: "none",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "10px",
                  color: "white"
                }}
              >
                ×
              </button>
            </div>
          )}
          
          <Input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="chat-input form-control emojiPicker"
            disabled={isUploading}
          />
          
          <div className={`add-extent ${showOption ? "show" : ""}`}>
            <DynamicFeatherIcon
              iconName="PlusCircle"
              className="animated-btn"
              onClick={() => setShowOption(!showOption)}
              style={{ cursor: "pointer" }}
            />
            <div className="options">
              <ul>
                <li onClick={handleImageClick} style={{ cursor: "pointer" }}>
                  <img src="../assets/svg/image.svg" alt="image" />
                </li>
                <li>
                  <img src="../assets/svg/paperclip.svg" alt="attachment" />
                </li>
                <li>
                  <img src="../assets/svg/camera.svg" alt="camera" />
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            className={`send-button ${isUploading ? "disabled" : ""}`}
            onClick={handleSendMessage}
            disabled={isUploading}
            style={{
              border: "none",
              background: "transparent",
              cursor: isUploading ? "not-allowed" : "pointer",
              marginLeft: "10px"
            }}
          >
            {isUploading ? (
              <div className="spinner" style={{ width: "20px", height: "20px", border: "2px solid #ccc", borderTopColor: "#333", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            ) : (
              <DynamicFeatherIcon iconName="Send" />
            )}
          </button>
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBoxCommon;