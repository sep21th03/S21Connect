import { Dispatch, SetStateAction } from "react";
interface messengerInterFace {
  receiverMessage?: string;
  senderMessage?: string;
}

export interface SingleUser {
  id: string;
  username: string;
  name?: string;
  lastMessage?: string;
  count?: number;
  isOnline?: boolean;
  conversation_type: "private" | "group";
  latest_Messenger?: {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender_id: string;
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
}

export interface ChatContentInterFace {
  activeTab: string | null;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  userList: SingleUser | null;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  onlineUsers: string[];
}

export interface CommonChatBoxInterFace {
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  userList: SingleUser | null;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  onlineUsers: string[];
}

export interface UserChatInterFace {
  setActiveTab?: Dispatch<SetStateAction<string | null>>;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
  user: SingleUser | null;
  onlineUsers: string[];
}

export interface ChatHistoryInterFace {
  user: SingleUser | null;
  setUserList: Dispatch<SetStateAction<SingleUser[] | null>>;
}

export interface TempObj {
  receiverMessage: string;
  senderMessage: string;
}
