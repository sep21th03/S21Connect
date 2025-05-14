import { Post } from "@/components/NewsFeed/Style1/Style1Types";
import * as Icon from "react-feather";

export interface FeatherIconType {
  iconName: keyof typeof Icon;
  className?: string;
  onClick?: () => void;
}

export interface SvgIconCommonInterFace {
  className?: string;
  useClassName?:string
  iconName: String;
}

export interface StoriesModalProps {
  showModal: boolean;
  toggle: () => void;
}

export interface CreatePostHeaderInterFace {
  writePost: boolean;
  setShowPostButton: (val: boolean) => void;
  postDropDown: boolean;
  setPostDropDown: (val: boolean) => void;
  selectedOption: string;
  setSelectedOption: (val: string) => void;
  postContent: string;
  setPostContent: (val: string) => void;
}

export interface CommonUserHeadingProps {
  id:string
  postUser: any
  onPostUpdated: (updatedPost: Post) => void;
  onPostDeleted: () => void;
}

export interface DetailBoxProps {
  heading: string;
  span: string;
  post: Post
}

export interface CommentSectionInterFace {
  showComment: boolean;
  postId: number;
  onCommentAdded?: () => void;
}

export interface userDropDownDataInterFace {
  icon: "Globe" | "Users" | "User" | "Lock";
  detail: string;
}

export interface CreatePostInterface {
  icon: "Globe" | "Users" | "User" | "Lock";
  name: string;
  slug: string;
}

export interface ShareModalProps {
  showModal: boolean;
  toggleModal: () => void;
  post: Post;
}

export interface CommonGalleryModalInterFace {
  modal?: boolean;
  toggle: () => void;
}

export interface CommonVideoModalInterFace {
  modal: boolean;
  toggle: () => void;
}

export interface OptionsInputsInterFace {
  OptionsInput: string;
  setOptionInput: (data: string) => void;
  listFriends: any[];
  setSelectedFeeling: (data: string) => void;
  setSelectedPlace: (data: any) => void;
  setTaggedFriends: (data: string[]) => void;
  tagInput: string;
  setTagInput: (data: string) => void;
}
export interface MainCommentProps {
  comment: Comment;
  like?: number;
  id:string
  onReply: (commentId: number, content: string) => void;
  onDelete: () => void;
  onReplyClick: (username: string, commentId: number) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  isReplying: boolean;
  toggleReply: () => void;
  setIsReplying: (value: boolean) => void;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  parent_id: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string;
    username: string;
  };
}



export interface SubCommentProps {
  image: number;
  id:string
  comment: Comment
  onDelete: () => void;
  onReplyClick: (name: string, commentId: number) => void;
  isReplying: boolean;
  toggleReply: () => void;
  setIsReplying: (value: boolean) => void;
}

export interface GalleryModalInterFace {
  title: string;
  icon: "Bookmark" | "Edit" | "XSquare";
}

export interface galleryDropDownsInterFace {
  icon: "Trash2" | "Download" | "Image";
  title: string;
}
export interface CoverInterFace {
  image: number;
  title: string;
  detail: string;
  backGround?: boolean;
}

export interface menuList {
  icon: "Edit"| "Settings"| "Play"| "Heart"| "User"| "Search"| "Bookmark"| "XSquare"| "XOctagon" |"MessageSquare";
  title: string;
}
export interface CommonDropDownInterFace {
  mainIcon: "Sun" | "MoreHorizontal";
  mainClassName: string;
  menuList: menuList[];
}
export interface AlbumInterFace {
  showPhotos: boolean;
  lg?:number
  xl?:number
  setShowPhotos: (value: boolean) => void;
  userid: string;
}

export interface DetailGalleryInterFace {
  showPhotos: boolean;
  setShowPhotos: (value: boolean) => void;
}
