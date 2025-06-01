"use client";
import { RecentMessage } from "@/hooks/useSocket";
import { createContext, useContext, ReactNode } from "react";

interface MessengerContextType {
  userList: RecentMessage[] | null;
  setUserList: React.Dispatch<React.SetStateAction<RecentMessage[] | null>>;
  activeTab: string | null | undefined;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  onlineUsers: string[];
  showArchived: boolean;
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialContext: MessengerContextType = {
  userList: null,
  setUserList: () => {},
  activeTab: null,
  setActiveTab: () => {},
  onlineUsers: [],
  showArchived: false,
  setShowArchived: () => {},
};

const MessengerContext = createContext<MessengerContextType>(initialContext);

export const useMessengerContext = () => useContext(MessengerContext);

interface MessengerContextProviderProps {
  children: ReactNode;
  value: MessengerContextType;
}

export const MessengerContextProvider: React.FC<MessengerContextProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <MessengerContext.Provider value={value}>
      {children}
    </MessengerContext.Provider>
  );
};