import { FC } from "react";
import PanelHeader from "./PanelHeader";
import SearchBar from "./SearchBar";
import CloseFriends from "./CloseFriends";
import AllFriends from "./AllFriends";
import RecentChats from "./RecentChats";
import { closeFriendsData, recentChatsData } from "@/Data/Layout";
import { ConversationPanelInterFace } from "@/layout/LayoutTypes";

const ConversationPanel: FC<ConversationPanelInterFace> = ({sidebarClassName}) => {
  return (
    <div className={`conversation-panel ${sidebarClassName?sidebarClassName:"xl-light"}`}>
      <PanelHeader />
      <SearchBar />
      <CloseFriends/>
      <AllFriends/>
    </div>
  );
};

export default ConversationPanel;
