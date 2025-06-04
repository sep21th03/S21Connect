export interface OverlayNames {
  color?: string;
  image: number;
}

export interface ShowFriendMenuInterFace {
  icon: "User" | "Search" | "Settings";
  detail: string;
}

export interface DropDownProps {
  darkIcon?: boolean;
}

export interface LikePageInterFace {
  tittle: string;
  type: string;
  member: number;
  active: boolean;
}

export interface Reason {
  reason_code: string;
  reason_text: string;
}

export interface postDropDownOptionInterface {
  iconName: "Bookmark" | "XSquare" | "X" | "Edit" | "AlertCircle";
  post: string;
  onClick?: (postUser: Post) => void;
}

export interface SufiyaElizaThirdPostInterface {
  fourthPost?: number;
  post: Post
  shouldOpenComments: boolean;
  highlightCommentId: number | null;
  highlightReplyId: number | null;
  isShared: boolean;
}

export interface CommonGalleryImageProps {
  imageUrl: string;
  onClickHandle: () => void;
}

export interface SufiyaElizaFirstPostInterFace {
  className?:string
  post: Post
  shouldOpenComments: boolean;
  highlightCommentId: number | null;
  highlightReplyId: number | null;
  isShared: boolean;
}

export interface PostDetailInterFace {
  post: Post
  localPost: Post
  setLocalPost: (post: Post) => void
  shouldOpenComments: boolean;
  highlightCommentId: number | null;
  highlightReplyId: number | null;
  isShared: boolean;
}


export interface SufiyaElizaSecondPostInterFace {
  post: Post
  shouldOpenComments: boolean;
  highlightCommentId: number | null;
  highlightReplyId: number | null;
  isShared: boolean;
}

export interface EventsCardInterFace{
  eventImage:number
  diffrentPath?:string
}

export interface BirthdayReminderInterFace  {
  mainClass?:string
  userInforBirthday?: UserInforBirthday
}

export interface UserInforBirthday {
  id: number;
  username: string;
  avatar: string;
  first_name: string;
  last_name: string;
}

export interface SufiyaElizaMultiplePostInterFace {
  post: Post
  shouldOpenComments: boolean;
  highlightCommentId: number | null;
  highlightReplyId: number | null;
  isShared: boolean;
}

export interface PostImagesInterFace {
  post: Post
  onReactionChange: (data: ReactionResponse) => void
}

export  interface SidebarPanelInterFace {
  showSideBar: boolean;
  ref:React.RefObject<HTMLDivElement>;
}

export interface SufiyaElizaTwoPhotoPostInterFace {
  diffrentImage?:boolean
}

export interface FriendSuggestionInterFace {
  mainClassName?:string
  setIsFriendSection?: (isFriendSection: boolean) => void
}
export interface StorySectionProps {
  storyShow?:number 
}

export interface ReactionResponse {
  reactions: ReactionData[];
  total_count: number;
  user_reaction: string | null;
  reaction_counts: {
    [key: string]: number;
  };
}

export interface ReactionData {
  type: string;
  count: number;
}

export interface Post {
  id: number;
  content: string;
  type: "first" | "second" | "third" | "multiple";
  post_format: "normal" | "shared" | "ads";
  original_post_id: number;
  shared_post: Post;
  user: {
    id: number;
    username: string;
    avatar: string;
    first_name: string;
    last_name: string;
  };
  images?: string[];
  videos?: string[];
  created_at: string;
  updated_at: string;
  bg_id: number;
  post_id: number;
  checkin: string;
  feeling: string;
  visibility: string;
  is_comment_disabled: boolean;
  tagfriends: string[];
  total_reactions: number;
  total_comments: number;
  total_shares: number;
  reaction_counts: {
    [key: string]: number;
  };
  preview_comment: {
    id: number;
    user_id: string;
    post_id: string;
    likes_count: number;
    parent_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user: {
      id: string;
      username: string;
      avatar: string;
      first_name: string;
      last_name: string;
    };
  };
}