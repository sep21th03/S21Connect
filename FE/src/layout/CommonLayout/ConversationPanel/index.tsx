import { FC, useState } from "react";
import PanelHeader from "./PanelHeader";
import SearchBar from "./SearchBar";
import FriendsList from "./FriendsList";
import RecentChats from "./RecentChats";
import { ConversationPanelInterFace } from "@/layout/LayoutTypes";

const ConversationPanel: FC<ConversationPanelInterFace> = ({ sidebarClassName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  return (
    <div className={`conversation-panel ${sidebarClassName ? sidebarClassName : "xl-light"}`}>
      <PanelHeader />
      <SearchBar onSearch={handleSearch} />
      <FriendsList searchTerm={searchQuery} />
    </div>
  );
};

export default ConversationPanel;