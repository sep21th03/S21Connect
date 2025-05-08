import { ChangeEvent, FC, Fragment, useEffect, useState, useRef } from "react";
import { ChatHistoryInterFace, SingleUser } from "../MessengerType";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import HideOption from "./HideOption";
import { Href } from "../../../utils/constant/index";
import Picker, { EmojiClickData } from "emoji-picker-react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { Message, useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import { formatTime } from "@/utils/index";

const ChatHistory: FC<ChatHistoryInterFace> = ({
  user,
  setUserList,
}) => {
  const [showButton, setShowButton] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socketRef, joinChat, sendMessage, onNewMessage, leaveChat } =
    useSocket((users) => console.log(users));
  const { data: session } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const markMessagesAsRead = async (userId: string, messages: Message[]) => {
    try {
      const unreadMessages = messages.filter(
        (message) => !message.is_read && message.receiver_id === userId
      );
      if (unreadMessages.length > 0) {
        await axiosInstance.post(
          `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}${API_ENDPOINTS.MESSAGES.MESSAGES.UNREAD_MESSAGES}`,
          {
            receiver_id: userId,
          }
        );


        setUserList(
          (prevUsers: SingleUser[] | null) =>
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
      const userId = user.id;

      const fetchMessages = async (userId?: string, groupId?: string) => {
        try {
          let url = `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}/conversation`;

          const params: { [key: string]: string } = {};
          if (userId) {
            params.with_user_id = userId;
          }
          if (groupId) {
            params.group_id = groupId;
          }

          const response = await axiosInstance.get(url, { params });
          setMessages(response.data.data.reverse());

          if (userId) {
            await markMessagesAsRead(userId, messages);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMessages(userId);

      joinChat({ user_id: userId });

      const cleanup = onNewMessage((message) => {
        if (
          (message.receiver_id === userId &&
            message.sender_id === session?.user?.id) ||
          (message.sender_id === userId &&
            message.receiver_id === session?.user?.id)
        ) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      return () => {
        cleanup?.();
        leaveChat({ user_id: userId });
      };
    } else {
      setIsLoading(false);
    }
  }, [user, session?.user?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const addEmoji = (emoji: EmojiClickData) => {
    setNewMessage(newMessage + emoji.emoji);
  };

  const handleUpdateButton = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    if (user) {
      const success = sendMessage({
        content: newMessage,
        receiver_id: user.id,
        type: "text",
      });

      if (success) {
        setNewMessage("");
      }
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
                      {data.content}
                      <div className="timestamp">
                        {formatTime(data.created_at)}
                      </div>
                      <div className="checkmark-sent-delivered">✓</div>
                      <div className="checkmark-read">✓</div>
                    </div>
                  ) : (
                    <div className="message new">
                      {data.content}
                      <div className="timestamp">
                        {formatTime(data.created_at)}
                      </div>
                      <div className="checkmark-sent-delivered">✓</div>
                      <div className="checkmark-read">✓</div>
                    </div>
                  )}
                </Fragment>
              ))}
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
            />
            <div className={`add-extent ${showButton ? "show" : ""}`}>
              <DynamicFeatherIcon
                className="animated-btn"
                iconName="Plus"
                onClick={() => setShowButton(!showButton)}
              />
              <HideOption />
            </div>
            <a href="#" className="message-submit" onClick={handleSendMessage}>
              <DynamicFeatherIcon iconName="Send" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
