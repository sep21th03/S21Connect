// components/GroupChatModal.tsx
import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
  } from "react";
  import { useSelector, useDispatch } from "react-redux";
  import { Modal, ModalHeader, ModalBody, Input } from "reactstrap";
  import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
  import { useSession } from "next-auth/react";
  import {
    closeModal,
    toggleFriendsList,
    addFriend,
    removeFriend,
    setSearchTerm,
    setGroupName,
  } from "@/redux-toolkit/slice/groupChatSlice";
  import { RootState } from "@/redux-toolkit/rootReducer";
  import { getListFriends } from "@/service/userSerivice";
  import { sendMessage } from "@/service/messageService";
  import { useQuery, useMutation } from "@tanstack/react-query";
  import Picker from "emoji-picker-react";
  import { toast } from "react-toastify";
  
  interface Friend {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
  }
  
  interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    type: "text" | "image";
    tempUrl?: string;
  }
  
  interface SendMessagePayload {
    content?: string;
    user_ids?: string[];
    group_name?: string;
    group_avatar?: string;
    type?: string;
    file_paths?: string[];
    metadata?: any;
    conversation_id?: string | null;
  }
  
  const GroupChatModal: React.FC = () => {
    const dispatch = useDispatch();
    const { data: session } = useSession();
    const {
      isModalOpen,
      selectedFriends,
      showFriendsList,
      searchTerm,
      groupName,
    } = useSelector((state: RootState) => state.groupChat);
  
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [conversationStarted, setConversationStarted] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const { data: friends } = useQuery({
      queryKey: ["friends"],
      queryFn: () => getListFriends(session?.user?.id || ""),
      enabled: !!session?.user?.id,
    });
  
    const sendMessageMutation = useMutation({
      mutationFn: sendMessage,
      onSuccess: (data) => {
        setConversationId(data.conversation_id);
        
        const serverMessage: Message = {
          id: data.id,
          content: data.content || "",
          sender_id: data.sender_id,
          created_at: data.created_at,
          type: data.type,
          tempUrl: data.url,
        };
  
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.id.startsWith('temp_'));
          return [...filteredMessages, serverMessage];
        });
  
        if (!conversationStarted) {
          setConversationStarted(true);
          toast.success("Nhóm đã được tạo thành công!");
        }
      },
      onError: (error: any) => {
        console.error("Error sending message:", error);
        toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
        
        setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });
  
    const filteredFriends = useMemo(() => {
      if (!friends) return [];
      return friends.filter((friend: Friend) => {
        const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
    }, [searchTerm, friends]);
  
    const scrollToBottom = useCallback(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, []);
  
    useEffect(() => {
      if (messages.length > 0) {
        scrollToBottom();
      }
    }, [messages, scrollToBottom]);
  
    const handleCloseModal = () => {
      dispatch(closeModal());
      setMessages([]);
      setNewMessage("");
      setConversationStarted(false);
      setPendingImages([]);
      setShowEmojiPicker(false);
      setConversationId(null);
      setIsLoading(false);
    };
  
    const handleFriendSelect = (friend: Friend) => {
      if (selectedFriends.find((f) => f.id === friend.id)) {
        dispatch(removeFriend(friend.id));
      } else {
        dispatch(addFriend(friend));
      }
    };
  
    const uploadImages = async (files: File[]): Promise<string[]> => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
  
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return result.file_paths || [];
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    };
  
    const handleSendMessage = async () => {
      if (!newMessage.trim() && pendingImages.length === 0) return;
      if (selectedFriends.length === 0 && !conversationId) {
        toast.error("Vui lòng chọn ít nhất một bạn bè để tạo nhóm!");
        return;
      }
  
      setIsLoading(true);
  
      try {
        const tempMessages: Message[] = [];
        
        if (newMessage.trim()) {
          const tempId = `temp_${Date.now()}`;
          tempMessages.push({
            id: tempId,
            content: newMessage,
            sender_id: session?.user?.id || "",
            created_at: new Date().toISOString(),
            type: "text",
          });
        }
  
        pendingImages.forEach((image, index) => {
          const tempId = `temp_${Date.now() + index}`;
          tempMessages.push({
            id: tempId,
            content: "",
            sender_id: session?.user?.id || "",
            created_at: new Date().toISOString(),
            type: "image",
            tempUrl: URL.createObjectURL(image),
          });
        });
  
        setMessages((prev) => [...prev, ...tempMessages]);
  
        const payload: SendMessagePayload = {
          type: pendingImages.length > 0 ? "image" : "text",
          metadata: {},
          // conversation_id: conversationId,
        };
  
        // if (conversationId) {
        //   payload.conversation_id = conversationId;
        // } else {
          payload.user_ids = selectedFriends.map(friend => friend.id);
          
          const defaultGroupName = selectedFriends
            .map((friend: Friend) => `${friend.first_name} ${friend.last_name}`)
            .join(", ");
          
          payload.group_name = groupName.trim() || defaultGroupName;
        // }
  
        if (newMessage.trim()) {
          payload.content = newMessage;
        }
  
        if (pendingImages.length > 0) {
          try {
            const uploadedPaths = await uploadImages(pendingImages);
            payload.file_paths = uploadedPaths;
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
            setIsLoading(false);
            return;
          }
        }
  
        await sendMessageMutation.mutateAsync(payload);
  
        setNewMessage("");
        setPendingImages([]);
        setShowEmojiPicker(false);
  
      } catch (error) {
        console.error("Error in handleSendMessage:", error);
      }
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const validFiles: File[] = Array.from(files).filter((file) => {
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`Tệp ${file.name} vượt quá kích thước 5MB`);
            return false;
          }
          if (!file.type.startsWith("image/")) {
            toast.error(`Tệp ${file.name} không phải là ảnh`);
            return false;
          }
          return true;
        });
  
        setPendingImages((prev) => [...prev, ...validFiles]);
      }
    };
  
    const removeImage = (index: number) => {
      setPendingImages((prev) => prev.filter((_, i) => i !== index));
    };
  
    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
  
    const addEmoji = (emojiObject: { emoji: string }) => {
      setNewMessage((prev) => prev + emojiObject.emoji);
      setShowEmojiPicker(false);
    };
  
    const canSendMessage = () => {
      return (newMessage.trim() || pendingImages.length > 0) && 
             (selectedFriends.length > 0 || conversationId) && 
             !isLoading;
    };
  
    return (
      <Modal
        isOpen={isModalOpen}
        toggle={handleCloseModal}
        size="lg"
        className="group-chat-modal"
      >
        <ModalHeader toggle={handleCloseModal}>
          <div className="group-header-container">
            <div
              className="group-name-input-container"
              onClick={() =>
                !conversationStarted && dispatch(toggleFriendsList())
              }
              style={{ cursor: conversationStarted ? "default" : "pointer" }}
            >
              {selectedFriends.length > 0 ? (
                <div className="selected-friends-display">
                  <div className="selected-friends-avatars">
                    {selectedFriends.slice(0, 3).map((friend: Friend) => (
                      <div key={friend.id} className="friend-avatar-small">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.username} />
                        ) : (
                          <div className="avatar-placeholder">{`${friend.first_name?.charAt(
                            0
                          )}${friend.last_name?.charAt(0)}`}</div>
                        )}
                      </div>
                    ))}
                    {selectedFriends.length > 3 && (
                      <span className="more-count">
                        +{selectedFriends.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="selected-friends-names">
                    {groupName || selectedFriends
                      .map(
                        (friend: Friend) =>
                          `${friend.first_name} ${friend.last_name}`
                      )
                      .join(", ")}
                  </div>
                </div>
              ) : (
                <Input
                  type="text"
                  placeholder="Nhập tên nhóm hoặc chọn bạn bè..."
                  value={groupName}
                  onChange={(e) => dispatch(setGroupName(e.target.value))}
                  readOnly={conversationStarted}
                />
              )}
            </div>
          </div>
        </ModalHeader>
  
        <ModalBody className="p-0">
          {showFriendsList && !conversationStarted && (
            <div className="friends-list-container">
              <div className="search-friends">
                <Input
                  type="text"
                  placeholder="Tìm bạn bè..."
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                />
              </div>
  
              <div className="friends-list">
                {filteredFriends.map((friend: Friend) => (
                  <div
                    key={friend.id}
                    className={`friend-item ${
                      selectedFriends.find((f) => f.id === friend.id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleFriendSelect(friend)}
                  >
                    <div className="friend-avatar">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} />
                      ) : (
                        <div className="avatar-placeholder">{`${friend.first_name?.charAt(
                          0
                        )}${friend.last_name?.charAt(0)}`}</div>
                      )}
                      {friend.isOnline && (
                        <div className="online-indicator"></div>
                      )}
                    </div>
                    <div className="friend-info">
                      <span className="friend-name">{`${friend.first_name} ${friend.last_name}`}</span>
                      <span className="friend-status">
                        {friend.isOnline ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                    <div className="selection-indicator">
                      {selectedFriends.find((f) => f.id === friend.id) && (
                        <DynamicFeatherIcon
                          iconName="Check"
                          className="check-icon"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          <div className="chat-container">
            <div
              className="messages-content theme-scrollbar"
              ref={messagesContainerRef}
              style={{
                height: "300px",
                overflowY: "auto",
                padding: "10px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                margin: "10px",
              }}
            >
              {messages.length === 0 ? (
                <div className="no-messages">
                  <div className="welcome-message">
                    <DynamicFeatherIcon
                      iconName="MessageCircle"
                      className="welcome-icon"
                    />
                    <p>Bắt đầu cuộc trò chuyện nhóm của bạn!</p>
                    <small>
                      {selectedFriends.length === 0 
                        ? "Chọn bạn bè và gửi tin nhắn đầu tiên để tạo nhóm"
                        : "Gửi tin nhắn đầu tiên để tạo nhóm"
                      }
                    </small>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.sender_id === session?.user?.id
                        ? "message-personal"
                        : ""
                    } ${message.id.startsWith('temp_') ? "message-sending" : ""}`}
                  >
                    {message.type === "image" ? (
                      <div className="image-message">
                        <img
                          src={message.tempUrl}
                          alt="Sent image"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        {message.id.startsWith('temp_') && (
                          <div className="sending-indicator">
                            <DynamicFeatherIcon iconName="Clock" className="sending-icon" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-message" style={{display: "flex", flexDirection: "column-reverse"}}>
                        <span>{message.content}</span>
                        {message.id.startsWith('temp_') && (
                          <DynamicFeatherIcon iconName="Clock" className="sending-icon" />
                        )}
                      </div>
                    )}
                    <div className="timestamp">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
  
            <div
              className="message-box"
              style={{
                margin: "10px",
                padding: "10px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              {showEmojiPicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "10px",
                    zIndex: 1000,
                  }}
                >
                  <Picker onEmojiClick={addEmoji} />
                </div>
              )}
  
              <textarea
                className="message-input"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  minHeight: "40px",
                  paddingRight: "140px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              />
  
              {pendingImages.length > 0 && (
                <div
                  className="image-preview-wrapper"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {pendingImages.map((image, index) => (
                    <div
                      key={index}
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`preview-${index}`}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          background: "#ff4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          opacity: isLoading ? 0.7 : 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
  
              <div
                className="message-actions"
                style={{ display: "flex", gap: "10px", marginTop: "10px" }}
              >
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    padding: "5px",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  <DynamicFeatherIcon iconName="Smile" className="icon" />
                </button>
  
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    padding: "5px",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  <DynamicFeatherIcon iconName="Image" className="icon" />
                </button>
  
                <button
                  onClick={handleSendMessage}
                  disabled={!canSendMessage()}
                  style={{
                    background: canSendMessage() ? "#007bff" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    cursor: canSendMessage() ? "pointer" : "not-allowed",
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {isLoading ? (
                    <>
                      <DynamicFeatherIcon iconName="Loader" className="spinning" />
                      Đang gửi...
                    </>
                  ) : (
                    <DynamicFeatherIcon iconName="Send" />
                  )}
                </button>
              </div>
            </div>
          </div>
  
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </ModalBody>
  
        <style jsx>{`
          .group-header-container {
            width: 100%;
          }
  
          .group-name-input-container {
            width: 100%;
            min-height: 40px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
          }
  
          .selected-friends-display {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
          }
  
          .selected-friends-avatars {
            display: flex;
            gap: 5px;
          }
  
          .friend-avatar-small {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
          }
  
          .friend-avatar-small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
  
          .avatar-placeholder {
            background: #007bff;
            color: white;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
  
          .more-count {
            font-size: 12px;
            color: #666;
            font-weight: bold;
          }
  
          .selected-friends-names {
            font-size: 14px;
            color: #333;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
  
          .friends-list-container {
            max-height: 200px;
            overflow-y: auto;
            border-bottom: 1px solid #eee;
          }
  
          .search-friends {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
  
          .friends-list {
            padding: 10px 0;
          }
  
          .friend-item {
            display: flex;
            align-items: center;
            padding: 8px 15px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
  
          .friend-item:hover {
            background-color: #f5f5f5;
          }
  
          .friend-item.selected {
            background-color: #e3f2fd;
          }
  
          .friend-avatar {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
          }
  
          .friend-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
  
          .online-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 10px;
            height: 10px;
            background: #4caf50;
            border: 2px solid white;
            border-radius: 50%;
          }
  
          .friend-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
  
          .friend-name {
            font-weight: 500;
            font-size: 14px;
            color: #333;
          }
  
          .friend-status {
            font-size: 12px;
            color: #666;
          }
  
          .selection-indicator {
            width: 20px;
            display: flex;
            justify-content: center;
          }
  
          .check-icon {
            color: #007bff;
            width: 16px;
            height: 16px;
          }
  
          .no-messages {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
          }
  
          .welcome-message {
            color: #666;
          }
  
          .welcome-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 10px;
            color: #ccc;
          }
  
          .message {
            margin-bottom: 15px;
            padding: 8px 12px;
            border-radius: 18px;
            max-width: 70%;
            position: relative;
          }
  
          .message-personal {
            background: #007bff;
            color: white;
            margin-left: auto;
            text-align: right;
          }
  
          .message:not(.message-personal) {
            background: #f1f1f1;
            color: #333;
          }
  
          .message-sending {
            opacity: 0.7;
          }
  
          .timestamp {
            font-size: 10px;
            opacity: 0.7;
            margin-top: 4px;
          }
  
          .text-message, .image-message {
            display: flex;
            align-items: center;
            gap: 5px;
          }
  
          .sending-icon {
            width: 12px;
            height: 12px;
            opacity: 0.7;
          }
  
          .sending-indicator {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: 2px;
          }
  
          .spinning {
            animation: spin 1s linear infinite;
          }
  
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Modal>
    );
  };
  
  export default GroupChatModal;