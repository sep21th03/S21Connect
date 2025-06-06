import { Message, RecentMessage } from "@/hooks/useSocket";
import { Dispatch, SetStateAction } from "react";


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
  userList: RecentMessage[] | null;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  activeTab: string | null;
  onlineUsers: string[];
  initialConversationId?: string;
}

export interface ChatContentInterFace {
  activeTab: string | null;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  userList: RecentMessage | null;
  setUserList: Dispatch<SetStateAction<RecentMessage[] | null>>;
  onlineUsers: string[];
  initialConversationId?: string;
}

export interface CommonChatBoxInterFace {
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  userList: RecentMessage | null;
  setUserList: Dispatch<SetStateAction<RecentMessage[] | null>>;
  onlineUsers: string[];
  initialConversationId?: string;
  messages?: Message[];
}

export interface UserChatInterFace {
  setActiveTab?: Dispatch<SetStateAction<string | null>>;
  setUserList: Dispatch<SetStateAction<RecentMessage[] | null>>;
  user: RecentMessage | null;
  onlineUsers: string[];
  initialConversationId?: string;
  messagesOffset?: number;
  showUserInfo: boolean;
  setShowUserInfo: Dispatch<SetStateAction<boolean>>;
  groupMembers: GroupMember;
}

export interface GroupMember {
  conversation_id: string;
  member_count: number;
  conversation_name: string;
  conversation_avatar: string;
  members: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    nickname: string;
    last_active: string;
  }[];
}

export interface ChatHistoryInterFace {
  user: RecentMessage | null;
  setUserList: Dispatch<SetStateAction<RecentMessage[] | null>>;
  userId?: string;
  initialConversationId?: string;
}

export interface TempObj {
  receiverMessage: string;
  senderMessage: string;
}

export interface SharePostMetadata {
  post_id: number;
  image: string;
  url: string;
  content: string;
}