import { FullUserProfile } from "@/utils/interfaces/user";
import { Dispatch, ReactNode, SetStateAction } from "react";

export interface UserMenuDataInterFace {
  navigate: string;
  icon: "User" | "Settings" | "HelpCircle" | "List";
  heading: string;
  headingDetail: string;
}

export interface SideBarDataInterFace {
  path?: string;
  title?: string;
  tooltipTittle?: string;
  icon: "File" | "Star" | "User" | "Headphones" | "Cloud" | "Calendar";
}

export interface sideBarDataType {
  path: string;
  title?: string;
  tooltipTittle?: string;
  icon: "File" | "Star" | "User" | "Headphones" | "Cloud" | "Calendar";
}
export interface HorizontalSidebarInterFace {
  children?: ReactNode;
  toggleMenu?: boolean;
  toggleSideBar?: () => void;
  loaderName?: string;
}
export interface CommonLayoutProps {
  mainClass?: string;
  children: ReactNode;
  headerClassName?: string;
  sideBarClassName?: string;
  showFullSideBar?: boolean;
  HideConversationPanel?: boolean;
  ConversationPanelClassName?: string;
  loaderName?: string;
  differentLogo?: string;
}

export interface CommonLayoutHeaderInterFace {
  headerClassName: string;
  differentLogo?: string;
}
export interface CommonLayoutSideBarInterFace {
  sideBarClassName: string;
}
export interface FavoriteLayoutProps {
  children: ReactNode;
  FavoriteTabs?: ReactNode;
  loaderName: string;
}

export interface NotificationListsProps {
  setShowNotification: Dispatch<SetStateAction<boolean>>;
  notification: NotificationType[];
}

export interface NotificationType {
  id: string;
  userId: string;
  type: "birthday" | "reaction" | "comment" | "share" | "friend_request";
  content: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  from_user: {
    id: string;
    name: string;
    avatar: string;
  };
  post_id: string;
}

export interface CommonHeaderInterface {
  setIsOpen: (parameter: boolean) => void;
  isOpen: boolean;
  heading: string;
}

export interface DataInterFace {
  target: string;
  imageName: number;
  name: string;
}
export interface CommonPopoverInterFace {
  data: DataInterFace;
}

export interface ThemeSettingsInterFace {
  settingPageOpen?: boolean;
  setSettingPageOpen: (val: boolean) => void;
}

export interface SingleData {
  id: string;
  name: string;
  avatar: string;
  username: string;
}

export interface OnlineUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  socketId?: string;
  lastActive?: Date;
  status: string;
}

export interface ConversationPanelInterFace {
  sidebarClassName: string | undefined;
}
export interface ProfileLayoutInterFace {
  children: ReactNode;
  title?: string;
  profileTab?: boolean;
  loaderName: string;
}

export interface ProfileMenuInterFace {
  title: string;
}

export interface ProfileMenuInterFaceCustom {
  title: string;
  username: string;
}
export interface ModalUserInterFace {
  isOpen: boolean;
  updateBackGround?: boolean;
  toggle: () => void;
  userProfile: FullUserProfile | null;
}
export interface ModalInterFace {
  isOpen: boolean;
  updateBackGround?: (url: string) => void | undefined | null;
  toggle: () => void;
}

export interface UserProfileBoxInterFace {
  toggle: () => void;
  userProfile: FullUserProfile | null;
  isOwnProfile: boolean;
}

export interface UserProfileInterFace {
  toggle: () => void;
  userProfile: FullUserProfile | null;
  isOwnProfile: boolean;
  setFriendshipStatus: (status: string) => void;
  friendshipStatus: string;
}

export interface UserEditInterFace {
  userProfile: FullUserProfile | null;
  onUpdateProfile: (updatedUserProfile: FullUserProfile) => void;
}

export interface TabPaneInterFace {
  handleImageUrl: (val: string, public_id: string) => void;
  userid: string;
}

export interface SinglePhotosInterFace {
  showPhotos: boolean;
  setShowPhotos: (value: boolean) => void;
  handleImageUrl: (value: string, public_id: string) => void;
  userid: string;
}

export interface UserDropDownInterFace {
  dropDownOpen: boolean;
  toggleDropDown: () => void;
  isOwnProfile: boolean;
}

export interface CompanyLayoutInterFace {
  children: ReactNode;
  title: string;
  activeNav?: string;
}

export interface CompanyHomeSectionInterFace {
  title: string;
}

export interface CompanyHeaderInterFace {
  activeNav?: string;
}

export interface LoadingLoaderProps {
  show?: boolean;
}

export interface commonInterFace {
  closeFriendsData: SingleData[];
  recentChats?: boolean;
}

export interface HoverMessageProps {
  imagePath: string;
  name: string;
  target: string;
  placement: "right" | "top";
}
