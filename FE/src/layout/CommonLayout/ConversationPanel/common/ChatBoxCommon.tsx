import { useState, useEffect } from "react";
import { Href, ImagePath } from "../../../../utils/constant/index";
import { FC } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Input } from "reactstrap";
import { SingleData } from "@/layout/LayoutTypes";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";
import { Message, useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import { useRef } from "react";

interface ChatBoxCommonInterFace {
  setChatBox: (value: boolean) => void;
  data: SingleData;
}

const ChatBoxCommon: FC<ChatBoxCommonInterFace> = ({ setChatBox, data }) => {
  const [showOption, setShowOption] = useState(false);
  const [smallChat, setSmallChat] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any>(data);
  const { sendMessage, onNewMessage } =
    useSocket((users) => console.log(users));
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (!data) return;
  
    const userId = data.id; 
  
    const fetchMessages = async () => {
      try {
        let url = `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}/conversation`;
  
        const params: { [key: string]: string } = {};
        if (userId) {
          params.with_user_id = userId;
        }
  
        const response = await axiosInstance.get(url, { params });
        setMessages(response.data.data.reverse());
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
  
    fetchMessages();
  
    const cleanup = onNewMessage((message) => {
      if (
        (message.receiver_id === userId && message.sender_id === session?.user?.id) ||
        (message.sender_id === userId && message.receiver_id === session?.user?.id)
      ) {
        setMessages((prevMessages: Message[]) => [...prevMessages, message]);
      }
    });
  
    return () => {
      cleanup?.();
    };
  }, [data?.id, session?.user?.id]); 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (newMessage.trim() !== "") {
        if (!user) return;

        const messageToSend = {
          content: newMessage.trim(),
          receiver_id: user.id,
          type: "text" as const,
        };

        sendMessage(messageToSend);
        setNewMessage("");
      }
    }
  };

  return (
    <div className="chat-box" style={{ right: 370 }}>
      <a href={Href} className="chat-header">
        <div className="name">
          <div
            className="user-img"
            style={{
              backgroundImage: `url(${data.image ? data.image : `${ImagePath}/user-sm/1.jpg`})`,
            }}
          >
            <span
              className={`available-stats ${
                messages.length > 0 ? "online" : ""
              }`}
            />
          </div>
          <span>{data.name}</span>
        </div>
        <div className="menu-option">
          <ul>
            <li onClick={() => setSmallChat(!smallChat)}>
              <img src="../assets/svg/video.svg" alt="video" />
            </li>
            <li onClick={() => setSmallChat(!smallChat)}>
              <img src="../assets/svg/phone.svg" alt="phone" />
            </li>
            <li onClick={() => setSmallChat(!smallChat)}>
              <img src="../assets/svg/settings.svg" alt="settings" />
            </li>
            <li className="close-chat" onClick={() => setChatBox(false)}>
              <img src="../assets/svg/x.svg" alt="close" />
            </li>
          </ul>
        </div>
      </a>
      <div className={`chat-wrap ${smallChat ? "d-none" : ""}`}>
        <div className="chat-body">
          {messages.map((text, index) => (
            <div
              key={index}
              className={`msg-${text.sender_id === user.id ? "left" : "right"}`}
            >
              <span>{text.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
          <div className="msg_push" />
        </div>
        <div className="chat-footer">
          <Input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="type your message here.."
            className="chat-input form-control emojiPicker"
          />
          <div className={`add-extent ${showOption ? "show" : ""}`}>
            <DynamicFeatherIcon
              iconName="PlusCircle"
              className="animated-btn"
              onClick={() => setShowOption(!showOption)}
            />
            <div className="options">
              <ul>
                <li>
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
        </div>
      </div>
    </div>
  );
};

export default ChatBoxCommon;
