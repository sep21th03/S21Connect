import { Dispatch, SetStateAction } from "react";
interface messengerInterFace {
  receiverMessage?: string;
  senderMessage?: string;
}

export interface SingleUser {
  id: string;
  username: string;
  name?: string;
  // lastMessage?: string;
  count?: number;
  isOnline?: boolean;
  conversation_type: "private" | "group";
  latest_message?: {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender_id: string;
    sender: {
      id: string;
      first_name: string;
      last_name: string;
      username: string;
      last_active?: string;
    };
  };
  unread_count?: number;
  member_count?: number;
  last_active?: string;
}

export interface ChatUsersInterFace {
  userList: SingleUser[] | null;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  activeTab: string | null;
  onlineUsers: string[];
  initialConversationId?: string;
}

export interface ChatContentInterFace {
  activeTab: string | null;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  userList: SingleUser | null;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  onlineUsers: string[];
  initialConversationId?: string;
}

export interface CommonChatBoxInterFace {
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  userList: SingleUser | null;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  onlineUsers: string[];
  initialConversationId?: string;
}

export interface UserChatInterFace {
  setActiveTab?: Dispatch<SetStateAction<string | null>>;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  user: SingleUser | null;
  onlineUsers: string[];
  initialConversationId?: string;
}

export interface ChatHistoryInterFace {
  user: SingleUser | null;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  userId?: string;
  initialConversationId?: string;
}

export interface TempObj {
  receiverMessage: string;
  senderMessage: string;
}
