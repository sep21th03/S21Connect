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
import { SharePostMetadata } from "@/components/Messenger/MessengerType";

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

  const [pendingMessages, setPendingMessages] = useState<{ id: string; content: string; type: string; tempUrl?: string }[]>([]);
  
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
  }, [messages, pendingMessages]);
  
  useEffect(() => {
    if (!data) return;
  
    const userId = data.other_user.id;
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
      console.log("message", message);
      if (
        (message.sender_id === userId || message.sender_id === session?.user?.id) &&
        message.conversation_id === data.id
      ) {
        setMessages((prevMessages) => {
          const alreadyExists = prevMessages.some((msg) => msg.id === message.id);
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
          markMessagesAsRead(data.id);
        }
      }
    });
    
    const uploadStatusCleanup = onImageUploadStatus(
      (status: { status: string; url?: string; message?: string }) => {
        if (status.status === "success" && status.url) {
          setIsUploading(false);
          
     
          setPendingMessages(prev => prev.map(msg => {
            if (msg.type === "image" && msg.tempUrl) {
              return { ...msg, content: status.url || "" };
            }
            return msg;
          }));
        } else if (status.status === "error") {
          console.error("Image upload failed:", status.message);
          setIsUploading(false);
          

          setPendingMessages(prev => prev.filter(msg => msg.type !== "image"));
          
          toast.error("Không thể tải ảnh lên: " + status.message);
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
        toast.error("Ảnh phải nhỏ hơn 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }

      setPendingImage(file);
    }
  };
  
  const handleSendMessage = () => {
    if ((!newMessage.trim() && !pendingImage) || !data) return;
    
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (pendingImage) {
      setIsUploading(true);
      
      const tempUrl = URL.createObjectURL(pendingImage);
      
      setPendingMessages(prev => [...prev, {
        id: tempId,
        content: tempUrl,
        type: "image",
        tempUrl: tempUrl
      }]);
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Data = reader.result?.toString().split(",")[1];
          if (!base64Data) {
            console.error("Failed to convert image to base64");
            setIsUploading(false);
            
            setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
            return;
          }
          
          const success = sendMessage({
            content: base64Data || "",
            receiver_id: data.other_user.id,
            conversation_id: data.id,
            type: "image",
            file_name: pendingImage.name,
            file_type: pendingImage.type,
            client_temp_id: tempId
          });

          if (!success) {
            console.error("Failed to send image message");
            setIsUploading(false);
            

            setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
            toast.error("Không thể gửi ảnh, vui lòng thử lại");
          }
        } catch (error) {
          console.error("Error sending image:", error);
          setIsUploading(false);
          
  
          setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
          toast.error("Đã xảy ra lỗi khi gửi ảnh");
        }
        setPendingImage(null);
      };
      reader.readAsDataURL(pendingImage);
      return;
    }
    
    if (newMessage.trim() !== "") {
   
      setPendingMessages(prev => [...prev, {
        id: tempId,
        content: newMessage.trim(),
        type: "text"
      }]);
      
      const success = sendMessage({
        content: newMessage.trim(),
        receiver_id: data.other_user.id,
        type: "text" as const,
        conversation_id: data.id,
        client_temp_id: tempId
      });

      if (success) {
        setNewMessage("");
      } else {

        setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
        toast.error("Không thể gửi tin nhắn, vui lòng thử lại");
      }
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
            onLoad={scrollToBottom}
          />
        </div>
      );
    }
    return message.content;
  };
  
  const renderPendingMessage = (message: { id: string; content: string; type: string; tempUrl?: string }) => {
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
                opacity: "0.7" 
              }}
            />
            {isUploading && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }}>
                <div className="spinner" style={{ 
                  width: "20px", 
                  height: "20px", 
                  border: "2px solid #ccc", 
                  borderTopColor: "#333", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }} />
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
                </div>
              </span>
            </div>
          ))}

          {pendingMessages.map((message, index) => (
            <div
              key={`pending-${message.id}`}
              className="msg-right pending-message"
            >
              <span>
                {renderPendingMessage(message)}
                <div className="timestamp" style={{ 
                  fontSize: "10px", 
                  marginTop: "5px", 
                  color: "#999", 
                  fontStyle: "italic" 
                }}>
                  Đang gửi...
                </div>
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
          <div className="msg_push" />
        </div>
        <div className="chat-footer">
          <div className="emoji-picker-container" style={{ position: "relative", marginLeft: "8px" }}>
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
            placeholder="Nhập tin nhắn..."
            className="chat-input form-control emojiPicker"
            disabled={isUploading}
          />
          
          <div className={`add-extent ${showOption ? "show" : ""}`} style={{ marginRight: "0px" }}>
            <DynamicFeatherIcon
              iconName="PlusCircle"
              className="animated-btn"
              onClick={() => setShowOption(!showOption)}
              style={{ cursor: "pointer" }}
            />
            <div className="options" style={{ right: "30px" }}>
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
        
        .pending-message {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default ChatBoxCommon;