"use client";
import { SingleUser } from "@/components/Messenger/MessengerType";
import { createContext, useContext, ReactNode } from "react";

interface MessengerContextType {
  userList: SingleUser[] | null;
  setUserList: React.Dispatch<React.SetStateAction<SingleUser[] | null>>;
  activeTab: string | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  onlineUsers: string[];
}

const initialContext: MessengerContextType = {
  userList: null,
  setUserList: () => {},
  activeTab: null,
  setActiveTab: () => {},
  onlineUsers: [],
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